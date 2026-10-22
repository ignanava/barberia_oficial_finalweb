import { barbers } from '../../data/barbers';
import BarberPortrait from '../BarberPortrait';
import SectionHeading from './SectionHeading';

export default function BarbersSection({ selectedBarber, onSelect }: { selectedBarber: string; onSelect: (id: string) => void }) {
  return <section className="section barbers-section" id="barberos"><div className="container">
    <SectionHeading kicker="EL EQUIPO MACHO ALFA" title="Elige quién cuida tu estilo" description="Cuatro profesionales, una misma atención al detalle. Elige tu barbero y consulta sus horarios al reservar." />
    <div className="barbers-grid">{barbers.map(barber => <article className={`barber-card${selectedBarber === barber.id ? ' barber-card-selected' : ''}`} key={barber.id}>
      <BarberPortrait barber={barber} />
      <div className="barber-card-body"><span className="barber-role">EQUIPO MACHO ALFA</span><h3>{barber.name}</h3><p>Cortes, barba y cuidado de tu imagen.</p>
        <a className="barber-select-link" href="#reservar" onClick={() => onSelect(barber.id)} aria-label={`Elegir a ${barber.name}`}>{selectedBarber === barber.id ? 'Seleccionado' : 'Reservar con este barbero'}<span aria-hidden="true">{selectedBarber === barber.id ? '✓' : '↗'}</span></a>
      </div>
    </article>)}</div>
  </div></section>;
}
