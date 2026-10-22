import { bookingTimes, serviceDuration } from '../data/catalog';
import { UNASSIGNED_BARBER } from '../data/barbers';
import type { Reservation } from '../types/reservation';
import { addDays, isPastSlot, today } from './dateService';

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

export function slotIsOccupied(reservations: Reservation[], date: string, time: string, barberId: string, service: string, excludeId?: number) {
  const start = minutes(time);
  const end = start + serviceDuration(service);
  return reservations.some(reservation => reservation.id !== excludeId && reservation.date === date && reservation.status !== 'Cancelada'
    && (reservation.barberId === barberId || reservation.barberId === UNASSIGNED_BARBER || !reservation.barberId || barberId === UNASSIGNED_BARBER)
    && start < minutes(reservation.time) + serviceDuration(reservation.service) && end > minutes(reservation.time));
}

export function unavailableBookingTimes(reservations: Reservation[], date: string, barberId: string, service: string, excludeId?: number) {
  return bookingTimes.filter(time => minutes(time) + serviceDuration(service) > 20 * 60 || slotIsOccupied(reservations, date, time, barberId, service, excludeId));
}

export function availableBookingDates(reservations: Reservation[], barberId: string, service: string) {
  const start = today();
  return Array.from({ length: 8 }, (_, offset) => addDays(start, offset)).filter(date => {
    if (new Date(`${date}T12:00:00Z`).getUTCDay() === 0) return false;
    const unavailable = unavailableBookingTimes(reservations, date, barberId, service);
    return bookingTimes.some(time => !isPastSlot(date, time) && !unavailable.includes(time));
  });
}
