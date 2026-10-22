import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import { authRepository } from '../../repositories/authRepository';
import type { LoginCredentials, User } from '../../types/auth';

interface LoginState {
  from?: unknown;
  message?: unknown;
}

function destinationFor(user: User, requested: unknown): string {
  const from = typeof requested === 'string' ? requested : '/';
  if (user.role === 'ADMIN') return '/admin';
  return from === '/' || /^\/#[-\w]+$/.test(from) ? from : '/';
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LoginState;
  const [error, setError] = useState('');
  const currentUser = authRepository.getCurrentUser();
  const notice = typeof state.message === 'string' ? state.message : '';

  if (currentUser) {
    return <Navigate to={destinationFor(currentUser, state.from)} replace />;
  }

  const handleLogin = (credentials: LoginCredentials) => {
    setError('');
    try {
      const user = authRepository.login(credentials);
      if (!user) {
        setError('Las credenciales del personal son incorrectas.');
        return;
      }
      navigate(destinationFor(user, state.from), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    }
  };

  return <main className="login-page"><div className="login-card">
    {notice && <p className="login-notice" role="status">{notice}</p>}
    <LoginForm error={error} onSubmit={handleLogin} />
    <Link className="login-back" to="/">Volver a Macho Alfa</Link>
  </div></main>;
}

export default LoginPage;
