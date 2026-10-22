import { bookingServices, bookingTimes } from '../data/catalog';
import { barbers, barberName, UNASSIGNED_BARBER } from '../data/barbers';
import { unavailableBookingTimes } from '../services/bookingAvailability';
import { authRepository } from './authRepository';
import { storageService } from '../services/storageService';
import { addDays, formatDate, isPastSlot, normalize, today } from '../services/dateService';
import { reservationStatuses } from '../types/reservation';
import type { Reservation, ReservationInput, ReservationStatus } from '../types/reservation';

const STORAGE_KEY = 'machoAlfaReservations';
const LAST_CODE = 'machoAlfaLastReservationCode';
const LAST_EMAIL = 'machoAlfaLastReservationEmail';

function isReservation(value: unknown): value is Reservation {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === 'number' && Number.isFinite(row.id)
    && ['code', 'name', 'email', 'service', 'date', 'time', 'message', 'createdAt'].every(key => typeof row[key] === 'string')
    && (row.phone === undefined || typeof row.phone === 'string')
    && reservationStatuses.includes(row.status as ReservationStatus);
}

function read(): Reservation[] {
  const saved = storageService.get<unknown>(STORAGE_KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter(isReservation).map(item => ({
    ...item,
    barberId: barbers.some(barber => barber.id === item.barberId) ? item.barberId : UNASSIGNED_BARBER,
    ...(typeof item.ownerId === 'string' ? {} : { ownerId: undefined }),
    notifications: Array.isArray(item.notifications) ? item.notifications.filter(notification =>
      notification && typeof notification.message === 'string' && typeof notification.date === 'string') : [],
  }));
}

function requireAdministrator(): void {
  if (authRepository.getCurrentUser()?.role !== 'ADMIN') {
    throw new Error('Inicia sesión como personal autorizado para gestionar reservas.');
  }
}

function validate(input: ReservationInput, reservations: Reservation[], id?: number, status: ReservationStatus = 'Confirmada', keepPast = false, allowUnassigned = false) {
  if (!input.name.trim() || input.name.length > 100 || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    throw new Error('Introduce un nombre y correo válidos.');
  }
  if (input.message.length > 1000) throw new Error('El mensaje admite hasta 1000 caracteres.');
  if (!bookingServices.some(service => service.name === input.service) || !bookingTimes.includes(input.time)) {
    throw new Error('Selecciona un servicio y horario válidos.');
  }
  if (!barbers.some(barber => barber.id === input.barberId) && !(allowUnassigned && input.barberId === UNASSIGNED_BARBER)) throw new Error('Selecciona uno de los cuatro barberos.');
  const date = new Date(`${input.date}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(date.getTime()) || date.getDate() !== Number(input.date.slice(-2)) || (!keepPast && input.date < today())) {
    throw new Error('Selecciona una fecha válida a partir de hoy.');
  }
  if (!keepPast && isPastSlot(input.date, input.time)) throw new Error('Ese horario ya pasó. Selecciona una hora futura (hora de Bolivia).');
  if (date.getDay() === 0) throw new Error('La barbería no atiende los domingos.');
  if (status !== 'Cancelada' && unavailableBookingTimes(reservations, input.date, input.barberId, input.service, id).includes(input.time)) {
    throw new Error('Ese horario ya está reservado para este barbero o el servicio termina después del cierre. Elige otro.');
  }
}

function clean(input: ReservationInput): ReservationInput {
  return {
    name: input.name.trim(), email: input.email.trim(), message: input.message.trim(),
    service: input.service, barberId: input.barberId, date: input.date, time: input.time,
  };
}

export const reservationRepository = {
  list: read,
  listForAdministrator(): Reservation[] {
    requireAdministrator();
    return read();
  },
  lastLookup() {
    return { code: storageService.getText(LAST_CODE), email: storageService.getText(LAST_EMAIL) };
  },
  lastSaved(reservations = read()) {
    const code = storageService.getText(LAST_CODE);
    return reservations.find(reservation => reservation.code === code) ?? null;
  },
  create(input: ReservationInput): Reservation {
    const reservations = read();
    validate(input, reservations);
    if (input.date > addDays(today(), 7)) throw new Error('Selecciona una fecha disponible entre hoy y una semana después.');
    let code: string;
    do {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      code = 'MA-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), value => alphabet[value % alphabet.length]).join('');
    } while (reservations.some(item => item.code === code));
    const reservation: Reservation = {
      ...clean(input), id: Math.max(Date.now(), ...reservations.map(item => item.id + 1)), code,
      status: 'Confirmada', createdAt: new Date().toISOString(), updatedAt: null, notifications: [],
    };
    storageService.set(STORAGE_KEY, [...reservations, reservation]);
    try {
      storageService.setText(LAST_CODE, reservation.code);
      storageService.setText(LAST_EMAIL, reservation.email);
    } catch { /* The confirmation still shows the code if browser storage is full. */ }
    return reservation;
  },
  find(code: string, email: string, reservations = read()) {
    return reservations.find(item => normalize(item.code) === normalize(code) && normalize(item.email) === normalize(email)) ?? null;
  },
  update(id: number, input: ReservationInput, status: ReservationStatus, reason: string): Reservation {
    requireAdministrator();
    const reservations = read();
    const previous = reservations.find(item => item.id === id);
    if (!previous) throw new Error('La reserva ya no existe.');
    if (!reservationStatuses.includes(status)) throw new Error('Estado de reserva inválido.');
    const changed = previous.date !== input.date || previous.time !== input.time;
    const reactivating = previous.status === 'Cancelada' && status !== 'Cancelada' && status !== 'Atendida';
    validate(input, reservations, id, status, !changed && !reactivating, previous.barberId === UNASSIGNED_BARBER);
    const timestamp = new Date().toISOString();
    const finalStatus = changed && status === 'Confirmada' ? 'Modificada' : status;
    const notify = changed || previous.status !== finalStatus || previous.service !== input.service || previous.barberId !== input.barberId || Boolean(reason.trim());
    const updated: Reservation = {
      ...previous, ...clean(input), status: finalStatus,
      updatedAt: timestamp,
      notifications: notify ? [...previous.notifications, {
        date: timestamp,
        message: `Tu reserva ahora está ${finalStatus.toLowerCase()}.${changed ? ` Tu horario anterior era ${formatDate(previous.date)} a las ${previous.time}. El horario actualizado es ${formatDate(input.date)} a las ${input.time}.` : ''} Servicio: ${input.service}. Profesional: ${barberName(input.barberId)}.${reason.trim() ? ` Motivo: ${reason.trim().slice(0, 500)}` : ''}`,
      }] : previous.notifications,
    };
    storageService.set(STORAGE_KEY, reservations.map(item => item.id === id ? updated : item));
    if (storageService.getText(LAST_CODE) === updated.code) {
      try { storageService.setText(LAST_EMAIL, updated.email); } catch { /* Optional lookup memory. */ }
    }
    return updated;
  },
  remove(id: number) {
    requireAdministrator();
    const reservations = read();
    const deleted = reservations.find(item => item.id === id);
    storageService.set(STORAGE_KEY, reservations.filter(item => item.id !== id));
    if (deleted?.code === storageService.getText(LAST_CODE)) {
      try {
        storageService.remove(LAST_CODE);
        storageService.remove(LAST_EMAIL);
      } catch { /* A stale lookup does not restore a deleted reservation. */ }
    }
  },
};
