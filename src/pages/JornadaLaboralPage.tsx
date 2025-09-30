import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import NavigationBar from '../components/common/NavigationBar';
import { jornadasService } from '../services/jornadasService';
import type { RegistroTiempo } from '../services/jornadasService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Play, Pause, Square, Coffee, Utensils, CheckCircle2, AlertTriangle } from 'lucide-react';
import '../styles/jornada-laboral-direct.css';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('JornadaLaboralPage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50">
          <NavigationBar title="Jornada Laboral" />
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h3 className="font-medium text-red-800">Error en la aplicación</h3>
                  <p className="text-red-600 mt-1">
                    {this.state.error?.message || 'Error desconocido'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Recargar página
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface UbicacionActual {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const JornadaLaboralPage: React.FC = () => {
  const { usuario } = useAuthStore();
  const queryClient = useQueryClient();
  const [ubicacionActual, setUbicacionActual] = useState<UbicacionActual | null>(null);
  const [ubicacionError, setUbicacionError] = useState<string | null>(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<string>('00:00:00');

  // Query para obtener jornada actual
  const { data: jornada, isLoading, error, refetch } = useQuery({
    queryKey: ['jornada-actual'],
    queryFn: () => jornadasService.obtenerJornadaActual(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
    enabled: !!usuario, // Solo ejecutar si hay usuario autenticado
  });

  // Debug: log de la jornada
  React.useEffect(() => {
    if (jornada) {
      console.log('Jornada data:', jornada);
      console.log('horasTrabajadas type:', typeof jornada.horasTrabajadas);
      console.log('horasTrabajadas value:', jornada.horasTrabajadas);
    }
  }, [jornada]);

  // Mutation para validar ubicación
  const validarUbicacionMutation = useMutation({
    mutationFn: (coords: { latitude: number; longitude: number }) => 
      jornadasService.validarUbicacion(coords.latitude, coords.longitude),
    onError: (error: Error) => {
      console.error('Error validando ubicación:', error);
    }
  });

  // Mutation para registrar tiempo
  const registrarTiempoMutation = useMutation({
    mutationFn: (data: RegistroTiempo) => jornadasService.registrarTiempo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jornada-actual'] });
    },
    onError: (error: Error) => {
      console.error('Error registrando tiempo:', error);
      alert(error.message || 'Error registrando tiempo');
    }
  });

  // Obtener ubicación actual (función estable sin dependencias)
  const obtenerUbicacion = async () => {
    if (!navigator.geolocation) {
      setUbicacionError('Geolocalización no está disponible en este dispositivo');
      return;
    }

    setUbicacionError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUbicacionActual(ubicacion);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setUbicacionError(`Error de geolocalización: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Actualizar tiempo transcurrido
  useEffect(() => {
    const interval = setInterval(() => {
      if (jornada?.entrada) {
        const entrada = new Date(jornada.entrada);
        const ahora = new Date();
        
        let tiempoTotal = ahora.getTime() - entrada.getTime();

        // Restar tiempo de almuerzo si está en curso o terminado
        if (jornada.almuerzoInicio) {
          const almuerzoInicio = new Date(jornada.almuerzoInicio);
          const almuerzoFin = jornada.almuerzoFin ? new Date(jornada.almuerzoFin) : ahora;
          tiempoTotal -= (almuerzoFin.getTime() - almuerzoInicio.getTime());
        }

        // Restar descansos completados
        if (jornada.descansoMananaInicio && jornada.descansoMananaFin) {
          const inicio = new Date(jornada.descansoMananaInicio);
          const fin = new Date(jornada.descansoMananaFin);
          tiempoTotal -= (fin.getTime() - inicio.getTime());
        }

        if (jornada.descansoTardeInicio && jornada.descansoTardeFin) {
          const inicio = new Date(jornada.descansoTardeInicio);
          const fin = new Date(jornada.descansoTardeFin);
          tiempoTotal -= (fin.getTime() - inicio.getTime());
        }

        const horas = Math.floor(tiempoTotal / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tiempoTotal % (1000 * 60)) / 1000);

        setTiempoTranscurrido(
          `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
        );
      } else {
        setTiempoTranscurrido('00:00:00');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jornada]);

  // Obtener ubicación al cargar (solo una vez)
  useEffect(() => {
    obtenerUbicacion();
  }, []); // Solo ejecutar una vez al montar el componente

  // Función para registrar evento
  const registrarEvento = async (tipo: RegistroTiempo['tipo']) => {
    if (!ubicacionActual) {
      alert('Esperando ubicación GPS...');
      return;
    }

    // Validar ubicación para entrada y salida antes de registrar
    if (tipo === 'entrada' || tipo === 'salida') {
      try {
        const validacion = await validarUbicacionMutation.mutateAsync({
          latitude: ubicacionActual.latitude,
          longitude: ubicacionActual.longitude
        });
        
        if (!validacion.valida) {
          alert('Debes estar en la ubicación de trabajo para registrar entrada/salida');
          return;
        }
      } catch (error) {
        console.error('Error validando ubicación:', error);
        alert('Error al validar ubicación. Inténtalo de nuevo.');
        return;
      }
    }

    const registro: RegistroTiempo = {
      tipo,
      timestamp: new Date().toISOString(),
      ubicacion: ubicacionActual,
      observaciones: ''
    };

    registrarTiempoMutation.mutate(registro);
  };

  // Verificar si puede registrar el siguiente evento
  const puedeRegistrar = (tipo: string): boolean => {
    if (!jornada) return tipo === 'entrada';

    switch (tipo) {
      case 'entrada':
        return !jornada.entrada;
      case 'almuerzo_inicio':
        return !!jornada.entrada && !jornada.almuerzoInicio;
      case 'almuerzo_fin':
        return !!jornada.almuerzoInicio && !jornada.almuerzoFin;
      case 'salida':
        return !!jornada.entrada && !!jornada.almuerzoFin && !jornada.salida;
      case 'descanso_manana_inicio':
        return !!jornada.entrada && !jornada.descansoMananaInicio;
      case 'descanso_manana_fin':
        return !!jornada.descansoMananaInicio && !jornada.descansoMananaFin;
      case 'descanso_tarde_inicio':
        return !!jornada.entrada && !!jornada.almuerzoFin && !jornada.descansoTardeInicio;
      case 'descanso_tarde_fin':
        return !!jornada.descansoTardeInicio && !jornada.descansoTardeFin;
      default:
        return false;
    }
  };

  // Verificar si el usuario está autenticado
  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar title="Jornada Laboral" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Usuario no autenticado</h3>
                <p className="text-yellow-600 mt-1">
                  Debes iniciar sesión para acceder a esta página.
                </p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Ir a Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatearHora = (fecha?: string) => {
    if (!fecha) return '--:--';
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota' // Zona horaria de Colombia
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar title="Jornada Laboral" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando jornada...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar title="Jornada Laboral" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Error cargando jornada</h3>
                <p className="text-red-600 mt-1">
                  {error instanceof Error ? error.message : 'Error desconocido'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="jornada-laboral">
        <NavigationBar title="Jornada Laboral" />
        
        <div className="jornada-laboral__container">
        {/* Header con información del usuario */}
        <div className="jornada-laboral__header">
          <h1>Jornada Laboral</h1>
          <div className="jornada-laboral__header-info">
            <div className="info-item">
              <span className="label">Empleado</span>
              <span className="value">
                {usuario?.nombre} {usuario?.apellido}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Departamento</span>
              <span className="value">{usuario?.departamento}</span>
            </div>
            <div className="info-item">
              <span className="label">Fecha</span>
              <span className="value">
                {new Date().toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Tiempo trabajado</span>
              <span className="value tiempo-trabajado">
                {tiempoTranscurrido.startsWith('-') ? '00:00:00' : tiempoTranscurrido}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de ubicación */}
        <div className="jornada-laboral__ubicacion">
          <h2>
            <MapPin className="h-6 w-6" />
            Estado de Ubicación
          </h2>
          
          <div className="jornada-laboral__ubicacion-content">
            <div className="jornada-laboral__ubicacion-details">
              {ubicacionError ? (
                <p className="status invalida">
                  <AlertTriangle className="h-4 w-4" />
                  {ubicacionError}
                </p>
              ) : ubicacionActual ? (
                <>
                  <div className="coords">
                    Lat: {ubicacionActual.latitude.toFixed(6)}, Lng: {ubicacionActual.longitude.toFixed(6)}
                  </div>
                  <div className="coords precision">
                    Precisión: {ubicacionActual.accuracy.toFixed(0)}m
                  </div>
                  {validarUbicacionMutation.data && (
                    <div className={`status ${validarUbicacionMutation.data.valida ? 'valida' : 'invalida'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                      {validarUbicacionMutation.data.valida ? (
                        <>
                          Ubicación válida
                          {validarUbicacionMutation.data.ubicacion && (
                            <div className="ubicacion-info">
                              📍 {validarUbicacionMutation.data.ubicacion.nombre}
                              {validarUbicacionMutation.data.tipoValidacion === 'ubicacion_especifica' && 
                                ' (Ubicación específica)'}
                              {validarUbicacionMutation.data.tipoValidacion === 'regional' && 
                                ' (Ubicación regional)'}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          Fuera del rango permitido
                          <div className="distancia-info">
                            {validarUbicacionMutation.data.distancia.toFixed(0)}m de distancia
                            {validarUbicacionMutation.data.ubicacion && (
                              <span> desde {validarUbicacionMutation.data.ubicacion.nombre}</span>
                            )}
                            <span> (máx: {validarUbicacionMutation.data.tolerancia}m)</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="status cargando">Obteniendo ubicación...</p>
              )}
            </div>
            
            <div className="jornada-laboral__ubicacion-actions">
              <button
                onClick={obtenerUbicacion}
                className="jornada-laboral__btn-accion"
              >
                <MapPin className="h-4 w-4" />
                Actualizar GPS
              </button>
              
              {ubicacionActual && (
                <button
                  onClick={() => validarUbicacionMutation.mutate({
                    latitude: ubicacionActual.latitude,
                    longitude: ubicacionActual.longitude
                  })}
                  disabled={validarUbicacionMutation.isPending}
                  className="jornada-laboral__btn-accion secundario"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {validarUbicacionMutation.isPending ? 'Validando...' : 'Validar Ubicación'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Botones de registro - ORDEN CORRECTO */}
        <div className="jornada-laboral__botones">
          {/* 1. Entrada */}
          <button
            onClick={() => registrarEvento('entrada')}
            disabled={!puedeRegistrar('entrada') || registrarTiempoMutation.isPending}
            className={`jornada-laboral__boton-evento entrada ${
              jornada?.entrada ? 'completado' : ''
            }`}
          >
            <div className={`icono entrada`}>
              {jornada?.entrada ? (
                <CheckCircle2 />
              ) : (
                <Play />
              )}
            </div>
            <div className="titulo">Entrada</div>
            <div className="subtitulo">
              {jornada?.entrada ? 'Registrado' : 'Registrar'}
            </div>
            {jornada?.entrada && (
              <div className="hora">
                {formatearHora(jornada.entrada)}
              </div>
            )}
          </button>

          {/* 2. Descanso Mañana */}
          <button
            onClick={() => registrarEvento(
              jornada?.descansoMananaInicio && !jornada?.descansoMananaFin 
                ? 'descanso_manana_fin' 
                : 'descanso_manana_inicio'
            )}
            disabled={
              (!puedeRegistrar('descanso_manana_inicio') && !puedeRegistrar('descanso_manana_fin')) ||
              registrarTiempoMutation.isPending
            }
            className={`jornada-laboral__boton-evento descanso ${
              (jornada?.descansoMananaInicio && jornada?.descansoMananaFin) ? 'completado' : ''
            }`}
          >
            <div className="icono descanso">
              {jornada?.descansoMananaInicio && jornada?.descansoMananaFin ? (
                <CheckCircle2 />
              ) : jornada?.descansoMananaInicio ? (
                <Pause />
              ) : (
                <Coffee />
              )}
            </div>
            <div className="titulo">Descanso AM</div>
            <div className="subtitulo">
              {jornada?.descansoMananaInicio && jornada?.descansoMananaFin
                ? 'Completado'
                : jornada?.descansoMananaInicio
                ? 'En curso'
                : 'Iniciar'
              }
            </div>
            {(jornada?.descansoMananaInicio || jornada?.descansoMananaFin) && (
              <div className="hora">
                {jornada?.descansoMananaInicio && jornada?.descansoMananaFin
                  ? `${formatearHora(jornada.descansoMananaInicio)} - ${formatearHora(jornada.descansoMananaFin)}`
                  : jornada?.descansoMananaInicio
                  ? `Desde ${formatearHora(jornada.descansoMananaInicio)}`
                  : ''
                }
              </div>
            )}
          </button>

          {/* 3. Almuerzo */}
          <button
            onClick={() => registrarEvento(jornada?.almuerzoInicio && !jornada?.almuerzoFin ? 'almuerzo_fin' : 'almuerzo_inicio')}
            disabled={
              (!puedeRegistrar('almuerzo_inicio') && !puedeRegistrar('almuerzo_fin')) ||
              registrarTiempoMutation.isPending
            }
            className={`jornada-laboral__boton-evento almuerzo ${
              (jornada?.almuerzoInicio && jornada?.almuerzoFin) ? 'completado' : ''
            }`}
          >
            <div className="icono almuerzo">
              {jornada?.almuerzoInicio && jornada?.almuerzoFin ? (
                <CheckCircle2 />
              ) : jornada?.almuerzoInicio ? (
                <Pause />
              ) : (
                <Utensils />
              )}
            </div>
            <div className="titulo">Almuerzo</div>
            <div className="subtitulo">
              {jornada?.almuerzoInicio && jornada?.almuerzoFin
                ? 'Completado'
                : jornada?.almuerzoInicio
                ? 'En curso'
                : 'Iniciar'
              }
            </div>
            {(jornada?.almuerzoInicio || jornada?.almuerzoFin) && (
              <div className="hora">
                {jornada?.almuerzoInicio && jornada?.almuerzoFin
                  ? `${formatearHora(jornada.almuerzoInicio)} - ${formatearHora(jornada.almuerzoFin)}`
                  : jornada?.almuerzoInicio
                  ? `Desde ${formatearHora(jornada.almuerzoInicio)}`
                  : ''
                }
              </div>
            )}
          </button>

          {/* 4. Descanso Tarde - AGREGADO */}
          <button
            onClick={() => registrarEvento(
              jornada?.descansoTardeInicio && !jornada?.descansoTardeFin 
                ? 'descanso_tarde_fin' 
                : 'descanso_tarde_inicio'
            )}
            disabled={
              (!puedeRegistrar('descanso_tarde_inicio') && !puedeRegistrar('descanso_tarde_fin')) ||
              registrarTiempoMutation.isPending
            }
            className={`jornada-laboral__boton-evento descanso ${
              (jornada?.descansoTardeInicio && jornada?.descansoTardeFin) ? 'completado' : ''
            }`}
          >
            <div className="icono descanso">
              {jornada?.descansoTardeInicio && jornada?.descansoTardeFin ? (
                <CheckCircle2 />
              ) : jornada?.descansoTardeInicio ? (
                <Pause />
              ) : (
                <Coffee />
              )}
            </div>
            <div className="titulo">Descanso PM</div>
            <div className="subtitulo">
              {jornada?.descansoTardeInicio && jornada?.descansoTardeFin
                ? 'Completado'
                : jornada?.descansoTardeInicio
                ? 'En curso'
                : 'Iniciar'
              }
            </div>
            {(jornada?.descansoTardeInicio || jornada?.descansoTardeFin) && (
              <div className="hora">
                {jornada?.descansoTardeInicio && jornada?.descansoTardeFin
                  ? `${formatearHora(jornada.descansoTardeInicio)} - ${formatearHora(jornada.descansoTardeFin)}`
                  : jornada?.descansoTardeInicio
                  ? `Desde ${formatearHora(jornada.descansoTardeInicio)}`
                  : ''
                }
              </div>
            )}
          </button>

          {/* 5. Salida */}
          <button
            onClick={() => registrarEvento('salida')}
            disabled={!puedeRegistrar('salida') || registrarTiempoMutation.isPending}
            className={`jornada-laboral__boton-evento salida ${
              jornada?.salida ? 'completado' : ''
            }`}
          >
            <div className="icono salida">
              {jornada?.salida ? (
                <CheckCircle2 />
              ) : (
                <Square />
              )}
            </div>
            <div className="titulo">Salida</div>
            <div className="subtitulo">
              {jornada?.salida ? 'Registrado' : 'Registrar'}
            </div>
            {jornada?.salida && (
              <div className="hora">
                {formatearHora(jornada.salida)}
              </div>
            )}
          </button>
        </div>

        {/* Resumen de la jornada */}
        {jornada && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de la Jornada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {typeof jornada?.horasTrabajadas === 'number' 
                    ? jornada.horasTrabajadas.toFixed(2) + 'h'
                    : '0.00h'
                  }
                </div>
                <p className="text-sm text-gray-600">Horas trabajadas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {jornada.entrada ? formatearHora(jornada.entrada) : '--:--'}
                </div>
                <p className="text-sm text-gray-600">Hora de entrada</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {jornada.salida ? formatearHora(jornada.salida) : '--:--'}
                </div>
                <p className="text-sm text-gray-600">Hora de salida</p>
              </div>
            </div>
            
            {jornada?.autoCerrada && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    Esta jornada fue cerrada automáticamente por el sistema.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default JornadaLaboralPage;