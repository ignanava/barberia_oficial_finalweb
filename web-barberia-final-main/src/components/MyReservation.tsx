import { formatDate, isPastSlot } from '../services/dateService';
import type { Reservation } from '../types/reservation';
import SectionHeading from './site/SectionHeading';
import { barberName } from '../data/barbers';
import { bookingServices } from '../data/catalog';
import StatusBadge from './StatusBadge';

export default function MyReservation({ reservation }: { reservation: Reservation | null }) {
  const notification = reservation?.notifications.at(-1);
  const service = bookingServices.find(item => item.name === reservation?.service);
  const past = reservation && isPastSlot(reservation.date, reservation.time);
  return <section className="section lookup-section" id="mi-reserva" tabIndex={-1} aria-label="Mi reserva"><div className="container">
    <SectionHeading kicker="DETALLES DE TU VISITA" title="Mi reserva" description="Aquí se guarda automáticamente la última reserva que realizaste en este navegador." />
    <div className="lookup-container" id="clientReservationResult" aria-live="polite">
      {reservation ? <article className="reservation-result-card">
        <div className="reservation-result-top"><div><span className="reservation-code">{reservation.code}</span><h3>{reservation.name}</h3></div><StatusBadge status={reservation.status} /></div>
        <dl className="reservation-result-grid my-reservation-details">
          {[
            ['Nombre completo', reservation.name], ['Correo electrónico', reservation.email],
            ['Servicio', reservation.service], ['Barbero', barberName(reservation.barberId)], ['Fecha', formatDate(reservation.date)], ['Hora (Bolivia)', reservation.time],
          ].map(([label, value]) => <div className="reservation-item" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          <div className="reservation-item reservation-message"><dt>Mensaje</dt><dd>{reservation.message || 'Sin indicaciones adicionales.'}</dd></div>
        </dl>
        {service && <div className="reservation-price-summary"><span>{service.duration} minutos aprox.</span><strong>Precio del servicio: Bs {service.price}</strong></div>}
        {reservation.status === 'Cancelada' ? <p className="reservation-state-note">Esta reserva está cancelada. Puedes agendar una nueva visita cuando lo necesites.</p>
          : reservation.status === 'Atendida' ? <p className="reservation-state-note">Gracias por tu visita. Te esperamos en tu próximo corte.</p>
            : past ? <p className="reservation-state-note">La hora de inicio de esta reserva ya pasó. El personal actualizará su estado de atención.</p>
              : <p className="reservation-state-note">Tu turno está reservado. El pago del servicio se realiza en la barbería.</p>}
        {notification && <div className="client-notification"><strong>Aviso de Macho Alfa</strong><p>{notification.message}</p></div>}
        <div className="reservation-result-actions"><a href="#contacto" className="text-button">Contactar con la barbería</a>{(past || ['Cancelada', 'Atendida'].includes(reservation.status)) && <a href="#reservar" className="btn btn-small">Agendar otra visita</a>}</div>
      </article> : <div className="empty-state"><h3>Todavía no tienes una reserva guardada</h3><p>Completa «Agenda tu visita» y los datos de tu turno aparecerán aquí.</p><a href="#reservar" className="btn">Agendar mi visita</a></div>}
    </div>
  </div></section>;
}
