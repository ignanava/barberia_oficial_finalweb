import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, type ReactNode } from 'react';


import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CartPage from '../pages/CartPage';
import { authRepository } from "../repositories/authRepository";

function AdminRoute({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(authRepository.getCurrentUser);
  useEffect(() => {
    const sync = () => setUser(authRepository.getCurrentUser());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.hash}`, message: 'Inicia sesión como personal autorizado para acceder al panel.' }} />;
  }
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Barbería Macho Alfa · Sucre', '/carrito': 'Tu carrito y pedidos · Macho Alfa', '/login': 'Acceso del personal · Macho Alfa', '/admin': 'Panel del personal · Macho Alfa' };
    document.title = titles[location.pathname] ?? titles['/'];
    const frame = requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, location.key]);
  return null;
}


function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;
