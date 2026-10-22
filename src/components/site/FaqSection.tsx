const questions = [
  { question: '¿Cómo reservo una visita?', answer: 'Elige un servicio o combo, selecciona uno de los cuatro barberos y escoge una fecha y hora disponibles. Completa tu nombre y correo y pulsa «Confirmar reserva». Tus datos aparecerán automáticamente en «Mi reserva».' },
  { question: '¿Puedo elegir a mi barbero?', answer: 'Sí. Puedes elegirlo desde las fichas del equipo o en el formulario de reserva. Las fechas y horas se ajustan al profesional elegido y al tiempo necesario para tu servicio.' },
  { question: '¿Con cuánta anticipación puedo reservar?', answer: 'Puedes reservar desde hoy hasta siete días después, inclusive. El desplegable muestra los días con turnos libres. Atendemos de lunes a sábado, de 09:00 a 20:00, en hora de Bolivia. Los domingos permanecemos cerrados.' },
  { question: '¿Qué incluye el precio de un combo?', answer: 'Incluye todos los servicios que aparecen en su tarjeta. El ahorro se calcula respecto al precio de esos mismos servicios por separado. Puedes seleccionar el combo directamente y reservarlo en una sola visita.' },
  { question: '¿Cuánto tiempo debo reservar para mi servicio?', answer: 'El formulario muestra la duración aproximada del servicio elegido. Los combos duran unos 90 minutos y el sistema deja libre el tiempo necesario con tu barbero. Ven unos minutos antes para empezar con tranquilidad.' },
  { question: '¿Necesito una cuenta o pagar al reservar?', answer: 'No necesitas crear una cuenta. Para reservar solo te pedimos nombre y correo, además de los datos de tu visita. El pago se realiza en la barbería; la página no hace cobros en línea.' },
  { question: '¿Dónde veo mi reserva y cómo solicito un cambio?', answer: 'Abre «Mi reserva» en el mismo navegador donde reservaste: verás los datos de tu última visita sin hacer una búsqueda. Si necesitas cambiar el servicio, barbero u horario, contacta con la barbería e indica tu código de reserva para que el personal gestione el cambio.' },
  { question: '¿Cómo recibo los productos que pido?', answer: 'Añade los productos al carrito, revisa las cantidades y confirma el pedido. Tu último pedido y su estado aparecerán automáticamente en el carrito de este navegador. Cuando figure «Listo para recoger», pasa por la barbería y paga en el local. También puedes consultar pedidos anteriores con su código y correo.' },
];

export default function FaqSection() {
  return <section className="section faq-section" id="preguntas"><div className="container faq-layout">
    <div className="faq-intro"><span className="section-kicker">PREGUNTAS FRECUENTES</span><h2>Resolvemos tus dudas</h2><p>Todo lo que necesitas saber para reservar, elegir tu servicio y disfrutar tu visita.</p><a className="faq-contact-link" href="#contacto">¿Te queda alguna duda? Contáctanos <span aria-hidden="true">↗</span></a></div>
    <div className="faq-list">{questions.map((item, index) => <details className="faq-item" key={item.question}>
      <summary><span className="faq-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item.question}</span><span className="faq-toggle" aria-hidden="true" /></summary><p>{item.answer}</p>
    </details>)}</div>
  </div></section>;
}
