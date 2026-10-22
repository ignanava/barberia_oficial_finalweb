import { useEffect, useState } from 'react';
import { orderRepository } from '../repositories/orderRepository';
import type { Order, OrderStatus } from '../types/order';
import ShoppingCartIcon from './ShoppingCartIcon';
import StatusBadge from './StatusBadge';

const statusMessages: Record<OrderStatus, string> = {
  Pendiente: 'Tu pedido está registrado y pendiente de preparación.',
  'En preparación': 'Estamos preparando tus productos. Espera a que el pedido esté listo para recoger.',
  'Listo para recoger': 'Tu pedido está listo. Puedes recogerlo y pagarlo en la barbería, de lunes a sábado, de 09:00 a 20:00.',
  Entregado: 'Este pedido ya fue entregado. Gracias por tu compra.',
  Cancelado: 'Este pedido está cancelado. Ya no está pendiente de preparación ni de recogida.',
};

export default function OrderLookup({ latestOrder }: { latestOrder: Order | null }) {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState<{ code: string; email: string } | null>(null);
  const [found, setFound] = useState<Order | null>(null);
  const displayed = query ? found : latestOrder;
  useEffect(() => {
    const sync = () => { if (query) setFound(orderRepository.find(query.code, query.email)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [query]);
  return <section className="order-lookup" id="mi-pedido" tabIndex={-1} aria-labelledby="order-lookup-title">
    <span className="section-kicker">SEGUIMIENTO</span><h2 className="order-section-title" id="order-lookup-title"><ShoppingCartIcon />Mi pedido</h2>
    <p>{query ? 'Resultado de tu consulta.' : latestOrder ? 'Tu último pedido se guarda aquí automáticamente en este navegador.' : 'Cuando confirmes un pedido, sus datos y estado aparecerán aquí.'}</p>
    <div aria-live="polite">{query && !found && <p className="lookup-error">No encontramos un pedido con ese código y correo. Revisa los datos e inténtalo de nuevo.</p>}
      {displayed && <article className="reservation-result-card">
        <div className="reservation-result-top"><h3>{displayed.code}</h3><StatusBadge status={displayed.status} /></div>
        <p>{displayed.name} · {displayed.email}</p>
        <ul className="order-lines">{displayed.items.map(item => <li key={item.product}><span>{item.quantity} × {item.product}</span><strong>Bs {item.quantity * item.price}</strong></li>)}</ul>
        <p className="order-total">Total del pedido: <strong>Bs {displayed.total}</strong></p>
        <p className="reservation-state-note">{statusMessages[displayed.status]}</p>
        {!['Entregado', 'Cancelado'].includes(displayed.status) && <p>Pago en el local al recoger. No se ha realizado ningún cobro en línea.</p>}
        {displayed.message && <p><strong>Tus indicaciones:</strong> {displayed.message}</p>}
        {displayed.history.length > 1 && <div className="client-notification"><strong>Última actualización</strong><p>{displayed.history.at(-1)?.message}</p></div>}
        <a className="text-button" href="/#contacto">Contactar por este pedido</a>
      </article>}
    </div>
    {query && latestOrder && <button className="text-button return-latest-order" type="button" onClick={() => setQuery(null)}>Volver a mi último pedido</button>}
    <details className="order-search" open={query ? true : undefined}>
      <summary>{latestOrder ? 'Consultar otro pedido' : 'Ya tengo un código de pedido'}</summary>
      <form className="lookup-form" onSubmit={event => { event.preventDefault(); setQuery({ code, email }); setFound(orderRepository.find(code, email)); }}>
        <div className="field"><label htmlFor="order-code">Código de pedido</label><input id="order-code" required maxLength={30} placeholder="PED-XXXXXXXX" value={code} onChange={event => setCode(event.target.value)} /></div>
        <div className="field"><label htmlFor="order-email">Correo electrónico</label><input id="order-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></div>
        <button className="btn" type="submit">Consultar pedido</button>
      </form>
    </details>
  </section>;
}
