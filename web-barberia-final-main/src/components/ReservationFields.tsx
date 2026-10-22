import { bookingServices, bookingTimes, combos, prices } from '../data/catalog';
import { barbers, UNASSIGNED_BARBER } from '../data/barbers';
import { formatDate, isPastSlot, today } from '../services/dateService';
import type { ReservationInput } from '../types/reservation';

interface Props {
  value: ReservationInput;
  onChange: (value: ReservationInput) => void;
  prefix: string;
  originalDate?: string;
  unavailableTimes?: string[];
  availableDates?: string[];
}

export default function ReservationFields({ value, onChange, prefix, originalDate, unavailableTimes = [], availableDates }: Props) {
  const change = (key: keyof ReservationInput, text: string) => onChange({ ...value, [key]: text });
  const choosingVisit = availableDates !== undefined;
  const readyForDate = !choosingVisit || Boolean(value.service && value.barberId);
  const validDate = !choosingVisit || availableDates.includes(value.date);
  return <>
    <div className="field"><label htmlFor={`${prefix}-service`}>Servicio o combo</label>
      <select id={`${prefix}-service`} name="service" required value={value.service} onChange={event => onChange({ ...value, service: event.target.value, date: originalDate ? value.date : '', time: '' })}>
        <option value="">Selecciona un servicio o combo</option>
        <optgroup label="Servicios">{prices.map(service => <option key={service.name} value={service.name}>{service.name} — Bs {service.price}</option>)}</optgroup>
        <optgroup label="Combos">{combos.map(service => <option key={service.name} value={service.name}>{service.name} — Bs {service.price}</option>)}</optgroup>
      </select>
    </div>
    <div className="field"><label htmlFor={`${prefix}-barber`}>Tu barbero</label><select id={`${prefix}-barber`} name="barberId" required value={value.barberId} onChange={event => onChange({ ...value, barberId: event.target.value, date: originalDate ? value.date : '', time: '' })}>
      <option value="">Elige tu barbero</option>
      {originalDate && value.barberId === UNASSIGNED_BARBER && <option value={UNASSIGNED_BARBER}>Por asignar · reserva anterior</option>}
      {barbers.map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
    </select></div>
    <div className="field"><label htmlFor={`${prefix}-date`}>Fecha{availableDates ? ' (dd/mm/aaaa)' : ''}</label>
      {availableDates ? <select id={`${prefix}-date`} name="date" required disabled={!readyForDate} value={validDate ? value.date : ''} onChange={event => onChange({ ...value, date: event.target.value, time: '' })}>
        <option value="">{!readyForDate ? 'Primero elige servicio y barbero' : availableDates.length ? 'Selecciona una fecha disponible' : 'Sin turnos con este barbero esta semana'}</option>
        {readyForDate && availableDates.map(date => <option key={date} value={date}>{formatDate(date)}</option>)}
      </select> : <input type="date" id={`${prefix}-date`} name="date" min={originalDate && originalDate < today() ? originalDate : today()} required value={value.date} onChange={event => change('date', event.target.value)} />}
    </div>
    <div className="field"><label htmlFor={`${prefix}-time`}>Hora</label>
      <select id={`${prefix}-time`} name="time" required disabled={choosingVisit && (!readyForDate || !validDate)} value={unavailableTimes.includes(value.time) || (!originalDate && isPastSlot(value.date, value.time)) ? '' : value.time} onChange={event => change('time', event.target.value)}>
        <option value="">{choosingVisit && (!readyForDate || !validDate) ? 'Primero selecciona una fecha' : 'Selecciona una hora'}</option>
        {bookingTimes.map(time => {
          const unavailable = unavailableTimes.includes(time) || (!originalDate && value.date !== '' && isPastSlot(value.date, time));
          return <option key={time} value={time} disabled={unavailable}>{time}{unavailable ? ' · No disponible' : ''}</option>;
        })}
      </select>
    </div>
    {value.service && <p className="field-full booking-hint">Duración aproximada: {bookingServices.find(service => service.name === value.service)?.duration ?? 60} minutos. La hora indicada es la de inicio.</p>}
    {([
      ['name', 'Nombre completo', 'text', 'Tu nombre'],
      ['email', 'Correo electrónico', 'email', 'correo@ejemplo.com'],
    ] as const).map(([key, label, type, placeholder]) => <div className="field" key={key}>
      <label htmlFor={`${prefix}-${key}`}>{label}</label>
      <input id={`${prefix}-${key}`} name={key} type={type} autoComplete={key} maxLength={key === 'name' ? 100 : 254} placeholder={placeholder} required value={value[key]} onChange={event => change(key, event.target.value)} />
    </div>)}
    <div className="field field-full"><label htmlFor={`${prefix}-message`}>Mensaje (opcional)</label><textarea id={`${prefix}-message`} name="message" rows={4} maxLength={1000} placeholder="Estilo deseado o indicaciones" value={value.message} onChange={event => change('message', event.target.value)} /></div>
  </>;
}
