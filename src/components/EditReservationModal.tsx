import { useEffect, useRef, useState } from 'react';
import type { Reservation, ReservationInput, ReservationStatus } from '../types/reservation';
import { reservationStatuses } from '../types/reservation';
import ReservationFields from './ReservationFields';
import { unavailableBookingTimes } from '../services/bookingAvailability';

interface Props {
  reservation: Reservation;
  reservations: Reservation[];
  onClose: () => void;
  onSave: (id: number, input: ReservationInput, status: ReservationStatus, reason: string) => void;
}

export default function EditReservationModal({ reservation, reservations, onClose, onSave }: Props) {
  const [input, setInput] = useState<ReservationInput>(reservation);
  const [status, setStatus] = useState(reservation.status);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className="reservation-dialog" aria-labelledby="edit-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-card"><button className="modal-close" type="button" aria-label="Cerrar edición" onClick={onClose}>×</button><h2 id="edit-title">Editar reserva</h2>
      <form className="edit-form" onSubmit={event => {
        event.preventDefault();
        try { onSave(reservation.id, input, status, reason); onClose(); }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron guardar los cambios.'); }
      }}>
        <ReservationFields prefix="edit" value={input} onChange={setInput} originalDate={reservation.date} unavailableTimes={status === 'Cancelada' ? [] : unavailableBookingTimes(reservations, input.date, input.barberId, input.service, reservation.id)} />
        <div className="field"><label htmlFor="editStatus">Estado</label><select id="editStatus" value={status} onChange={event => setStatus(event.target.value as ReservationStatus)}>{reservationStatuses.map(value => <option key={value}>{value}</option>)}</select></div>
        <div className="field"><label htmlFor="editReason">Motivo o aviso para el cliente</label><textarea id="editReason" rows={3} maxLength={500} placeholder="Ej. El barbero no estará disponible a esa hora" value={reason} onChange={event => setReason(event.target.value)} /></div>
        <button className="btn" type="submit">Guardar cambios</button><p className="form-status text-error" role="alert">{error}</p>
        <button className="text-button" type="button" onClick={onClose}>Volver sin guardar</button>
      </form>
    </div>
  </dialog>;
}
