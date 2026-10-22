import type { CartItem } from './reservation';

export const orderStatuses = ['Pendiente', 'En preparación', 'Listo para recoger', 'Entregado', 'Cancelado'] as const;
export type OrderStatus = typeof orderStatuses[number];
export interface OrderCustomer { name: string; email: string; message: string; }
export interface Order extends OrderCustomer {
  id: string;
  requestId: string;
  code: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  history: { date: string; message: string }[];
}
