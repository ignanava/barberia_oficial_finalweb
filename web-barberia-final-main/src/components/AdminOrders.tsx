import { useEffect, useRef, useState } from 'react';
import { products } from '../data/catalog';
import { cartTotal, MAX_QUANTITY } from '../repositories/cartRepository';
import { orderRepository } from '../repositories/orderRepository';
import { normalize } from '../services/dateService';
import { orderStatuses } from '../types/order';
import type { Order, OrderStatus } from '../types/order';
import SectionHeading from './site/SectionHeading';
import StatusBadge from './StatusBadge';

function OrderEditor({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const [customer, setCustomer] = useState({ name: order.name, email: order.email, message: order.message });
  const [items, setItems] = useState(order.items);
  const [status, setStatus] = useState(order.status);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const closed = order.status === 'Cancelado' || order.status === 'Entregado';
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog className="reservation-dialog" ref={dialog} aria-labelledby="order-edit-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-card order-modal"><button className="modal-close" type="button" aria-label="Cerrar pedido" onClick={onClose}>×</button>
      <span className="section-kicker">{order.code}</span><h2 id="order-edit-title">{closed ? 'Detalle del pedido' : 'Editar pedido'}</h2>
      <form className="edit-form" onSubmit={event => {
        event.preventDefault();
        if (closed) return;
        if (status === 'Cancelado' && !window.confirm('¿Cancelar este pedido? Se conservará su historial.')) return;
        try { orderRepository.update(order.id, customer, items, status, reason); onSaved(); onClose(); }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el pedido.'); }
      }}>
        <fieldset disabled={closed} className="order-fieldset">
          <div className="field"><label htmlFor="edit-order-name">Nombre del cliente</label><input id="edit-order-name" required maxLength={100} value={customer.name} onChange={event => setCustomer({ ...customer, name: event.target.value })} /></div>
          <div className="field"><label htmlFor="edit-order-email">Correo del cliente</label><input id="edit-order-email" type="email" required maxLength={254} value={customer.email} onChange={event => setCustomer({ ...customer, email: event.target.value })} /></div>
          <div className="field"><label htmlFor="edit-order-message">Indicaciones del cliente</label><textarea id="edit-order-message" maxLength={1000} rows={2} value={customer.message} onChange={event => setCustomer({ ...customer, message: event.target.value })} /></div>
          <h3>Productos</h3>
          {products.filter(product => !closed || items.some(item => item.product === product.name)).map(product => <div className="order-product-edit" key={product.name}><label htmlFor={`quantity-${products.indexOf(product)}`}>{product.name}<small>Bs {items.find(item => item.product === product.name)?.price ?? product.price} / unidad</small></label>
            <input id={`quantity-${products.indexOf(product)}`} type="number" required min={0} max={MAX_QUANTITY} step={1} value={items.find(item => item.product === product.name)?.quantity ?? 0} onChange={event => {
              const quantity = Number(event.target.value);
              setItems([...items.filter(item => item.product !== product.name), ...(quantity > 0 ? [{ product: product.name, price: product.price, quantity }] : [])]);
            }} />
          </div>)}
          <div className="order-total"><span>Total del pedido</span><strong>Bs {cartTotal(items)}</strong></div>
          <div className="field"><label htmlFor="edit-order-status">Estado del pedido</label><select id="edit-order-status" value={status} onChange={event => setStatus(event.target.value as OrderStatus)}>{orderStatuses.map(status => <option key={status}>{status}</option>)}</select></div>
          {!closed && <div className="field"><label htmlFor="edit-order-reason">Motivo o aviso para el cliente</label><textarea id="edit-order-reason" rows={2} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} /></div>}
        </fieldset>
        {closed ? <p>Pedido cerrado. Se conserva el detalle y su historial.</p> : <button className="btn" type="submit">Guardar pedido</button>}
        {error && <p className="lookup-error" role="alert">{error}</p>}
      </form>
      <button className="text-button" type="button" onClick={onClose}>{closed ? 'Cerrar detalle' : 'Volver sin guardar'}</button>
      <details className="order-history"><summary>Historial del pedido</summary><ol>{order.history.map((item, index) => <li key={`${item.date}-${index}`}><time>{new Date(item.date).toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}</time><p>{item.message}</p></li>)}</ol></details>
    </div>
  </dialog>;
}

export default function AdminOrders({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [editing, setEditing] = useState<Order | null>(null);
  const [message, setMessage] = useState('');
  const filtered = orders.filter(order => (status === 'Todos' || order.status === status) && normalize(`${order.code} ${order.name} ${order.email}`).includes(normalize(search)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <section className="admin-section" id="admin-pedidos"><div className="container">
    <SectionHeading kicker="TIENDA" title="Gestión de pedidos" description="Revisa los productos, ajusta cantidades y acompaña cada pedido hasta su entrega." light />
    <div className="admin-panel"><div className="admin-toolbar">
      <div><small>PEDIDOS</small><strong>{orders.length}</strong></div>
      <input type="search" aria-label="Buscar pedidos" placeholder="Código, nombre o correo" value={search} onChange={event => setSearch(event.target.value)} />
      <select aria-label="Filtrar pedidos por estado" value={status} onChange={event => setStatus(event.target.value)}><option>Todos</option>{orderStatuses.map(status => <option key={status}>{status}</option>)}</select>
    </div>
    {message && <p className="admin-feedback" role="status">{message}</p>}
    <div className="table-wrapper" role="region" aria-label="Pedidos, desplaza para ver todas las columnas" tabIndex={0}><table className="reservation-table"><thead><tr>{['Pedido', 'Cliente', 'Productos', 'Total', 'Estado', 'Acciones'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{!filtered.length ? <tr><td colSpan={6}>No hay pedidos que coincidan. Los pedidos registrados en la tienda aparecerán aquí.</td></tr> : filtered.map(order => <tr key={order.id}>
        <td><strong>{order.code}</strong><br /><small>{new Date(order.createdAt).toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', day: '2-digit', month: '2-digit', year: 'numeric' })}</small></td>
        <td>{order.name}<br /><small>{order.email}</small></td>
        <td>{order.items.map(item => <div key={item.product}>{item.quantity} × {item.product}</div>)}</td>
        <td className="nowrap">Bs {order.total}</td><td><StatusBadge status={order.status} /></td>
        <td><button type="button" className="table-btn edit-btn" aria-label={`Gestionar pedido ${order.code}`} onClick={() => setEditing(order)}>{order.status === 'Cancelado' || order.status === 'Entregado' ? 'Ver detalle' : 'Gestionar'}</button></td>
      </tr>)}</tbody>
    </table></div></div>
    {editing && <OrderEditor key={editing.id} order={editing} onClose={() => setEditing(null)} onSaved={() => { onRefresh(); setMessage('Pedido actualizado. El cambio aparecerá en el detalle del pedido del cliente.'); }} />}
  </div></section>;
}
