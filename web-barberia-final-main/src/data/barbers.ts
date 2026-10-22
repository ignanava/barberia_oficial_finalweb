export interface Barber {
  id: string;
  name: string;
  photo: string | null;
}

// Los identificadores conservan la relación con las reservas de cada profesional.
export const barbers: Barber[] = [
  { id: 'barbero-01', name: 'Barbero 01', photo: '/images/barberos/barbero-01.png' },
  { id: 'barbero-02', name: 'Barbero 02', photo: '/images/barberos/barbero-02.png' },
  { id: 'barbero-03', name: 'Barbero 03', photo: '/images/barberos/barbero-03.png' },
  { id: 'barbero-04', name: 'Barbero 04', photo: '/images/barberos/barbero-04.png' },
];

export const UNASSIGNED_BARBER = 'por-asignar';
export const barberName = (id: string) => barbers.find(barber => barber.id === id)?.name ?? 'Por asignar';
