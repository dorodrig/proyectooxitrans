import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
// import { BackendTestComponent } from '../components/BackendTestComponent';
import '../styles/pages/_login-premium.scss';

interface FormData {
  documento: string;
  password: string;
}

interface FormErrors {
  documento?: string;
  password?: string;
}

/**
 * 🎨 PÁGINA DE LOGIN PREMIUM
 * Componente que replica exactamente el diseño de la plantilla comprada
 * Diseño: Dashboard/design/login.html
 * Cliente: OXITRANS S.A.S
 */
const PremiumLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState<FormData>({
    documento: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validación de formulario
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    } else if (!/^\d+$/.test(formData.documento.trim())) {
      newErrors.documento = 'El documento debe contener solo números';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejo del cambio en inputs
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Manejo del envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.documento, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
    }
  };

  /**
   * Toggle mostrar/ocultar contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-bg">
      <div className="auth-wrapper">
        <div className="login-container">
          <div className="auth-box">
            {/* Logo de OXITRANS */}
            <div className="auth-logo">
              <img 
                src="/assets/images/logo-dark.svg" 
                alt="OXITRANS S.A.S"
                className="img-fluid"
              />
            </div>

            {/* Título */}
            <h2 className="login-title">Iniciar Sesión</h2>

            {/* Mensaje de error global */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Formulario de login */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Campo Documento */}
              <div className="mb-3">
                <label htmlFor="documento" className="form-label">
                  Número de Documento <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.documento ? 'is-invalid' : ''}`}
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  placeholder="Ingrese su número de documento"
                  autoComplete="username"
                  required
                />
                {errors.documento && (
                  <div className="invalid-feedback d-block">
                    {errors.documento}
                  </div>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Ingrese su contraseña"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <i className={`icon-${showPassword ? 'eye-off' : 'eye'}`}></i>
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback d-block">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>

              {/* Enlace ¿Olvidaste tu contraseña? */}
              <div className="mb-4 d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-link text-decoration-underline p-0"
                  onClick={() => navigate('/forgot-password')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botones de acción */}
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
                
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => navigate('/registro')}
                >
                  Registrarse
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Componente temporal de test de backend  <BackendTestComponent />*/}
       
        
      </div>
    </div>
  );
};

export default PremiumLoginPage;
