import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/common/NavigationBar';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { colaboradoresService } from '../services/colaboradoresService';
// import MapaSimple from '../components/maps/MapaSimple'; // Removido temporalmente
import MapaGoogleSimple from '../components/maps/MapaGoogleSimple';
import GoogleMapsSimpleLoader from '../components/maps/GoogleMapsSimpleLoader';
import ControlesMapa from '../components/maps/ControlesMapa';
import CalculadoraHorasExtrasComponent from '../components/calculadora/CalculadoraHorasExtras';
import ReportePorFechasComponent from '../components/reportes/ReportePorFechas';
import { ValidadorColombiano } from '../services/validadorColombiano';
import { ManejadorErrores } from '../services/manejadorErrores';
import { useNotifications } from '../components/notifications/NotificationProvider';
import '../styles/pages/consultas-colaboradores.scss';
import '../styles/components/maps.scss';
import '../styles/components/calculadora-horas-extras.scss';
import '../styles/components/reportes/ReportePorFechas.scss';
import '../styles/components/reportes/reportes-criticos.css';
import '../styles/components/notifications.scss';
import { formatearFechaColombiana, formatearSoloFecha } from '../utils/formatoFechas';
import type { Colaborador, JornadaLaboral, UbicacionGPS } from '../services/colaboradoresService';

const ConsultasColaboradoresPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userRole = useAuthStore(state => state.usuario?.rol);
  const logout = useAuthStore(state => state.logout);
  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotifications();

  // Estado del componente
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Colaborador[]>([]);
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<Colaborador | null>(null);
  const [jornadasColaborador, setJornadasColaborador] = useState<JornadaLaboral[]>([]);
  const [ubicacionesGPS, setUbicacionesGPS] = useState<UbicacionGPS[]>([]);
  
  // Estados de UI
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'busqueda' | 'detalle' | 'mapa' | 'horas-extras' | 'reportes'>('busqueda');
  
  // Estados de validación (comentados temporalmente para evitar warnings)
  // const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  // const [tipoValidacion, setTipoValidacion] = useState<'error' | 'warning' | 'info' | 'success' | null>(null);
  // const [intentosReintento, setIntentosReintento] = useState(0);
  
  // Estados del mapa
  const [fechaFiltroMapa, setFechaFiltroMapa] = useState<string>('');

  // Paginación
  const [paginaBusqueda, setPaginaBusqueda] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);

  // Estados de validación en tiempo real
  const [estadoValidacion, setEstadoValidacion] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [mensajeValidacion, setMensajeValidacion] = useState<string>('');

  // Estado para controlar el tipo de reporte activo
  // Solo reportes generales - no necesitamos estado para tipo

  // Ubicaciones filtradas por fecha (corregido para manejar formatos ISO)
  const ubicacionesFiltradas = fechaFiltroMapa 
    ? ubicacionesGPS.filter(u => {
        const fechaUbicacion = u.fecha?.split('T')[0] || u.fecha; // Extraer solo la fecha (yyyy-mm-dd)
        return fechaUbicacion === fechaFiltroMapa;
      })
    : ubicacionesGPS;

  // Control de acceso
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userRole !== 'admin' && userRole !== 'supervisor') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, userRole, navigate]);

  // Función de búsqueda con validaciones robustas
  const buscarColaboradores = async (termino: string, pagina = 1) => {
    // Limpiar errores previos
    setError(null);
    // setErrorValidacion(null); // Comentado temporalmente

    // Validar término de búsqueda
    const validacionTermino = ValidadorColombiano.validarTerminoBusqueda(termino);
    if (!validacionTermino.esValido) {
      // setErrorValidacion(validacionTermino.mensaje); // Comentado temporalmente
      // setTipoValidacion(validacionTermino.tipo); // Comentado temporalmente
      
      if (validacionTermino.tipo === 'error') {
        mostrarError('Búsqueda inválida', validacionTermino.mensaje);
        return;
      } else if (validacionTermino.tipo === 'warning') {
        mostrarAdvertencia('Atención', validacionTermino.mensaje);
        if (validacionTermino.sugerencias) {
          mostrarInfo('Sugerencias', validacionTermino.sugerencias.join(', '));
        }
        return;
      }
      return;
    }

    setLoadingBusqueda(true);
    mostrarInfo('Buscando...', `Consultando colaboradores con "${termino}"`);

    try {
      // Búsqueda directa sin reintentos automáticos
      const response = await colaboradoresService.buscar(
        ValidadorColombiano.sanitizarInput(termino), 
        pagina, 
        10
      );

      setResultadosBusqueda(response.data);
      setTotalResultados(response.pagination.total);
      setPaginaBusqueda(pagina);
      // setIntentosReintento(0); // Comentado temporalmente

      // Mostrar resultados
      if (response.data.length === 0) {
        setError('No se encontraron colaboradores con ese término de búsqueda');
        mostrarAdvertencia(
          'Sin resultados', 
          'No se encontraron colaboradores. Intenta con otros criterios de búsqueda.'
        );
      } else {
        mostrarExito(
          'Búsqueda exitosa',
          `Se encontraron ${response.data.length} colaborador(es)`
        );
      }

    } catch (err: any) {
      console.error('Error en búsqueda:', err);
      ManejadorErrores.logearError(err, 'busqueda_colaboradores');

      const errorInfo = ManejadorErrores.analizarErrorHttp(err);
      const mensajeContextual = ManejadorErrores.obtenerMensajeContextual('busqueda', errorInfo);

      setError(mensajeContextual);
      setResultadosBusqueda([]);
      setTotalResultados(0);

      // Manejo específico por tipo de error SIN REINTENTOS AUTOMÁTICOS
      if (errorInfo.codigo === 'UNAUTHORIZED') {
        mostrarError('Sesión expirada', 'Redirigiendo al login...');
        setTimeout(async () => {
          await logout();
          navigate('/login');
        }, 2000);
      } else {
        mostrarError(
          errorInfo.titulo || 'Error en búsqueda', 
          errorInfo.mensaje || 'No se pudo completar la búsqueda. Intenta nuevamente.'
        );
        
        if (errorInfo.sugerencias) {
          setTimeout(() => {
            mostrarInfo('Sugerencias', errorInfo.sugerencias!.join(' • '));
          }, 1000);
        }
      }
    } finally {
      setLoadingBusqueda(false);
    }
  };

  // Validación en tiempo real del término de búsqueda
  const validarTerminoEnTiempoReal = (termino: string) => {
    setEstadoValidacion('validating');

    if (termino.length === 0) {
      setEstadoValidacion('idle');
      setMensajeValidacion('');
      return;
    }

    if (termino.length < 3) {
      setEstadoValidacion('invalid');
      setMensajeValidacion('Mínimo 3 caracteres para buscar');
      return;
    }

    // Usar el validador existente para términos de búsqueda
    const resultadoValidacion = ValidadorColombiano.validarTerminoBusqueda(termino);
    
    if (!resultadoValidacion.esValido) {
      setEstadoValidacion('invalid');
      setMensajeValidacion(resultadoValidacion.mensaje);
    } else {
      setEstadoValidacion('valid');
      
      // Dar feedback específico según el tipo detectado
      if (/^\d+$/.test(termino)) {
        // Es un número, verificar si es cédula válida
        const resultadoCedula = ValidadorColombiano.validarCedula(termino);
        setMensajeValidacion(resultadoCedula.esValido ? 'Cédula válida ✓' : 'Número de documento ✓');
      } else {
        // Es texto, verificar como nombre
        const resultadoNombre = ValidadorColombiano.validarNombre(termino);
        setMensajeValidacion(resultadoNombre.esValido ? 'Nombre válido ✓' : 'Término de búsqueda válido ✓');
      }
    }
  };

  // Manejar cambio en el input con validación
  const manejarCambioTermino = (valor: string) => {
    const terminoSanitizado = ValidadorColombiano.sanitizarInput(valor);
    setTerminoBusqueda(terminoSanitizado);
    validarTerminoEnTiempoReal(terminoSanitizado);
  };

  const seleccionarColaborador = async (colaborador: Colaborador) => {
    if (!colaborador || !colaborador.id) {
      mostrarError('Error de validación', 'Información del colaborador incompleta');
      return;
    }

    setColaboradorSeleccionado(colaborador);
    setVistaActiva('detalle');
    setLoadingDetalle(true);
    setLoadingUbicaciones(true);
    setError(null);

    mostrarInfo('Cargando datos...', `Obteniendo información de ${colaborador.nombre} ${colaborador.apellido}`);

    try {
      // Cargar jornadas con retry automático y manejo de errores específicos
      let jornadasCargadas = false;
      try {
        const jornadasResponse = await ManejadorErrores.reintentar(
          () => colaboradoresService.getHistorialJornadas(colaborador.id, { limit: 10 }),
          3
        );
        setJornadasColaborador(jornadasResponse.data.jornadas);
        jornadasCargadas = true;
      } catch (jornadasError: any) {
        console.error('Error cargando jornadas:', jornadasError);
        const errorInfo = ManejadorErrores.analizarErrorHttp(jornadasError);
        mostrarAdvertencia('Jornadas no disponibles', errorInfo.mensaje);
        setJornadasColaborador([]); // Fallback
      }

      // Cargar ubicaciones GPS con retry y manejo de errores independiente
      let ubicacionesCargadas = false;
      try {
        const ubicacionesResponse = await ManejadorErrores.reintentar(
          () => colaboradoresService.getUbicacionesGPS(colaborador.id, { limit: 20 }),
          3
        );
        setUbicacionesGPS(ubicacionesResponse.data.ubicaciones);
        ubicacionesCargadas = true;
      } catch (ubicacionesError: any) {
        console.error('Error cargando ubicaciones:', ubicacionesError);
        const errorInfo = ManejadorErrores.analizarErrorHttp(ubicacionesError);
        mostrarAdvertencia('Ubicaciones no disponibles', errorInfo.mensaje);
        setUbicacionesGPS([]); // Fallback
      }

      // Mostrar resultado del proceso de carga
      if (jornadasCargadas && ubicacionesCargadas) {
        mostrarExito('Datos cargados', 'Información completa del colaborador disponible');
      } else if (jornadasCargadas || ubicacionesCargadas) {
        mostrarAdvertencia('Carga parcial', 'Algunos datos no están disponibles temporalmente');
      } else {
        mostrarAdvertencia('Datos limitados', 'Mostrando información básica del colaborador');
      }

    } catch (err: any) {
      console.error('Error crítico cargando detalle:', err);
      const errorAnalizado = ManejadorErrores.analizarErrorHttp(err);
      mostrarError('Error al cargar información', errorAnalizado.mensaje);
      setError('Error al cargar información detallada del colaborador');
      
      // Fallback: mantener vista de detalle pero sin datos adicionales
      setJornadasColaborador([]);
      setUbicacionesGPS([]);
    } finally {
      setLoadingDetalle(false);
      setLoadingUbicaciones(false);
    }
  };

  return (
    <div className="consultas-colaboradores">
      <NavigationBar />
      
      <div className="consultas-colaboradores__container">
        <div className="consultas-colaboradores__content">
          
          {/* VISTA BÚSQUEDA */}
          {vistaActiva === 'busqueda' && (
            <>
              {/* Buscador Moderno */}
              <div className="consultas-colaboradores__buscador">
                <div className="consultas-colaboradores__buscador-header">
                  <div className="header-icon-container">
                    <div className="search-icon-animated">
                      <span className="icon-main">🔍</span>
                      <span className="icon-pulse"></span>
                    </div>
                  </div>
                  
                  <div className="header-content">
                    <h1 className="consultas-colaboradores__title">
                      Búsqueda Inteligente de Colaboradores
                    </h1>
                    <p className="consultas-colaboradores__subtitle">
                      Encuentra empleados por documento o apellidos • Ver jornadas • Ubicaciones GPS • Horas extras
                    </p>
                  </div>
                  
                  <div className="header-stats">
                    <div className="stat-item">
                      <span className="stat-number">{totalResultados}</span>
                      <span className="stat-label">encontrados</span>
                    </div>
                  </div>
                </div>

                <div className="consultas-colaboradores__search-container">
                  <div className="search-form-wrapper">
                    <div className="consultas-colaboradores__input-group">
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <span>👤</span>
                        </div>
                        <input
                          type="text"
                          className={`consultas-colaboradores__search-input ${
                            estadoValidacion === 'valid' ? 'valid' :
                            estadoValidacion === 'invalid' ? 'invalid' :
                            estadoValidacion === 'validating' ? 'validating' : ''
                          }`}
                          placeholder="Documento, nombre o apellidos del colaborador..."
                          value={terminoBusqueda}
                          onChange={(e) => manejarCambioTermino(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && estadoValidacion === 'valid') {
                              buscarColaboradores(terminoBusqueda);
                            }
                          }}
                        />
                        
                        {/* Feedback de validación */}
                        <div className="input-validation">
                          {estadoValidacion === 'validating' && (
                            <div className="validation-message validating">
                              <span className="validation-icon">⏳</span>
                              <span>Validando...</span>
                            </div>
                          )}
                          
                          {estadoValidacion === 'valid' && (
                            <div className="validation-message valid">
                              <span className="validation-icon">✅</span>
                              <span>{mensajeValidacion}</span>
                            </div>
                          )}
                          
                          {estadoValidacion === 'invalid' && (
                            <div className="validation-message invalid">
                              <span className="validation-icon">❌</span>
                              <span>{mensajeValidacion}</span>
                            </div>
                          )}
                          
                          {estadoValidacion === 'idle' && (
                            <div className="input-counter">
                              <span className={terminoBusqueda.length >= 3 ? 'valid' : 'invalid'}>
                                {terminoBusqueda.length}/3
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="button-group">
                        <button
                          type="button"
                          className="consultas-colaboradores__search-btn primary"
                          onClick={() => buscarColaboradores(terminoBusqueda)}
                          disabled={loadingBusqueda || estadoValidacion !== 'valid'}
                        >
                          <span className="btn-icon">
                            {loadingBusqueda ? '⏳' : '�'}
                          </span>
                          <span className="btn-text">
                            {loadingBusqueda ? 'Buscando...' : 'Buscar Ahora'}
                          </span>
                          <div className="btn-loader" style={{ display: loadingBusqueda ? 'block' : 'none' }}>
                            <div className="loader-spinner"></div>
                          </div>
                        </button>

                        {terminoBusqueda && (
                          <button
                            type="button"
                            className="consultas-colaboradores__search-btn secondary"
                            onClick={() => {
                              setTerminoBusqueda('');
                              setResultadosBusqueda([]);
                              setError(null);
                            }}
                          >
                            <span className="btn-icon">🗑️</span>
                            <span className="btn-text">Limpiar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="search-hints">
                      <div className="hint-item">
                        <span className="hint-icon">💡</span>
                        <span className="hint-text">Ejemplos: "12345678", "Pérez", "Juan Carlos"</span>
                      </div>
                      <div className="hint-item">
                        <span className="hint-icon">⚡</span>
                        <span className="hint-text">Búsqueda instantánea con mínimo 3 caracteres</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="consultas-colaboradores__error">
                      <div className="error-icon">⚠️</div>
                      <div className="error-content">
                        <div className="error-title">Error de Búsqueda</div>
                        <div className="error-message">{error}</div>
                      </div>
                      <button 
                        className="error-dismiss"
                        onClick={() => setError(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {loadingBusqueda && (
                    <div className="consultas-colaboradores__resultados">
                      <div className="consultas-colaboradores__resultados-header">
                        <div className="resultados-header-info">
                          <h2 className="consultas-colaboradores__results-title">
                            🔄 Buscando Colaboradores
                          </h2>
                          <div className="resultados-badge loading">
                            <span className="badge-text">Consultando...</span>
                          </div>
                        </div>
                      </div>

                      {/* Skeleton Cards */}
                      <div className="consultas-colaboradores__cards-grid">
                        {[...Array(6)].map((_, index) => (
                          <div key={`skeleton-${index}`} className="colaborador-card skeleton">
                            <div className="card-header">
                              <div className="colaborador-avatar skeleton-element">
                                <div className="skeleton-circle"></div>
                              </div>
                              <div className="colaborador-basic">
                                <div className="skeleton-element skeleton-line-lg"></div>
                                <div className="skeleton-element skeleton-line-sm"></div>
                              </div>
                            </div>
                            
                            <div className="card-body">
                              <div className="colaborador-info">
                                <div className="info-item">
                                  <div className="skeleton-element skeleton-line-md"></div>
                                </div>
                                <div className="info-item">
                                  <div className="skeleton-element skeleton-line-md"></div>
                                </div>
                                <div className="info-item">
                                  <div className="skeleton-element skeleton-line-sm"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="card-footer">
                              <div className="skeleton-element skeleton-button"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resultados en Cards Modernas */}
              {resultadosBusqueda.length > 0 && (
                <div className="consultas-colaboradores__resultados">
                  <div className="consultas-colaboradores__resultados-header">
                    <div className="resultados-header-info">
                      <h2 className="consultas-colaboradores__results-title">
                        📊 Resultados Encontrados
                      </h2>
                      <div className="resultados-badge">
                        <span className="badge-count">{totalResultados}</span>
                        <span className="badge-text">colaboradores</span>
                      </div>
                    </div>
                    
                    <div className="resultados-actions">
                      <button 
                        className="btn-reporte-directo"
                        title="Acceso directo al Centro de Reportes para generar reportes Excel de todos los colaboradores por fechas"
                        onClick={() => {
                          setVistaActiva('reportes');
                          // Scroll suave hacia la sección de reportes después de un pequeño delay
                          setTimeout(() => {
                            const reportesSection = document.querySelector('.consultas-colaboradores__reportes');
                            if (reportesSection) {
                              reportesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                          mostrarExito('Acceso directo', '📊 Centro de Reportes abierto. Genere reportes Excel de todos los colaboradores por fechas.');
                        }}
                      >
                        <span>📊</span>
                        <span>Reporte General</span>
                      </button>
                    </div>
                  </div>

                  {/* Vista Cards Responsive */}
                  <div className="consultas-colaboradores__cards-grid">
                    {resultadosBusqueda.map((colaborador) => (
                      <div key={colaborador.id} className="colaborador-card">
                        <div className="card-header">
                          <div className="colaborador-avatar">
                            <span className="avatar-initials">
                              {colaborador.nombre.charAt(0)}{colaborador.apellido.charAt(0)}
                            </span>
                            <div className={`status-indicator status-${colaborador.estado}`}></div>
                          </div>
                          <div className="colaborador-basic">
                            <h3 className="colaborador-name">
                              {colaborador.nombre} {colaborador.apellido}
                            </h3>
                            <p className="colaborador-id">ID: {colaborador.documento}</p>
                            <div className={`status-badge status-${colaborador.estado}`}>
                              {colaborador.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                            </div>
                          </div>
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <div className="info-item">
                              <span className="info-icon">📞</span>
                              <div className="info-content">
                                <span className="info-label">Teléfono</span>
                                <span className="info-value">{colaborador.telefono || 'No registrado'}</span>
                              </div>
                            </div>
                            
                            <div className="info-item">
                              <span className="info-icon">📧</span>
                              <div className="info-content">
                                <span className="info-label">Email</span>
                                <span className="info-value">{colaborador.email || 'No registrado'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="info-row">
                            <div className="info-item">
                              <span className="info-icon">🏢</span>
                              <div className="info-content">
                                <span className="info-label">Regional</span>
                                <span className="info-value">{colaborador.regional_nombre}</span>
                              </div>
                            </div>

                            <div className="info-item">
                              <span className="info-icon">📍</span>
                              <div className="info-content">
                                <span className="info-label">Ubicación</span>
                                <span className="info-value">{(colaborador as any).ubicacion_especifica || 'General'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="info-row">
                            <div className="info-item full-width">
                              <span className="info-icon">👥</span>
                              <div className="info-content">
                                <span className="info-label">Tipo de Usuario</span>
                                <span className="info-value tipo-usuario">
                                  {(colaborador as any).tipo_usuario?.toUpperCase() || 'EMPLEADO'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card-footer">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-primary"
                              onClick={() => seleccionarColaborador(colaborador)}
                            >
                              <span className="btn-icon">👁️</span>
                              <span className="btn-text">Ver Detalles</span>
                            </button>
                            
                            <button
                              className="btn-action btn-secondary"
                              onClick={() => {
                                seleccionarColaborador(colaborador);
                                setTimeout(() => setVistaActiva('mapa'), 100);
                              }}
                            >
                              <span className="btn-icon">🗺️</span>
                              <span className="btn-text">Ver Ubicación</span>
                            </button>

                            <button
                              className="btn-action btn-accent"
                              onClick={() => {
                                seleccionarColaborador(colaborador);
                                setTimeout(() => setVistaActiva('horas-extras'), 100);
                              }}
                            >
                              <span className="btn-icon">⏰</span>
                              <span className="btn-text">Horas Extras</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalResultados > 10 && (
                    <div className="consultas-colaboradores__pagination">
                      <button
                        className="pagination-btn prev"
                        onClick={() => buscarColaboradores(terminoBusqueda, paginaBusqueda - 1)}
                        disabled={paginaBusqueda <= 1 || loadingBusqueda}
                      >
                        <span className="btn-icon">⬅️</span>
                        <span>Anterior</span>
                      </button>
                      
                      <div className="pagination-info">
                        <span className="page-current">Página {paginaBusqueda}</span>
                        <span className="page-total">de {Math.ceil(totalResultados / 10)}</span>
                      </div>
                      
                      <button
                        className="pagination-btn next"
                        onClick={() => buscarColaboradores(terminoBusqueda, paginaBusqueda + 1)}
                        disabled={resultadosBusqueda.length < 10 || loadingBusqueda}
                      >
                        <span>Siguiente</span>
                        <span className="btn-icon">➡️</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Estado Sin Resultados */}
              {!loadingBusqueda && resultadosBusqueda.length === 0 && terminoBusqueda.length >= 3 && !error && (
                <div className="consultas-colaboradores__no-resultados">
                  <div className="no-resultados-content">
                    <div className="no-resultados-icon">
                      🔍
                    </div>
                    
                    <div className="no-resultados-message">
                      <h3>No se encontraron colaboradores</h3>
                      <p>No hay resultados para "<strong>{terminoBusqueda}</strong>"</p>
                    </div>
                    
                    <div className="no-resultados-suggestions">
                      <div className="suggestion-title">💡 Sugerencias de búsqueda:</div>
                      <ul className="suggestion-list">
                        <li>Verifica que el número de documento esté completo</li>
                        <li>Intenta buscar por apellido en lugar de nombre</li>
                        <li>Revisa la ortografía de nombres y apellidos</li>
                        <li>Prueba con solo el primer apellido</li>
                      </ul>
                    </div>
                    
                    <div className="no-resultados-actions">
                      <button
                        className="btn-suggestion"
                        onClick={() => {
                          // Generar sugerencia automática
                          if (/^\d+$/.test(terminoBusqueda) && terminoBusqueda.length < 10) {
                            const sugerencia = terminoBusqueda.padStart(8, '0');
                            manejarCambioTermino(sugerencia);
                          }
                        }}
                      >
                        📝 Probar con formato estándar
                      </button>
                      
                      <button
                        className="btn-suggestion secondary"
                        onClick={() => {
                          setTerminoBusqueda('');
                          setEstadoValidacion('idle');
                          setMensajeValidacion('');
                        }}
                      >
                        🔄 Nueva búsqueda
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VISTA DETALLE */}
          {vistaActiva !== 'busqueda' && colaboradorSeleccionado && (
            <div className="consultas-colaboradores__detalle">
              <div className="consultas-colaboradores__detalle-header">
                <button
                  className="consultas-colaboradores__btn-back"
                  onClick={() => setVistaActiva('busqueda')}
                >
                  ← Volver a Búsqueda
                </button>
                <h1 className="consultas-colaboradores__colaborador-name">
                  👤 {colaboradorSeleccionado.nombre} {colaboradorSeleccionado.apellido}
                </h1>
                <div className="consultas-colaboradores__colaborador-meta">
                  📄 {colaboradorSeleccionado.documento} | 🏢 {colaboradorSeleccionado.departamento}
                </div>
              </div>

              {/* Navegación de pestañas */}
              <div className="consultas-colaboradores__tabs">
                <button
                  className={`tab-btn ${vistaActiva === 'detalle' ? 'active' : ''}`}
                  onClick={() => setVistaActiva('detalle')}
                >
                  📋 Jornadas Recientes
                </button>
                <button
                  className={`tab-btn ${vistaActiva === 'mapa' ? 'active' : ''}`}
                  onClick={() => setVistaActiva('mapa')}
                >
                  🗺️ Ubicaciones GPS
                </button>
                <button
                  className={`tab-btn ${vistaActiva === 'horas-extras' ? 'active' : ''}`}
                  onClick={() => setVistaActiva('horas-extras')}
                >
                  ⏰ Horas Extras
                </button>
                <button
                  className={`tab-btn ${vistaActiva === 'reportes' ? 'active' : ''}`}
                  onClick={() => setVistaActiva('reportes')}
                >
                  📊 Reportes
                </button>
              </div>

              <div className="consultas-colaboradores__tab-content">
                
                {/* JORNADAS RECIENTES */}
                {vistaActiva === 'detalle' && (
                  <div className="consultas-colaboradores__jornadas">
                    <h2>📅 Jornadas Laborales Recientes</h2>
                    
                    {loadingDetalle ? (
                      <div className="consultas-colaboradores__loading">
                        🔄 Cargando jornadas...
                      </div>
                    ) : jornadasColaborador.length > 0 ? (
                      <div className="jornadas-grid">
                        {jornadasColaborador.map((jornada) => (
                          <div key={jornada.id} className="jornada-card">
                            <div className="jornada-fecha">📅 {formatearSoloFecha(jornada.fecha)}</div>
                            <div className="jornada-horario">
                              <span className="entrada">🟢 Entrada: {formatearFechaColombiana(jornada.entrada)}</span>
                              <span className="salida">🔴 Salida: {formatearFechaColombiana(jornada.salida)}</span>
                            </div>
                            
                            {jornada.almuerzo_inicio && (
                              <div className="jornada-descansos">
                                <div className="almuerzo">
                                  🍽️ Almuerzo: {formatearFechaColombiana(jornada.almuerzo_inicio)} - {formatearFechaColombiana(jornada.almuerzo_fin)}
                                  <span className="duracion">({jornada.duracion_almuerzo})</span>
                                </div>
                              </div>
                            )}

                            <div className="jornada-horas">
                              ⏱️ Total trabajadas: {jornada.horas_trabajadas || 'No calculado'}h
                            </div>

                            {jornada.latitud_entrada && (
                              <div className="jornada-gps">
                                📍 GPS registrado
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="consultas-colaboradores__no-data">
                        📭 No hay jornadas registradas para este colaborador
                      </div>
                    )}
                  </div>
                )}

                {/* UBICACIONES GPS */}
                {vistaActiva === 'mapa' && (() => {
                  console.log('🗺️ Renderizando pestaña GPS:', {
                    colaboradorSeleccionado: !!colaboradorSeleccionado,
                    ubicacionesGPS: ubicacionesGPS.length,
                    ubicacionesFiltradas: ubicacionesFiltradas.length,
                    loadingUbicaciones,
                    fechaFiltroMapa
                  });
                  return true;
                })() && (
                  <div className="consultas-colaboradores__ubicaciones">
                    <h2>🗺️ Ubicaciones GPS</h2>
                    
                    {/* Controles del mapa - PRIMERO para que el usuario seleccione fecha */}
                    {ubicacionesGPS.length > 0 ? (
                      <div style={{ marginBottom: '20px', marginTop: '15px' }}>
                        <ControlesMapa
                          fechas={[...new Set(ubicacionesGPS.map(u => u.fecha?.split('T')[0]))].sort().reverse()}
                          fechaSeleccionada={fechaFiltroMapa}
                          onFechaChange={setFechaFiltroMapa}
                          totalUbicaciones={ubicacionesFiltradas.length}
                          loading={loadingUbicaciones}
                        />
                      </div>
                    ) : !loadingUbicaciones ? (
                      <div className="consultas-colaboradores__no-data" style={{marginTop: '20px'}}>
                        📍 No hay registros GPS disponibles para este colaborador
                      </div>
                    ) : null}
                    
                    {/* Mapa de Google Maps - DESPUÉS de los controles */}
                    {ubicacionesGPS.length > 0 && (
                      <div>
                        <GoogleMapsSimpleLoader>
                          <MapaGoogleSimple
                            ubicaciones={ubicacionesFiltradas}
                            loading={loadingUbicaciones}
                            height="500px"
                          />
                        </GoogleMapsSimpleLoader>
                      </div>
                    )}
                  </div>
                )}

                {vistaActiva === 'horas-extras' && (
                  <div className="consultas-colaboradores__horas-extras">
                    <h2>⏰ Cálculo de Horas Extras</h2>
                    
                    {colaboradorSeleccionado ? (
                      <CalculadoraHorasExtrasComponent
                        jornadas={jornadasColaborador}
                        colaboradorId={colaboradorSeleccionado.id}
                        loading={loadingDetalle}
                      />
                    ) : (
                      <div className="consultas-colaboradores__no-data">
                        📊 Selecciona un colaborador para calcular horas extras
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* VISTA DE REPORTES - INDEPENDIENTE DE COLABORADOR SELECCIONADO */}
          {vistaActiva === 'reportes' && (
            <div className="consultas-colaboradores__reportes">
              <h2>📊 Centro de Reportes</h2>
              
              {/* REPORTE GENERAL POR FECHAS */}
              <div className="reporte-general">
                <div className="reporte-info">
                  <div className="info-card">
                    <div className="info-icon">📈</div>
                    <div className="info-text">
                      <h3>Reporte General por Fechas</h3>
                      <p>
                        Genera reportes consolidados de todos los colaboradores en un rango de fechas específico
                      </p>
                    </div>
                  </div>
                </div>
                
                <ReportePorFechasComponent />
              </div>
              
              {/* INFORMACIÓN ADICIONAL */}
              <div className="reportes-help">
                <div className="help-card">
                  <div className="help-icon">💡</div>
                  <div className="help-content">
                    <h4>Información sobre los reportes:</h4>
                    <ul>
                      <li><strong>Formato Excel:</strong> Descarga directa en formato .xlsx con datos consolidados</li>
                      <li><strong>Filtros por fecha:</strong> Selecciona el rango de fechas para generar el reporte</li>
                      <li><strong>Datos incluidos:</strong> Jornadas laborales, horas trabajadas, novedades y ubicaciones GPS</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ConsultasColaboradoresPage;