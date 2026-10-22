import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { afterEach, beforeEach, mock, test } from 'node:test';
import ts from 'typescript';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) {
      const url = new URL(specifier, context.parentURL);
      if (!/\.[a-z]+$/i.test(url.pathname) && existsSync(new URL(`${url.href}.ts`))) {
        return { url: `${url.href}.ts`, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.ts')) {
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
      }).outputText };
    }
    if (url.endsWith('.json')) {
      return { format: 'module', shortCircuit: true, source: `export default ${readFileSync(new URL(url), 'utf8')};` };
    }
    return next(url, context);
  },
});

const memory = new Map();
let failWrites = false;
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => { if (failWrites) throw new Error('Storage full'); memory.set(key, String(value)); },
  removeItem: key => memory.delete(key),
  clear: () => memory.clear(),
}, configurable: true });

const { authRepository: auth } = await import('../src/repositories/authRepository.ts');
const { reservationRepository: repo } = await import('../src/repositories/reservationRepository.ts');
const { cartRepository } = await import('../src/repositories/cartRepository.ts');
const { orderRepository: orders } = await import('../src/repositories/orderRepository.ts');
const { addDays, today, currentTime } = await import('../src/services/dateService.ts');
const { availableBookingDates, unavailableBookingTimes } = await import('../src/services/bookingAvailability.ts');
const { bookingTimes, bookingServices, combos, comboRegularPrice, prices, products, services } = await import('../src/data/catalog.ts');
const { barbers, UNASSIGNED_BARBER } = await import('../src/data/barbers.ts');
const input = { name: ' Cliente ', email: 'cliente@example.com', service: 'Corte clásico', barberId: 'barbero-01', date: '2099-06-01', time: '09:00', message: '<img src=x onerror=alert(1)>' };

const loginAdmin = () => auth.login({ carnet: '13028039', password: '13028039' });

beforeEach(() => {
  memory.clear(); failWrites = false;
  mock.timers.enable({ apis: ['Date'], now: new Date('2099-06-01T12:00:00Z').getTime() });
});
afterEach(() => mock.timers.reset());

test('keeps products and makes every displayed service bookable at the same price', () => {
  assert.equal(services.length, 6);
  assert.equal(prices.length, 7);
  assert.equal(products.length, 4);
  for (const service of services) assert.equal(prices.find(item => item.name === service.name)?.price, service.price);
});

test('accepts only staff credentials for the administrative session', () => {
  assert.equal(auth.login({ carnet: '7654321', password: 'usuario123' }), null);
  assert.equal(auth.login({ carnet: '13028039', password: 'incorrecta' }), null);
  assert.equal(auth.login({ carnet: '1234567', password: 'admin123' }), null);
  const admin = loginAdmin();
  assert.deepEqual(admin, { id: 'user-1', name: 'Administrador', carnet: '13028039', role: 'ADMIN' });
  assert.deepEqual(auth.getCurrentUser(), admin);
  auth.logout();
  assert.equal(auth.getCurrentUser(), null);
});

test('creates, persists and finds a public reservation without a session or phone', () => {
  const created = repo.create(input);
  assert.match(created.code, /^MA-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  assert.equal(created.name, 'Cliente');
  assert.equal(created.phone, undefined);
  assert.equal(created.ownerId, undefined);
  assert.equal(created.message, input.message);
  assert.equal(repo.list().length, 1);
  assert.equal(repo.find(created.code.toLowerCase(), ' CLIENTE@EXAMPLE.COM ')?.id, created.id);
  assert.equal(repo.find(created.code, 'other@example.com'), null);
  assert.deepEqual(repo.lastLookup(), { code: created.code, email: input.email });
});

test('keeps date and occupied-slot validation for public bookings', () => {
  repo.create(input);
  assert.throws(() => repo.create(input), /ya está reservado/);
  assert.throws(() => repo.create({ ...input, date: '2099-06-07' }), /domingos/);
  assert.throws(() => repo.create({ ...input, date: '2020-01-01' }), /fecha válida/);
  assert.throws(() => repo.create({ ...input, date: '2099-02-31' }), /fecha válida/);
  assert.throws(() => repo.create({ ...input, name: '', date: '2099-06-02' }), /nombre y correo válidos/);
});

test('allows only staff to update a public reservation and keeps its notification', () => {
  const created = repo.create(input);
  assert.throws(() => repo.update(created.id, { ...input, time: '10:00' }, 'Confirmada', 'Cambio de turno'), /personal autorizado/);
  loginAdmin();
  const updated = repo.update(created.id, { ...input, time: '10:00' }, 'Confirmada', 'Cambio de turno');
  assert.equal(updated.code, created.code);
  assert.equal(updated.status, 'Modificada');
  assert.equal(updated.notifications.length, 1);
  assert.match(updated.notifications[0].message, /09:00.*10:00.*Cambio de turno/);
  assert.equal(repo.find(created.code, input.email)?.time, '10:00');
});

test('editing excludes its own slot but rejects another occupied slot', () => {
  const first = repo.create(input);
  repo.create({ ...input, time: '10:00' });
  loginAdmin();
  assert.doesNotThrow(() => repo.update(first.id, input, 'Atendida', ''));
  assert.throws(() => repo.update(first.id, { ...input, time: '10:00' }, 'Confirmada', ''), /ya está reservado/);
});

test('cancelling releases the slot and only staff can delete reservations', () => {
  const first = repo.create(input);
  loginAdmin();
  repo.update(first.id, input, 'Cancelada', '');
  auth.logout();
  const second = repo.create(input);
  assert.notEqual(second.code, first.code);
  assert.throws(() => repo.remove(second.id), /personal autorizado/);
  loginAdmin();
  repo.remove(second.id);
  assert.equal(repo.find(second.code, input.email), null);
  assert.deepEqual(repo.lastLookup(), { code: '', email: '' });
});

test('keeps legacy reservations with a phone readable by the administrator', () => {
  const original = { ...input, phone: '72800000', id: 123, code: 'MA-ABC234', status: 'Confirmada', createdAt: '2026-09-01T00:00:00Z', updatedAt: null };
  delete original.barberId;
  memory.set('machoAlfaReservations', JSON.stringify([original]));
  memory.set('machoAlfaLastReservationCode', original.code);
  memory.set('machoAlfaLastReservationEmail', input.email);
  assert.equal(repo.list()[0].phone, '72800000');
  assert.equal(repo.list()[0].barberId, UNASSIGNED_BARBER);
  assert.deepEqual(repo.list()[0].notifications, []);
  assert.deepEqual(repo.lastLookup(), { code: original.code, email: input.email });
  assert.throws(() => repo.listForAdministrator(), /personal autorizado/);
  loginAdmin();
  assert.equal(repo.listForAdministrator().length, 1);
  memory.set('machoAlfaCart', JSON.stringify([{ product: 'Pomada Matte Alfa', price: 75 }]));
  assert.equal(cartRepository.list()[0].price, 75);
  cartRepository.save([]);
  assert.deepEqual(cartRepository.list(), []);
});

test('ignores invalid storage shapes and reports failed public reservation writes', () => {
  memory.set('machoAlfaReservations', JSON.stringify([null, {}, 'invalid']));
  memory.set('machoAlfaCart', JSON.stringify({ invalid: true }));
  assert.deepEqual(repo.list(), []);
  assert.deepEqual(cartRepository.list(), []);
  failWrites = true;
  const previous = console.error;
  console.error = () => {};
  try { assert.throws(() => repo.create(input), /No se pudieron guardar/); }
  finally { console.error = previous; }
  assert.equal(repo.list().length, 0);
});

test('migrates the previous cart, uses catalog prices, and validates quantities', () => {
  memory.set('machoAlfaCart', JSON.stringify([{ product: products[0].name, price: 1 }, { product: products[0].name, price: 1 }, { product: 'Invalid', price: 999 }]));
  assert.deepEqual(cartRepository.list(), [{ product: products[0].name, price: products[0].price, quantity: 2 }]);
  cartRepository.add(products[0].name);
  assert.equal(cartRepository.list()[0].quantity, 3);
  cartRepository.setQuantity(products[0].name, 20);
  assert.throws(() => cartRepository.add(products[0].name), /hasta 20/);
  assert.throws(() => cartRepository.setQuantity(products[0].name, 1.5), /cantidad/);
  assert.throws(() => cartRepository.setQuantity(products[0].name, -1), /cantidad/);
  cartRepository.setQuantity(products[0].name, 0);
  assert.deepEqual(cartRepository.list(), []);
});

const customer = { name: ' Cliente ', email: ' CLIENTE@EXAMPLE.COM ', message: 'Recoger por la tarde' };
const lines = [{ product: 'Pomada Matte Alfa', price: 1, quantity: 2 }];

test('creates a priced order, prevents repeated submissions and supports code/email lookup', () => {
  const order = orders.create(customer, lines, 'request-1');
  assert.equal(order.total, 150);
  assert.equal(order.status, 'Pendiente');
  assert.equal(order.name, 'Cliente');
  assert.equal(order.email, 'cliente@example.com');
  assert.equal(orders.create(customer, lines, 'request-1').id, order.id);
  assert.equal(orders.find(order.code.toLowerCase(), customer.email)?.id, order.id);
  assert.equal(orders.find(order.code, 'wrong@example.com'), null);
  assert.throws(() => orders.listForAdministrator(), /personal autorizado/);
  loginAdmin();
  assert.equal(orders.listForAdministrator().length, 1);
});

test('rejects invalid and empty orders, failed storage writes never create a successful order', () => {
  assert.throws(() => orders.create(customer, [], 'empty'), /al menos un/);
  assert.throws(() => orders.create({ ...customer, email: 'bad' }, lines, 'email'), /nombre y correo/);
  assert.throws(() => orders.create(customer, [{ ...lines[0], quantity: -1 }], 'negative'), /cantidades/);
  assert.throws(() => orders.create(customer, [{ ...lines[0], product: 'Desconocido' }], 'unknown'), /productos/);
  assert.throws(() => orders.create(customer, [lines[0], lines[0]], 'duplicate'), /productos/);
  failWrites = true;
  const previous = console.error;
  console.error = () => {};
  try { assert.throws(() => orders.create(customer, lines, 'storage'), /No se pudieron guardar/); }
  finally { console.error = previous; }
  failWrites = false;
  loginAdmin();
  assert.equal(orders.listForAdministrator().length, 0);
});

test('only staff can edit order quantities, cancel and preserve closed-order history', () => {
  const order = orders.create(customer, lines, 'request-1');
  assert.throws(() => orders.update(order.id, customer, lines, 'Cancelado', ''), /personal autorizado/);
  loginAdmin();
  const updated = orders.update(order.id, customer, [{ ...lines[0], quantity: 3 }], 'En preparación', 'Una unidad adicional');
  assert.equal(updated.total, 225);
  assert.equal(updated.history.length, 2);
  const cancelled = orders.update(order.id, customer, updated.items, 'Cancelado', 'Solicitado por el cliente');
  assert.equal(cancelled.history.length, 3);
  assert.match(cancelled.history.at(-1).message, /Solicitado por el cliente/);
  assert.throws(() => orders.update(order.id, customer, lines, 'Pendiente', ''), /cerrado/);
  auth.logout();
  assert.equal(orders.find(order.code, customer.email)?.status, 'Cancelado');
});

test('past reservations can be cancelled or marked attended without moving their date', () => {
  const created = repo.create(input);
  memory.set('machoAlfaReservations', JSON.stringify([{ ...created, date: '2020-01-06' }]));
  loginAdmin();
  assert.equal(repo.update(created.id, { ...input, date: '2020-01-06' }, 'Atendida', '').status, 'Atendida');
  const cancelled = repo.update(created.id, { ...input, date: '2020-01-06' }, 'Cancelada', 'Cancelación tardía');
  assert.match(cancelled.notifications.at(-1).message, /cancelada/);
  assert.throws(() => repo.update(created.id, { ...input, date: '2020-01-06' }, 'Confirmada', ''), /fecha válida/);
});

test('same-day reservations cannot use an elapsed Bolivia time slot', () => {
  mock.timers.setTime(new Date('2099-06-01T16:30:00Z').getTime());
  const elapsed = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].find(time => time <= currentTime());
  if (elapsed) assert.throws(() => repo.create({ ...input, date: today(), time: elapsed }), /ya pasó/);
});

test('public booking includes today and day seven but rejects day eight', () => {
  assert.equal(repo.create(input).date, today());
  assert.equal(repo.create({ ...input, date: addDays(today(), 7) }).date, '2099-06-08');
  assert.throws(() => repo.create({ ...input, date: addDays(today(), 8) }), /una semana/);
});

test('available dates omit Sundays, fully booked days and today after closing', () => {
  assert.deepEqual(availableBookingDates([], input.barberId, input.service), ['2099-06-01', '2099-06-02', '2099-06-03', '2099-06-04', '2099-06-05', '2099-06-06', '2099-06-08']);
  for (const time of bookingTimes) repo.create({ ...input, time });
  assert.equal(availableBookingDates(repo.list(), input.barberId, input.service).includes(today()), false);
  loginAdmin();
  const first = repo.list()[0];
  repo.update(first.id, first, 'Cancelada', '');
  assert.equal(availableBookingDates(repo.list(), input.barberId, input.service).includes(today()), true);
  mock.timers.setTime(new Date('2099-06-01T23:01:00Z').getTime());
  assert.equal(availableBookingDates([], input.barberId, input.service).includes(today()), false);
});

test('date window follows Bolivia midnight and crosses month, year and leap day', () => {
  assert.equal(addDays('2028-02-27', 7), '2028-03-05');
  assert.equal(addDays('2026-12-28', 7), '2027-01-04');
  mock.timers.setTime(new Date('2026-12-31T03:59:00Z').getTime());
  assert.equal(today(), '2026-12-30');
  mock.timers.setTime(new Date('2026-12-31T04:00:00Z').getTime());
  assert.equal(today(), '2026-12-31');
  const dates = availableBookingDates([], input.barberId, input.service);
  assert.equal(dates[0], '2026-12-31');
  assert.equal(dates.at(-1), '2027-01-07');
});

test('last reservation persists without a search and reflects staff changes', () => {
  assert.equal(repo.lastSaved(), null);
  const first = repo.create(input);
  assert.equal(repo.lastSaved()?.code, first.code);
  const second = repo.create({ ...input, time: '10:00', name: 'Otra visita' });
  assert.equal(repo.lastSaved()?.code, second.code);
  loginAdmin();
  repo.update(second.id, { ...second, email: 'nuevo@example.com' }, 'Cancelada', 'Cambio solicitado');
  assert.equal(repo.lastSaved()?.email, 'nuevo@example.com');
  assert.equal(repo.lastSaved()?.status, 'Cancelada');
  repo.remove(second.id);
  assert.equal(repo.lastSaved(), null);
});

test('combos have a real saving and are bookable with their advertised price and duration', () => {
  assert.equal(combos.length, 3);
  for (const combo of combos) {
    assert.ok(combo.includes.every(name => prices.some(service => service.name === name)));
    assert.ok(combo.price > 0 && combo.price < comboRegularPrice(combo));
    assert.deepEqual(bookingServices.find(service => service.name === combo.name), { name: combo.name, description: combo.includes.join(' + '), price: combo.price, duration: combo.duration });
  }
  const reservation = repo.create({ ...input, service: combos[0].name });
  assert.equal(repo.lastSaved()?.service, combos[0].name);
  assert.equal(reservation.barberId, input.barberId);
});

test('each of four barbers can take the same time, and invalid barber IDs are rejected', () => {
  assert.equal(barbers.length, 4);
  for (const barber of barbers) repo.create({ ...input, barberId: barber.id });
  assert.equal(repo.list().length, 4);
  assert.throws(() => repo.create(input), /ya está reservado/);
  assert.throws(() => repo.create({ ...input, barberId: '' }), /cuatro barberos/);
  assert.throws(() => repo.create({ ...input, barberId: 'inexistente' }), /cuatro barberos/);
});

test('90-minute combos block overlapping slots for that barber and cannot end after closing', () => {
  const first = repo.create({ ...input, service: combos[0].name });
  assert.throws(() => repo.create({ ...input, time: '10:00' }), /ya está reservado/);
  assert.ok(unavailableBookingTimes(repo.list(), input.date, input.barberId, input.service).includes('10:00'));
  assert.doesNotThrow(() => repo.create({ ...input, barberId: 'barbero-02', time: '10:00' }));
  assert.doesNotThrow(() => repo.create({ ...input, time: '11:00' }));
  assert.throws(() => repo.create({ ...input, service: combos[1].name, time: '19:00' }), /cierre/);
  loginAdmin();
  repo.update(first.id, first, 'Cancelada', 'Cancelación');
  assert.doesNotThrow(() => repo.create({ ...input, time: '10:00' }));
});

test('existing appointments block a combo that would overlap them and staff can reassign barbers', () => {
  const first = repo.create({ ...input, time: '10:00' });
  assert.throws(() => repo.create({ ...input, service: combos[0].name, time: '09:00' }), /ya está reservado/);
  loginAdmin();
  const changed = repo.update(first.id, { ...first, barberId: 'barbero-02' }, 'Confirmada', 'Cambio de profesional');
  assert.equal(changed.barberId, 'barbero-02');
  assert.match(changed.notifications.at(-1).message, /Barbero 02/);
  assert.doesNotThrow(() => repo.create({ ...input, service: combos[0].name, time: '09:00' }));
});

test('legacy unassigned appointments are retained and can be assigned without double-booking', () => {
  const created = repo.create(input);
  const legacy = { ...created };
  delete legacy.barberId;
  memory.set('machoAlfaReservations', JSON.stringify([legacy]));
  assert.equal(repo.lastSaved()?.barberId, UNASSIGNED_BARBER);
  for (const barber of barbers) assert.throws(() => repo.create({ ...input, barberId: barber.id }), /ya está reservado/);
  loginAdmin();
  const updated = repo.update(created.id, { ...repo.list()[0], barberId: 'barbero-03' }, 'Confirmada', 'Asignación de barbero');
  assert.equal(updated.barberId, 'barbero-03');
  assert.doesNotThrow(() => repo.create({ ...input, barberId: 'barbero-01' }));
});
