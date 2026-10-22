import { products } from '../data/catalog';
import { storageService } from '../services/storageService';
import type { CartItem } from '../types/reservation';

const KEY = 'machoAlfaCart';
export const CART_EVENT = 'macho-alfa-cart-change';
export const MAX_QUANTITY = 20;

function read(): CartItem[] {
  const saved = storageService.get<unknown>(KEY);
  if (!Array.isArray(saved)) return [];
  const items: CartItem[] = [];
  for (const row of saved) {
    if (!row || typeof row !== 'object') continue;
    const product = products.find(product => product.name === row.product);
    const quantity = row.quantity === undefined ? 1 : row.quantity;
    if (!product || !Number.isInteger(quantity) || quantity < 1) continue;
    const existing = items.find(item => item.product === product.name);
    if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
    else items.push({ product: product.name, price: product.price, quantity: Math.min(MAX_QUANTITY, quantity) });
  }
  return items;
}

function save(items: CartItem[]) {
  if (items.some(item => !products.some(product => product.name === item.product && product.price === item.price)
    || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY)) {
    throw new Error('Revisa los productos y cantidades del carrito.');
  }
  storageService.set(KEY, items);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CART_EVENT));
}

export const cartRepository = {
  list: read,
  save,
  add(name: string) {
    const product = products.find(item => item.name === name);
    if (!product) throw new Error('El producto no está disponible.');
    const items = read();
    const item = items.find(item => item.product === name);
    if (item && item.quantity >= MAX_QUANTITY) throw new Error(`Puedes pedir hasta ${MAX_QUANTITY} unidades de cada producto.`);
    if (item) item.quantity += 1;
    else items.push({ product: name, price: product.price, quantity: 1 });
    save(items);
  },
  setQuantity(name: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) throw new Error(`La cantidad debe estar entre 0 y ${MAX_QUANTITY}.`);
    save(read().map(item => item.product === name ? { ...item, quantity } : item).filter(item => item.quantity > 0));
  },
};

export const cartTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const cartCount = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);
