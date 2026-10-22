import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types/auth';
import { useCart } from '../../hooks/useCart';
import { cartCount } from '../../repositories/cartRepository';
import ShoppingCartIcon from '../ShoppingCartIcon';

const links = [
  ['servicios', 'Servicios'], ['combos', 'Combos'], ['productos', 'Productos'],
  ['barberos', 'Barberos'], ['reservar', 'Reservar'], ['mi-reserva', 'Mi reserva'], ['contacto', 'Contacto'],
];

export default function SiteHeader({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 30);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!navigation.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return <>
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <header className="topbar"><div className="container topbar-content">
      <div><strong>Llámanos: </strong><a href="tel:+59172800000">+591 728 00000</a></div>
      <div><strong>Horario: </strong>Lunes a sábado · 09:00 a 20:00</div>
    </div></header>
    <nav ref={navigation} className={`navbar${scrolled ? ' navbar-scrolled' : ''}`} aria-label="Navegación principal">
      <div className="container nav-content">
        <Link to="/#inicio" className="brand" aria-label="Macho Alfa, inicio" onClick={() => setOpen(false)}>
          <div className="logo-box"><span id="logoFallback">MA</span></div>
          <div className="brand-text"><span>MACHO</span><strong>ALFA</strong></div>
        </Link>
        <div className={`nav-links${open ? ' active' : ''}`} id="navLinks">
          {links.map(([id, label]) => <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)}>{label}</Link>)}
        </div>
        <div className="nav-actions">
          <Link className="cart-link" to="/carrito" onClick={() => setOpen(false)} aria-label={`Carrito, ${cartCount(cart)} ${cartCount(cart) === 1 ? 'unidad' : 'unidades'}`}><ShoppingCartIcon /><span className="cart-label">Carrito</span><span className="cart-count" aria-live="polite">{cartCount(cart)}</span></Link>
          <button ref={toggle} className="menu-toggle" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="navLinks" onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button>
        </div>
      </div>
    </nav>
    <div className="account-bar"><div className="container account-content">
      {user ? <><span>Hola, {user.name}</span>
        {user.role === 'ADMIN' && <Link className="btn btn-small" to="/admin">Panel administrativo</Link>}
        <button className="btn btn-small" type="button" onClick={onLogout}>Cerrar sesión</button></>
        : <Link className="btn btn-small" to="/login">Iniciar sesión · Personal</Link>}
    </div></div>
  </>;
}
