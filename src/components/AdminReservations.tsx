import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, normalize } from '../services/dateService';
import type { User } from '../types/auth';
import type { Reservation, ReservationInput, ReservationStatus } from '../types/reservation';
import { reservationStatuses } from '../types/reservation';
import EditReservationModal from './EditReservationModal';
import SectionHeading from './site/SectionHeading';
import { barbers, barberName } from '../data/barbers';
import StatusBadge from './StatusBadge';

interface Props {
  user: User | null;
  reservations: Reservation[];
  onLogout: () => void;
  onUpdate: (id: number, input: ReservationInput, status: ReservationStatus, reason: string) => void;
  onRemove: (id: number) => void;
}

export default function AdminReservations({ user, reservations, onLogout, onUpdate, onRemove }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [dateFilter, setDateFilter] = useState('');
  const [barberFilter, setBarberFilter] = useState('');
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const filtered = reservations.filter(item => (statusFilter === 'Todas' || item.status === statusFilter) && (!dateFilter || item.date === dateFilter) && (!barberFilter || item.barberId === barberFilter) && normalize(`${item.code} ${item.name} ${item.email} ${item.phone ?? ''} ${item.service} ${barberName(item.barberId)}`).includes(normalize(search)))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return <section className="admin-section" id="admin-reservas"><div className="container">
    <SectionHeading kicker="ADMINISTRACIÓN" title="Gestión de reservas" description="Panel interno de Macho Alfa." light />
    {user?.role !== 'ADMIN' ? <div className="admin-login"><h3>Acceso administrativo</h3><p>{user ? 'Tu cuenta no tiene permisos de administrador.' : 'Inicia sesión con tu cuenta de administrador.'}</p>
      {user ? <button className="btn" type="button" onClick={onLogout}>Cambiar de cuenta</button> : <Link className="btn" to="/login" state={{ from: '/#admin-reservas' }}>Entrar</Link>}
    </div> : <div className="admin-panel">
      <div className="admin-toolbar"><div><small>RESERVAS</small><strong id="reservationCount">{reservations.length}</strong></div><input type="search" aria-label="Buscar reservas" placeholder="Buscar cliente, correo o código" value={search} onChange={event => setSearch(event.target.value)} /><select aria-label="Filtrar reservas por estado" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>Todas</option>{reservationStatuses.map(status => <option key={status}>{status}</option>)}</select></div>
      <div className="reservation-filters"><label htmlFor="reservation-date-filter">Fecha de reserva</label><input id="reservation-date-filter" type="date" value={dateFilter} onChange={event => setDateFilter(event.target.value)} /><select aria-label="Filtrar reservas por barbero" value={barberFilter} onChange={event => setBarberFilter(event.target.value)}><option value="">Todos los barberos</option>{barbers.map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}<option value="por-asignar">Por asignar</option></select><button className="text-button" type="button" onClick={() => { setDateFilter(''); setStatusFilter('Todas'); setSearch(''); setBarberFilter(''); }}>Limpiar filtros</button><span>{filtered.length} resultados</span></div>
      {message && <p className="admin-feedback" role="status">{message}</p>}{error && <p className="lookup-error" role="alert">{error}</p>}
      <div className="table-wrapper" role="region" aria-label="Reservas, desplaza para ver todas las columnas" tabIndex={0}><table className="reservation-table"><thead><tr>{['Código', 'Cliente', 'Servicio', 'Barbero', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{filtered.length === 0 ? <tr><td colSpan={8}>No hay reservas registradas que coincidan.</td></tr> : filtered.map(reservation => <tr key={reservation.id}>
          <td><strong>{reservation.code}</strong></td><td>{reservation.name}<br /><small>{reservation.email}</small></td><td>{reservation.service}</td><td>{barberName(reservation.barberId)}</td><td>{formatDate(reservation.date)}</td><td>{reservation.time}</td><td><StatusBadge status={reservation.status} /></td>
          <td><div className="table-actions"><button className="table-btn edit-btn" type="button" aria-label={`Editar reserva ${reservation.code}`} onClick={() => setEditing(reservation)}>Editar</button>
          {reservation.status !== 'Cancelada' && reservation.status !== 'Atendida' && <button className="table-btn delete-btn" type="button" aria-label={`Cancelar reserva ${reservation.code}`} onClick={() => {
            if (!window.confirm('¿Cancelar esta reserva y liberar su horario?')) return;
            try { onUpdate(reservation.id, reservation, 'Cancelada', 'Cancelada por el personal.'); setMessage('Reserva cancelada. El horario vuelve a estar disponible.'); setError(''); }
            catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo cancelar la reserva.'); }
          }}>Cancelar</button>}
          <button className="table-btn delete-btn" type="button" aria-label={`Eliminar reserva ${reservation.code}`} onClick={() => {
            if (!window.confirm('¿Seguro que quieres eliminar esta reserva?')) return;
            try { onRemove(reservation.id); setMessage('Reserva eliminada.'); setError(''); }
            catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la reserva.'); }
          }}>Eliminar</button></div></td>
        </tr>)}</tbody>
      </table></div>
      {editing && <EditReservationModal key={editing.id} reservation={editing} reservations={reservations} onClose={() => setEditing(null)} onSave={(id, input, status, reason) => {
        onUpdate(id, input, status, reason);
        setMessage(editing.date !== input.date || editing.time !== input.time ? 'Cambios guardados. El cliente verá el aviso en Mi reserva.' : 'Cambios guardados correctamente.');
        setError('');
      }} />}
    </div>}
  </div></section>;
}
