import { comboRegularPrice, combos } from '../../data/catalog';
import SectionHeading from './SectionHeading';

export default function CombosSection({ onSelect }: { onSelect: (service: string) => void }) {
  return <section className="section combos-section" id="combos"><div className="container">
    <SectionHeading kicker="MÁS ESTILO EN UNA VISITA" title="Combina. Cuida. Ahorra." description="Servicios que se complementan, con un precio cerrado y tiempo para cuidar cada detalle." light />
    <div className="combos-grid">{combos.map((combo, index) => <article className={`combo-card${index === 1 ? ' combo-card-accent' : ''}`} key={combo.id}>
      <div className="combo-card-top"><span className="combo-tag">{combo.tag}</span><span className="combo-number" aria-hidden="true">0{index + 1}</span></div>
      <h3>{combo.title}</h3><p className="combo-description">{combo.description}</p>
      <ul className="combo-includes">{combo.includes.map(service => <li key={service}><span aria-hidden="true">✓</span>{service}</li>)}</ul>
      <div className="combo-price"><div><span className="combo-price-label">PRECIO DEL COMBO</span><strong>Bs {combo.price}</strong></div><span className="combo-saving">Ahorras Bs {comboRegularPrice(combo) - combo.price}</span></div>
      <p className="combo-regular-price">Por separado: <s>Bs {comboRegularPrice(combo)}</s> · {combo.duration} min aprox.</p>
      <a href="#reservar" className={`btn ${index === 1 ? '' : 'btn-outline'}`} onClick={() => onSelect(combo.name)} aria-label={`Reservar ${combo.title}`}>Elegir este combo <span aria-hidden="true">↗</span></a>
    </article>)}</div>
    <p className="combos-note">Todos los combos son servicios en la barbería. El precio incluye los servicios indicados y se paga en el local.</p>
  </div></section>;
}
