import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

interface RegistroFormData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  tipo_documento: 'CC' | 'CE' | 'PA';
  telefono: string;
  departamento: string;
  cargo: string;
  password: string;
  confirmPassword: string;
}

export const RegistroPage: React.FC = () => {
  const [formData, setFormData] = useState<RegistroFormData>({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    tipo_documento: 'CC',
    telefono: '',
    departamento: '',
    cargo: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const departamentos = [
    'Administración',
    'Operaciones',
    'Logística',
    'Mantenimiento',
    'Recursos Humanos',
    'Contabilidad',
    'Ventas',
    'Sistemas'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    setError('');

    // Validar campos requeridos (excluyendo telefono y confirmPassword)
    for (const [key, value] of Object.entries(formData)) {
      if (!value && key !== 'telefono' && key !== 'confirmPassword') {
        setError(`El campo ${key.replace('_', ' ')} es requerido`);
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingrese un email válido');
      return false;
    }

    // Validar documento
    if (formData.documento.length < 6) {
      setError('El documento debe tener al menos 6 caracteres');
      return false;
    }

    // Validar contraseñas
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Preparar datos para enviar al backend
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSend } = formData;
      
      const registroData = {
        ...dataToSend,
        fecha_ingreso: new Date().toISOString().split('T')[0]
      };

      const result = await authService.registroEmpleado(registroData);

      if (!result.success) {
        throw new Error(result.message || 'Error al registrar usuario');
      }

      setSuccess(true);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        documento: '',
        tipo_documento: 'CC',
        telefono: '',
        departamento: '',
        cargo: '',
        password: '',
        confirmPassword: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registro-page">
        <div className="registro-page__container">
          <div className="registro-page__success">
            <div className="registro-page__logo">
              <Building2 />
            </div>
            <h2 className="registro-page__title">¡Registro Exitoso!</h2>
            <div className="registro-page__success-message">
              <p>Su cuenta ha sido creada exitosamente.</p>
              <p>Un administrador revisará su solicitud y activará su cuenta.</p>
              <p>Será notificado por email cuando su cuenta esté activa.</p>
            </div>
            <Link 
              to="/login" 
              className="registro-page__back-btn"
            >
              <ArrowLeft />
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registro-page">
      <div className="registro-page__container">
        {/* Header */}
        <div className="registro-page__header">
          <Link to="/login" className="registro-page__back-link">
            <ArrowLeft />
            Volver al Login
          </Link>
          <div className="registro-page__logo">
            <Building2 />
          </div>
          <h2 className="registro-page__title">OXITRANS S.A.S</h2>
          <p className="registro-page__subtitle">Registro de Empleados</p>
        </div>

        {/* Formulario */}
        <div className="registro-page__form">
          <form onSubmit={handleSubmit}>
            {/* Datos Personales */}
            <div className="registro-page__section">
              <h3 className="registro-page__section-title">Datos Personales</h3>
              
              <div className="registro-page__row">
                <div className="registro-page__input-group">
                  <label htmlFor="nombre" className="registro-page__label">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="registro-page__input"
                    placeholder="Ingrese su nombre"
                  />
                </div>

                <div className="registro-page__input-group">
                  <label htmlFor="apellido" className="registro-page__label">
                    Apellido *
                  </label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="registro-page__input"
                    placeholder="Ingrese su apellido"
                  />
                </div>
              </div>

              <div className="registro-page__row">
                <div className="registro-page__input-group">
                  <label htmlFor="tipo_documento" className="registro-page__label">
                    Tipo de Documento *
                  </label>
                  <select
                    id="tipo_documento"
                    name="tipo_documento"
                    required
                    value={formData.tipo_documento}
                    onChange={handleInputChange}
                    className="registro-page__input"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>

                <div className="registro-page__input-group">
                  <label htmlFor="documento" className="registro-page__label">
                    Número de Documento *
                  </label>
                  <input
                    id="documento"
                    name="documento"
                    type="text"
                    required
                    value={formData.documento}
                    onChange={handleInputChange}
                    className="registro-page__input"
                    placeholder="Ingrese su documento"
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="registro-page__section">
              <h3 className="registro-page__section-title">Información de Contacto</h3>
              
              <div className="registro-page__input-group">
                <label htmlFor="email" className="registro-page__label">
                  Correo Electrónico *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="registro-page__input"
                  placeholder="Ingrese su email"
                />
              </div>

              <div className="registro-page__input-group">
                <label htmlFor="telefono" className="registro-page__label">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="registro-page__input"
                  placeholder="Ingrese su teléfono (opcional)"
                />
              </div>
            </div>

            {/* Información Laboral */}
            <div className="registro-page__section">
              <h3 className="registro-page__section-title">Información Laboral</h3>
              
              <div className="registro-page__input-group">
                <label htmlFor="departamento" className="registro-page__label">
                  Departamento *
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  required
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className="registro-page__input"
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="registro-page__input-group">
                <label htmlFor="cargo" className="registro-page__label">
                  Cargo *
                </label>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  required
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="registro-page__input"
                  placeholder="Ingrese su cargo"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="registro-page__section">
              <h3 className="registro-page__section-title">Configurar Contraseña</h3>
              
              <div className="registro-page__input-group">
                <label htmlFor="password" className="registro-page__label">
                  Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="registro-page__input"
                    placeholder="Ingrese su contraseña"
                  />
                  <button
                    type="button"
                    className="registro-page__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="registro-page__input-group">
                <label htmlFor="confirmPassword" className="registro-page__label">
                  Confirmar Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="registro-page__input"
                    placeholder="Confirme su contraseña"
                  />
                  <button
                    type="button"
                    className="registro-page__password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="registro-page__error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`registro-page__submit-btn ${isLoading ? 'registro-page__submit-btn--loading' : ''}`}
            >
              {isLoading ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <UserPlus />
                  Registrar Cuenta
                </>
              )}
            </button>
          </form>

          <div className="registro-page__footer">
            <p>
              * Campos obligatorios. Su cuenta será revisada por un administrador antes de ser activada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
