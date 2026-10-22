import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminReservations from '../../components/AdminReservations';
import AdminOrders from '../../components/AdminOrders';
import { orderRepository } from '../../repositories/orderRepository';
import { isPastSlot, today } from '../../services/dateService';
import { authRepository } from '../../repositories/authRepository';
import { reservationRepository } from '../../repositories/reservationRepository';
import type { Reservation, ReservationInput, ReservationStatus } from '../../types/reservation';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authRepository.getCurrentUser);
  const [reservations, setReservations] = useState<Reservation[]>(() => reservationRepository.listForAdministrator());
  const [orders, setOrders] = useState(orderRepository.listForAdministrator);
  const [tab, setTab] = useState<'reservations' | 'orders'>('reservations');
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    try {
      setUser(authRepository.getCurrentUser());
      setReservations(reservationRepository.listForAdministrator());
      setOrders(orderRepository.listForAdministrator());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las reservas.');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', refresh);
    const timer = window.setInterval(refresh, 30_000);
    return () => { window.removeEventListener('storage', refresh); window.clearInterval(timer); };
  }, [refresh]);

  function logout() {
    try {
      authRepository.logout();
      navigate('/', { replace: true });
    } catch {
      setError('No se pudo cerrar la sesión. Comprueba el almacenamiento del navegador.');
    }
  }

  function update(id: number, input: ReservationInput, status: ReservationStatus, reason: string) {
    reservationRepository.update(id, input, status, reason);
    refresh();
  }

  function remove(id: number) {
    reservationRepository.remove(id);
    refresh();
  }

  return <main className="admin-dashboard">
    <header className="admin-dashboard-header"><div className="container admin-dashboard-header-content">
      <div><span className="section-kicker">MACHO ALFA · PERSONAL</span><h1>Tu barbería, al día</h1><p>Hola, {user?.name ?? 'administrador'}. Gestiona las reservas y los pedidos desde aquí.</p></div>
      <div className="admin-dashboard-actions"><Link className="btn btn-small" to="/">Ver sitio público</Link><button className="btn btn-small" type="button" onClick={logout}>Cerrar sesión</button></div>
    </div></header>
    {error && <p className="lookup-error" role="alert">{error}</p>}
    <div className="container">
      <p className="admin-local-note">Panel local: muestra los datos guardados en este navegador. No hay sincronización entre dispositivos.</p>
      <div className="dashboard-stats">
        <article><span>Reservas de hoy</span><strong>{reservations.filter(item => item.date === today() && item.status !== 'Cancelada').length}</strong><small>Agenda de la barbería</small></article>
        <article><span>Próximos turnos</span><strong>{reservations.filter(item => !isPastSlot(item.date, item.time) && (item.status === 'Confirmada' || item.status === 'Modificada')).length}</strong><small>Turnos pendientes de comenzar</small></article>
        <article><span>Pedidos en curso</span><strong>{orders.filter(item => item.status !== 'Cancelado' && item.status !== 'Entregado').length}</strong><small>Pendientes de entrega</small></article>
        <article><span>Ventas entregadas</span><strong>Bs {orders.filter(item => item.status === 'Entregado').reduce((sum, item) => sum + item.total, 0)}</strong><small>Total de pedidos entregados</small></article>
      </div>
      <div className="admin-tabs" role="group" aria-label="Secciones del panel"><button type="button" aria-pressed={tab === 'reservations'} onClick={() => setTab('reservations')}>Reservas <span>{reservations.length}</span></button><button type="button" aria-pressed={tab === 'orders'} onClick={() => setTab('orders')}>Pedidos <span>{orders.length}</span></button></div>
    </div>
    {tab === 'reservations' ? <AdminReservations user={user} reservations={reservations} onLogout={logout} onUpdate={update} onRemove={remove} /> : <AdminOrders orders={orders} onRefresh={refresh} />}
  </main>;
}
