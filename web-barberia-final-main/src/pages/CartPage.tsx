import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';
import OrderLookup from '../components/OrderLookup';
import ShoppingCartIcon from '../components/ShoppingCartIcon';
import { useCart } from '../hooks/useCart';
import { cartCount, cartRepository, cartTotal, MAX_QUANTITY } from '../repositories/cartRepository';
import { authRepository } from '../repositories/authRepository';
import { orderRepository } from '../repositories/orderRepository';
import { products } from '../data/catalog';
import type { OrderCustomer } from '../types/order';

export default function CartPage() {
  const cart = useCart();
  const [user, setUser] = useState(authRepository.getCurrentUser);
  const [customer, setCustomer] = useState<OrderCustomer>({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [lastOrder, setLastOrder] = useState(orderRepository.lastSaved);
  const [createdCode, setCreatedCode] = useState('');
  const [needsCartReset, setNeedsCartReset] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  const submitted = useRef(false);
  useEffect(() => {
    if (!createdCode) return;
    const details = document.getElementById('mi-pedido');
    details?.focus({ preventScroll: true });
    details?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [createdCode]);
  useEffect(() => {
    const sync = () => { setUser(authRepository.getCurrentUser()); setLastOrder(orderRepository.lastSaved()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function action(fn: () => void) {
    try { fn(); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el cambio.'); }
  }
  function clearSubmittedCart() {
    cartRepository.save([]);
    requestId.current = crypto.randomUUID();
    submitted.current = false;
    setNeedsCartReset(false);
  }
  return <>
    <SiteHeader user={user} onLogout={() => action(() => { authRepository.logout(); setUser(null); })} />
    <main className="cart-page container" id="main-content" tabIndex={-1}>
      <Link className="back-link" to="/#productos">← Seguir comprando</Link>
      <span className="section-kicker">TIENDA MACHO ALFA</span><h1 className="cart-page-title"><span className="cart-title-emblem"><ShoppingCartIcon /></span>Tu carrito</h1>
      <p className="page-intro">Tu rutina de cuidado empieza aquí. Recoge y paga tu pedido en la barbería.</p>
      {error && <p className="lookup-error" role="alert">{error}</p>}
      {needsCartReset && <button className="btn btn-small" type="button" onClick={() => action(clearSubmittedCart)}>Vaciar el carrito del pedido ya registrado</button>}
      {cart.length > 0 ? <div className="checkout-grid">
        <section className="cart-items" aria-label="Productos del carrito">
          <div className="cart-section-heading"><h2>{cartCount(cart)} {cartCount(cart) === 1 ? 'unidad' : 'unidades'}</h2><button className="text-button" type="button" onClick={() => { if (window.confirm('¿Vaciar todos los productos del carrito?')) action(clearSubmittedCart); }}>Vaciar carrito</button></div>
          {cart.map(item => <article className="cart-item" key={item.product}>
            <img src={products.find(product => product.name === item.product)?.image} alt={item.product} />
            <div className="cart-item-info"><h3>{item.product}</h3><p>Bs {item.price} / unidad</p>
              <div className="quantity-control"><button type="button" aria-label={`Reducir ${item.product}`} disabled={item.quantity <= 1} onClick={() => action(() => cartRepository.setQuantity(item.product, item.quantity - 1))}>−</button><span aria-label={`Cantidad de ${item.product}`}>{item.quantity}</span><button type="button" aria-label={`Aumentar ${item.product}`} disabled={item.quantity >= MAX_QUANTITY} onClick={() => action(() => cartRepository.setQuantity(item.product, item.quantity + 1))}>+</button></div>
              <button type="button" className="text-button" aria-label={`Quitar ${item.product}`} onClick={() => action(() => cartRepository.setQuantity(item.product, 0))}>Quitar</button>
            </div><strong className="cart-line-total">Bs {item.price * item.quantity}</strong>
          </article>)}
        </section>
        <form className="checkout-card" onSubmit={event => {
          event.preventDefault();
          if (submitted.current) return;
          try {
            const order = orderRepository.create(customer, cartRepository.list(), requestId.current);
            submitted.current = true;
            setLastOrder(order);
            setCreatedCode(order.code);
            setError('');
            try { clearSubmittedCart(); }
            catch { setNeedsCartReset(true); setError('Tu pedido está guardado, pero no se pudo vaciar el carrito. Usa el botón de arriba para limpiar los productos ya pedidos.'); }
          } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo registrar el pedido.'); }
        }}>
          <h2>Finalizar pedido</h2><p>Recogida en el local · Sin gastos de envío</p>
          <div className="order-total"><span>Total</span><strong>Bs {cartTotal(cart)}</strong></div>
          <div className="field"><label htmlFor="checkout-name">Nombre completo</label><input id="checkout-name" autoComplete="name" required maxLength={100} value={customer.name} onChange={event => setCustomer({ ...customer, name: event.target.value })} /></div>
          <div className="field"><label htmlFor="checkout-email">Correo electrónico</label><input id="checkout-email" type="email" autoComplete="email" required maxLength={254} value={customer.email} onChange={event => setCustomer({ ...customer, email: event.target.value })} /></div>
          <div className="field"><label htmlFor="checkout-message">Indicaciones (opcional)</label><textarea id="checkout-message" rows={3} maxLength={1000} value={customer.message} onChange={event => setCustomer({ ...customer, message: event.target.value })} /></div>
          <button className="btn" type="submit" disabled={needsCartReset}>Confirmar pedido · Bs {cartTotal(cart)}</button>
          <small>No necesitas una cuenta. Pagarás al recoger tu pedido.</small>
        </form>
      </div> : <div className={`empty-state${lastOrder ? ' cart-empty-compact' : ''}`}><span className="empty-cart-emblem"><ShoppingCartIcon /></span><h2>{createdCode ? 'Pedido registrado' : 'Tu carrito está vacío'}</h2><p>{createdCode ? 'Gracias por tu compra. Los datos de tu pedido están abajo.' : 'Encuentra el complemento ideal para tu cabello y barba.'}</p><Link className="btn" to="/#productos">{lastOrder ? 'Seguir comprando' : 'Explorar productos'}</Link></div>}
      <p className="local-data-note">Modo local: los pedidos se guardan y consultan en este navegador. No se envían a otros dispositivos.</p>
      <OrderLookup key={lastOrder?.id ?? 'lookup'} latestOrder={lastOrder} />
    </main><SiteFooter />
  </>;
}
