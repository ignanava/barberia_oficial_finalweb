import { useState } from 'react';
import type { Barber } from '../data/barbers';

export default function BarberPortrait({ barber }: { barber: Barber }) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  return <div className="barber-portrait">
    {barber.photo && failedPhoto !== barber.photo ? <img src={barber.photo} alt={barber.name} loading="lazy" onError={() => setFailedPhoto(barber.photo)} /> : <div className="barber-photo-placeholder" role="img" aria-label={`Espacio para la foto de ${barber.name}`}>
      <span className="portrait-corner portrait-corner-top" aria-hidden="true" />
      <svg viewBox="0 0 120 140" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false"><circle cx="60" cy="44" r="23" /><path d="M18 122v-12a42 42 0 0 1 84 0v12M41 78l19 20 19-20M60 98v24" /></svg>
      <span className="portrait-photo-label">FOTO DEL BARBERO</span>
      <span className="portrait-corner portrait-corner-bottom" aria-hidden="true" />
    </div>}
    <span className="barber-portrait-number" aria-hidden="true">{barber.id.slice(-2)}</span>
  </div>;
}
