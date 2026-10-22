import { useEffect, useState } from 'react';
import { addDays, formatDate, today } from '../services/dateService';
import { availableBookingDates, unavailableBookingTimes } from '../services/bookingAvailability';
import { bookingServices } from '../data/catalog';
import { barberName } from '../data/barbers';
import type { Reservation, ReservationInput } from '../types/reservation';
import ReservationFields from './ReservationFields';

const empty: ReservationInput = { name: '', email: '', service: '', barberId: '', date: '', time: '', message: '' };

interface Props {
  reservations: Reservation[];
  onCreate: (input: ReservationInput) => Reservation;
  input: ReservationInput;
  onInputChange: (input: ReservationInput) => void;
}

export default function BookingSection({ reservations, onCreate, input, onInputChange }: Props) {
  const [status, setStatus] = useState({ message: '', error: false });
  const [createdCode, setCreatedCode] = useState('');
  const [, refreshAvailability] = useState(0);
  const dates = availableBookingDates(reservations, input.barberId, input.service);
  const chosenService = bookingServices.find(service => service.name === input.service);

  useEffect(() => {
    const refresh = () => refreshAvailability(value => value + 1);
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    if (createdCode) {
      const reservation = document.getElementById('mi-reserva');
      reservation?.focus({ preventScroll: true });
      reservation?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  }, [createdCode]);

  return <section className="booking-section" id="reservar"><div className="container booking-grid">
    <div className="booking-copy"><span className="section-kicker">RESERVA EN LÍNEA</span><h2>Agenda tu visita</h2><p>Elige tu servicio o combo y tu barbero. Después selecciona el día y la hora que mejor te vengan. No necesitas crear una cuenta.</p>
      <ul><li>Fechas disponibles durante la próxima semana</li><li>Tu turno guardado en Mi reserva</li><li>Avisos si cambia tu horario</li><li>Control de horarios ocupados</li></ul>
    </div>
    <div><form className="booking-form" onFocus={() => refreshAvailability(value => value + 1)} onSubmit={event => {
      event.preventDefault();
      try {
        const reservation = onCreate(input);
        onInputChange(empty);
        setStatus({ message: `Reserva registrada correctamente. Código: ${reservation.code}`, error: false });
        setCreatedCode(reservation.code);
      } catch (cause) { setStatus({ message: cause instanceof Error ? cause.message : 'No se pudo registrar la reserva.', error: true }); }
    }}>
      <ReservationFields prefix="booking" value={input} onChange={onInputChange} availableDates={dates} unavailableTimes={unavailableBookingTimes(reservations, input.date, input.barberId, input.service)} />
      {chosenService && <div className="booking-selection-summary field-full"><div><strong>{chosenService.name}</strong><span>{input.barberId ? barberName(input.barberId) : 'Elige tu barbero'} · {chosenService.duration} min aprox.</span></div><strong>Bs {chosenService.price}</strong></div>}
      <p className="booking-hint field-full">Fechas del {formatDate(today())} al {formatDate(addDays(today(), 7))}, inclusive. Hora de Bolivia. Solo se muestran días con turnos libres; domingos cerrado.</p>
      {input.service && input.barberId && dates.length === 0 && <p className="field-full availability-notice" role="status">Este barbero no tiene turnos libres para tu servicio en este período. Puedes elegir otro profesional arriba o volver a consultar más adelante.</p>}
      <button className="btn field-full" type="submit" disabled={dates.length === 0}>Confirmar reserva</button>
      <p className={`form-status field-full ${status.error ? 'text-error' : 'text-success'}`} role="status">{status.message}</p>
      {createdCode && !status.error && <a className="booking-result-link field-full" href="#mi-reserva">Ver los datos de mi reserva →</a>}
    </form>
    </div>
  </div></section>;
}
