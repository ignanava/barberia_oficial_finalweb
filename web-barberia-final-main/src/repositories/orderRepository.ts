import { products } from '../data/catalog';
import { storageService } from '../services/storageService';
import { normalize } from '../services/dateService';
import { authRepository } from './authRepository';
import { cartTotal, MAX_QUANTITY } from './cartRepository';
import { orderStatuses } from '../types/order';
import type { Order, OrderCustomer, OrderStatus } from '../types/order';
import type { CartItem } from '../types/reservation';

const KEY = 'machoAlfaOrders';
const LAST_ORDER = 'machoAlfaLastOrderId';
function read(): Order[] {
  const saved = storageService.get<unknown>(KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter((row): row is Order => row && typeof row === 'object'
    && ['id', 'requestId', 'code', 'name', 'email', 'message', 'createdAt', 'updatedAt'].every(key => typeof row[key] === 'string')
    && orderStatuses.includes(row.status) && Array.isArray(row.items) && row.items.length > 0
    && row.items.every((item: CartItem) => item && typeof item.product === 'string' && Number.isFinite(item.price) && item.price >= 0
      && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_QUANTITY)
    && Number.isFinite(row.total) && row.total === cartTotal(row.items))
    .map(row => ({ ...row, history: Array.isArray(row.history) ? row.history.filter(item => item && typeof item.date === 'string' && typeof item.message === 'string') : [] }));
}
function requireAdmin() {
  if (authRepository.getCurrentUser()?.role !== 'ADMIN') throw new Error('Inicia sesión como personal autorizado para gestionar pedidos.');
}
function cleanCustomer(customer: OrderCustomer): OrderCustomer {
  if (!customer.name.trim() || customer.name.trim().length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) || customer.email.length > 254 || customer.message.length > 1000) {
    throw new Error('Introduce un nombre y correo válidos; las indicaciones admiten hasta 1000 caracteres.');
  }
  return { name: customer.name.trim(), email: customer.email.trim().toLowerCase(), message: customer.message.trim() };
}
function cleanItems(items: CartItem[]): CartItem[] {
  if (!items.length) throw new Error('Añade al menos un producto al pedido.');
  const names = new Set<string>();
  return items.map(item => {
    const product = products.find(product => product.name === item.product);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY || names.has(item.product)) {
      throw new Error(`Revisa los productos y cantidades (de 1 a ${MAX_QUANTITY}).`);
    }
    names.add(item.product);
    return { product: product.name, price: product.price, quantity: item.quantity };
  });
}
export const orderRepository = {
  listForAdministrator() { requireAdmin(); return read(); },
  lastSaved() {
    const id = storageService.getText(LAST_ORDER);
    return read().find(order => order.id === id) ?? null;
  },
  find(code: string, email: string) {
    return read().find(order => normalize(order.code) === normalize(code) && normalize(order.email) === normalize(email)) ?? null;
  },
  create(customer: OrderCustomer, items: CartItem[], requestId: string): Order {
    const orders = read();
    if (!requestId) throw new Error('No se pudo identificar el pedido. Recarga la página.');
    const existing = orders.find(order => order.requestId === requestId);
    if (existing) return existing;
    const cleaned = cleanCustomer(customer);
    const lines = cleanItems(items);
    const date = new Date().toISOString();
    let code: string;
    do { code = `PED-${crypto.randomUUID().slice(0, 8).toUpperCase()}`; } while (orders.some(order => order.code === code));
    const order: Order = { ...cleaned, id: crypto.randomUUID(), requestId, code, items: lines, total: cartTotal(lines), status: 'Pendiente', createdAt: date, updatedAt: date, history: [{ date, message: 'Pedido registrado. Recogida y pago en la barbería.' }] };
    storageService.set(KEY, [...orders, order]);
    try { storageService.setText(LAST_ORDER, order.id); } catch { /* The order remains saved even if remembering it fails. */ }
    return order;
  },
  update(id: string, customer: OrderCustomer, items: CartItem[], status: OrderStatus, reason: string): Order {
    requireAdmin();
    const orders = read();
    const previous = orders.find(order => order.id === id);
    if (!previous) throw new Error('El pedido ya no existe.');
    if (previous.status === 'Entregado' || previous.status === 'Cancelado') throw new Error('Este pedido está cerrado y conserva su historial.');
    if (!orderStatuses.includes(status)) throw new Error('Estado de pedido inválido.');
    const lines = cleanItems(items);
    const date = new Date().toISOString();
    const updated: Order = { ...previous, ...cleanCustomer(customer), items: lines, total: cartTotal(lines), status, updatedAt: date,
      history: [...previous.history, { date, message: `Pedido actualizado. Estado: ${status}.${reason.trim() ? ` Motivo: ${reason.trim().slice(0, 500)}` : ''}` }] };
    storageService.set(KEY, orders.map(order => order.id === id ? updated : order));
    return updated;
  },
};
