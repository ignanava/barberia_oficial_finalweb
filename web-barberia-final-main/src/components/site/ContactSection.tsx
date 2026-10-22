import SectionHeading from './SectionHeading';

export default function ContactSection() {
  return (
    <section className="section contact-section" id="contacto">
    <div className="container">
    <SectionHeading kicker="ESTAMOS PARA AYUDARTE" title="Contacto y horarios" />
    <div className="contact-grid">
    <div className="contact-card">
    <h3> Macho Alfa </h3>
    <div className="contact-item">
    <div>
    <strong> Ubicación </strong>
    <p> Sucre, Chuquisaca, Bolivia </p>
    </div>
    </div>
    <div className="contact-item">
    <div>
    <strong> Teléfono </strong>
    <p><a href="tel:+59172800000">+591 728 00000</a></p>
    </div>
    </div>
    <div className="contact-item">
    <div>
    <strong> Correo </strong>
    <p><a href="mailto:contacto@machoalfa.com">contacto@machoalfa.com</a></p>
    </div>
    </div>
    </div>
    <div className="hours-card">
    <h3> Horarios </h3>
    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
      <div className="hours-row" key={day}><span>{day}</span><strong>09:00 - 20:00</strong></div>
    ))}
    <div className="hours-row closed">
    <span>Domingo</span>
    <strong>Cerrado</strong>
    </div>
    </div>
    </div>
    </div>
    </section>
  );
}
