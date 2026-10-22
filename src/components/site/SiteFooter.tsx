import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="footer">
    <div className="container footer-grid">
    <div>
    <h3> MACHO ALFA </h3>
    <p> Barbería · Estilo · Cuidado masculino. </p>
    </div>
    <div>
    <h4> Enlaces </h4>
    <Link to="/#servicios">Servicios</Link>
    <Link to="/#precios">Precios</Link>
    <Link to="/#combos">Combos</Link>
    <Link to="/#barberos">Nuestro equipo</Link>
    <Link to="/#productos">Productos</Link>
    <Link to="/#reservar">Reservar</Link>
    <Link to="/carrito">Carrito y pedidos</Link>
    <Link to="/#preguntas">Preguntas frecuentes</Link>
    </div>
    <div>
    <h4> Contacto </h4>
    <a href="tel:+59172800000">+591 728 00000</a>
    <p> Sucre, Bolivia </p>
    </div>
    </div>
    <div className="copyright"> © <span>{new Date().getFullYear()}</span> Macho Alfa </div>
    </footer>
  );
}
