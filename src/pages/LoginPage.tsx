import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { LogIn, Eye, EyeOff, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Por favor, complete todos los campos');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__container">
        {/* Logo y título */}
        <div className="login-page__logo">
          <Building2 />
        </div>
        <h2 className="login-page__title">OXITRANS S.A.S</h2>
        <p className="login-page__subtitle">Sistema de Control de Acceso</p>

        {/* Formulario de login */}
        <div className="login-page__form">
          <form onSubmit={handleSubmit}>
            <div className="login-page__input-group">
              <label htmlFor="email" className="login-page__label">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-page__input"
                placeholder="Ingrese su email"
              />
            </div>

            <div className="login-page__input-group">
              <label htmlFor="password" className="login-page__label">
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-page__input"
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  className="login-page__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {(error || localError) && (
              <div className="login-page__error">
                {error || localError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`login-page__submit-btn ${isLoading ? 'login-page__submit-btn--loading' : ''}`}
            >
              {isLoading ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <LogIn />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="login-page__footer">
            <p>
              ¿Problemas para acceder? Contacte al administrador del sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
