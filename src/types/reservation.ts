export const reservationStatuses = ['Confirmada', 'Modificada', 'Atendida', 'Cancelada'] as const;
export type ReservationStatus = typeof reservationStatuses[number];

export interface ReservationInput {
  name: string;
  email: string;
  service: string;
  barberId: string;
  date: string;
  time: string;
  message: string;
}

export interface Reservation extends ReservationInput {
  id: number;
  code: string;
  /** Optional only to retain reservations saved by earlier versions. */
  phone?: string;
  /** Retained only for reservations created by an earlier client-login flow. */
  ownerId?: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string | null;
  notifications: { date: string; message: string }[];
}

export interface CartItem {
  product: string;
  price: number;
  quantity: number;
}
