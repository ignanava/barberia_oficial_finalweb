import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingSection from '../components/BookingSection';
import MyReservation from '../components/MyReservation';
import CatalogSections from '../components/site/CatalogSections';
import BarbersSection from '../components/site/BarbersSection';
import FaqSection from '../components/site/FaqSection';
import type { ReservationInput } from '../types/reservation';
import ContactSection from '../components/site/ContactSection';
import HeroSection from '../components/site/HeroSection';
import SiteFooter from '../components/site/SiteFooter';
import SiteHeader from '../components/site/SiteHeader';
import { authRepository } from '../repositories/authRepository';
import { reservationRepository } from '../repositories/reservationRepository';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authRepository.getCurrentUser);
  const [reservations, setReservations] = useState(reservationRepository.list);
  const [error, setError] = useState('');
  const [bookingInput, setBookingInput] = useState<ReservationInput>({ name: '', email: '', service: '', barberId: '', date: '', time: '', message: '' });
  const last = reservationRepository.lastSaved(reservations);

  useEffect(() => {
    const sync = () => {
      setUser(authRepository.getCurrentUser());
      setReservations(reservationRepository.list());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function logout() {
    try {
      authRepository.logout();
      setUser(null);
      navigate('/', { replace: true });
    } catch {
      setError('No se pudo cerrar la sesión del personal. Comprueba el almacenamiento del navegador.');
    }
  }

  return <>
    <SiteHeader user={user} onLogout={logout} />
    {error && <p className="lookup-error" role="alert">{error}</p>}
    <main id="main-content" tabIndex={-1}>
      <HeroSection />
      <CatalogSections onSelectService={service => {
        setBookingInput(current => ({ ...current, service, date: '', time: '' }));
        document.getElementById('reservar')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        document.getElementById('booking-barber')?.focus({ preventScroll: true });
      }} />
      <BarbersSection selectedBarber={bookingInput.barberId} onSelect={barberId => setBookingInput(current => ({ ...current, barberId, date: '', time: '' }))} />
      <BookingSection reservations={reservations} input={bookingInput} onInputChange={setBookingInput} onCreate={input => {
        const created = reservationRepository.create(input);
        setReservations(reservationRepository.list());
        return created;
      }} />
      <MyReservation reservation={last} />
      <FaqSection />
      <ContactSection />
    </main>
    <SiteFooter />
  </>;
}
