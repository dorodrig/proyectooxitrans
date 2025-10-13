import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../services/authService';

interface UserData {
  nombre: string;
  apellido: string;
  documento: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [documento, setDocumento] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'document' | 'password'>('document');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [resetToken, setResetToken] = useState('');

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documento.trim()) {
      setError('Por favor ingresa tu número de documento');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await requestPasswordReset(documento);

      
      if (response.documentExists) {
        setUserData(response.usuario ?? null);
        setResetToken(response.resetToken ?? '');
        setStep('password');
        setMessage('Documento verificado. Ahora puedes establecer tu nueva contraseña.');
      } else {
        setError('El documento ingresado no se encuentra registrado en el sistema');
      }
    } catch (err: unknown) {
      console.error('🚨 [ForgotPassword] Error:', err);
      const errorMessage = (err as { message?: string })?.message || 'Error al verificar el documento';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {

      await resetPassword(resetToken, newPassword);

      setMessage('Contraseña actualizada exitosamente. Serás redirigido al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al actualizar la contraseña';
      
      if (err && typeof err === 'object') {
        // Error de axios
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as { data?: { message?: string } };
          errorMessage = response.data?.message || errorMessage;
        }
        // Error directo
        else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDocument = () => {
    setStep('document');
    setUserData(null);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {/* Logo */}
          <div className="logo-section">
            <h1 className="logo-text">OXITRANS</h1>
            <p className="logo-subtitle">Sistema de Control de Acceso</p>
          </div>

          {step === 'document' ? (
            <>
              {/* Título */}
              <div className="form-header">
                <h2>Restablecer Contraseña</h2>
                <p>Ingresa tu número de documento para verificar tu identidad</p>
              </div>

              {/* Formulario de documento */}
              <form onSubmit={handleDocumentSubmit} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="documento">Número de Documento</label>
                  <input
                    type="text"
                    id="documento"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Ej: 12345678"
                    disabled={isLoading}
                    className="form-input"
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="success-message">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? 'Verificando...' : 'Verificar Documento'}
                </button>
              </form>

              {/* Enlaces */}
              <div className="form-links">
                <Link to="/login" className="back-link">
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Título para nueva contraseña */}
              <div className="form-header">
                <h2>Nueva Contraseña</h2>
                {userData && (
                  <p>Hola {userData.nombre} {userData.apellido}, establece tu nueva contraseña</p>
                )}
              </div>

              {/* Formulario de nueva contraseña */}
              <form onSubmit={handlePasswordSubmit} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="newPassword">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    disabled={isLoading}
                    className="form-input"
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="success-message">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>

              {/* Enlaces */}
              <div className="form-links">
                <button 
                  type="button" 
                  onClick={handleBackToDocument} 
                  className="back-link"
                  disabled={isLoading}
                >
                  ← Verificar otro documento
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
