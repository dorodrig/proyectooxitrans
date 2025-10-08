import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import NavigationBar from '../components/common/NavigationBar';
import { jornadasService } from '../services/jornadasService';
import type { RegistroTiempo } from '../services/jornadasService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Play, Pause, Square, Coffee, Utensils, CheckCircle2, AlertTriangle } from 'lucide-react';
import '../styles/jornada-laboral-direct.css';
import '../styles/jornada-laboral-gps.css';
import { useGPSStore } from '../services/gpsService';
import { tiempoLaboralService, obtenerTimestampColombia, formatearHoraUI } from '../services/tiempoLaboralService';
import { notificacionesService } from '../services/notificacionesService';
import JornadaTimeline from '../components/jornada/JornadaTimeline';

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

// Usando UbicacionActual desde gpsService.ts

const JornadaLaboralPage: React.FC = () => {
  const { usuario } = useAuthStore();
  const queryClient = useQueryClient();
  const { 
    ubicacionActual, 
    error: ubicacionError, 
    cargando: gpsLoading,
    intentoActual: gpsIntento,
    precision: gpsPrecision,
    obtenerUbicacion: getGPSLocation,
    obtenerUbicacionAvanzada: getGPSLocationAdvanced
  } = useGPSStore();
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<string>('00:00:00');

  // Query para obtener jornada actual
  const { data: jornada, isLoading, error, refetch } = useQuery({
    queryKey: ['jornada-actual'],
    queryFn: () => jornadasService.obtenerJornadaActual(),
    staleTime: 30000,      // Datos frescos por 30 segundos
    gcTime: 5 * 60000,     // Mantener en cache por 5 minutos (antes cacheTime)
    refetchInterval: 30000, // Refrescar cada 30 segundos
    enabled: !!usuario, // Solo ejecutar si hay usuario autenticado
  });

  // Debug: log de la jornada (solo errores)
  React.useEffect(() => {
    if (jornada) {
      // Solo log en desarrollo para errores
      if (process.env.NODE_ENV === 'development' && jornada.horasTrabajadas && typeof jornada.horasTrabajadas !== 'number') {
        console.warn('⚠️ horasTrabajadas no es número:', jornada.horasTrabajadas, typeof jornada.horasTrabajadas);
      }
    }
  }, [jornada]);

  // Forzar refetch inmediato al cargar el componente
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Mutation para validar ubicación
  const validarUbicacionMutation = useMutation({
    mutationFn: (options: { latitude: number; longitude: number; forzarValidacion?: boolean }) => 
      jornadasService.validarUbicacion(
        options.latitude,
        options.longitude,
        options.forzarValidacion || false
      ),
    onSuccess: (data) => {
      // Guardar el resultado de validación en el store para su uso futuro
      useGPSStore.getState().establecerUltimaValidacion(data);
      
      // Mostrar notificación informativa si la validación es relevante
      if (data.valida) {
        const ubicacionNombre = data.ubicacion?.nombre || 'tu ubicación de trabajo';
        const distancia = Math.round(data.distancia);
        
        // Solo mostrar notificación si la distancia es menor a cierto umbral
        if (distancia < 100) {
          notificacionesService.mostrar(
            `Ubicación validada: ${ubicacionNombre} (${distancia}m)`, 
            'success', 
            3000
          );
        }
        alert(`✅ Ubicación válida!\n\nEstás a ${distancia}m de ${ubicacionNombre}.\nPuedes registrar entrada/salida.`);
      } else {
        const distancia = Math.round(data.distancia);
        const tolerancia = data.tolerancia;
        const ubicacionNombre = data.ubicacion?.nombre || 'tu ubicación de trabajo';
        alert(`❌ Ubicación fuera de rango!\n\nEstás a ${distancia}m de ${ubicacionNombre}.\nDistancia máxima permitida: ${tolerancia}m\n\nAcércate más para poder registrar.`);
      }
    },
    onError: (error: Error) => {
      console.error('Error validando ubicación:', error);
      alert('Error al validar ubicación. Verifica tu conexión e inténtalo de nuevo.');
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

  // Ref para inicialización de ubicación
  const ubicacionInicializadaRef = useRef(false);

  // Función wrapper para obtener ubicación usando el store global de GPS
  const obtenerUbicacion = async () => {
    console.log('🎯 [JornadaLaboral] Solicitando ubicación GPS...');
    await getGPSLocation();
    console.log('🎯 [JornadaLaboral] Ubicación obtenida:', ubicacionActual);
  };
  
  // Función para determinar la clase de precisión del GPS
  const getPrecisionClass = (accuracy: number | undefined): string => {
    if (!accuracy) return '';
    if (accuracy <= 20) return 'excelente'; // 20 metros o menos - excelente precisión
    if (accuracy <= 50) return 'buena';     // 50 metros o menos - buena precisión
    return 'baja';                          // Más de 50 metros - baja precisión
  };

  // Actualizar tiempo transcurrido usando el servicio de tiempo laboral
  useEffect(() => {
    const calcularTiempo = () => {
      if (!jornada) {
        setTiempoTranscurrido('00:00:00');
        return;
      }

      try {
        // Usar el servicio especializado para calcular tiempo con precisión
        const tiempoFormateado = tiempoLaboralService.calcularTiempoTranscurrido(jornada);
        setTiempoTranscurrido(tiempoFormateado);
      } catch (error) {
        console.error('Error calculando tiempo transcurrido:', error);
        setTiempoTranscurrido('00:00:00');
      }
    };

    // Calcular inmediatamente
    calcularTiempo();
    
    // Actualizar cada segundo solo si la jornada está activa y no ha terminado
    const interval = setInterval(calcularTiempo, 1000);

    return () => clearInterval(interval);
  }, [jornada]);

  // Obtener ubicación al cargar (solo una vez y controlado)
  useEffect(() => {
    if (!ubicacionInicializadaRef.current && usuario) {
      ubicacionInicializadaRef.current = true;
      console.log('🌐 [INIT] Iniciando GPS por primera vez...');
      // Pequeño delay para asegurar que la página esté completamente cargada
      setTimeout(() => {
        obtenerUbicacion();
      }, 1000);
    }
  }, [usuario]); // Ejecutar cuando el usuario esté disponible

  // Función para registrar evento
  const registrarEvento = async (tipo: RegistroTiempo['tipo']) => {
    if (!ubicacionActual) {
      alert('Esperando ubicación GPS...');
      return;
    }

    // Validar ubicación para entrada y salida antes de registrar
    // Para entrada y salida necesitamos validación estricta, para descansos podemos ser más flexibles
    const necesitaValidacionEstricta = tipo === 'entrada' || tipo === 'salida';
    
    if (necesitaValidacionEstricta) {
      try {
        // Para entrada y salida, forzamos validación siempre para mayor seguridad
        const validacion = await validarUbicacionMutation.mutateAsync({
          latitude: ubicacionActual.latitude,
          longitude: ubicacionActual.longitude,
          forzarValidacion: true // Forzar validación para momentos críticos (entrada/salida)
        });
        
        if (!validacion.valida) {
          const distancia = Math.round(validacion.distancia);
          const tolerancia = validacion.tolerancia;
          const ubicacionNombre = validacion.ubicacion?.nombre || 'tu ubicación de trabajo';
          
          alert(`Estás muy lejos de ${ubicacionNombre}.\n\nDistancia actual: ${distancia}m\nDistancia máxima permitida: ${tolerancia}m\n\nDebes estar dentro de ${tolerancia} metros para registrar entrada/salida.`);
          return;
        }
      } catch (error) {
        console.error('Error validando ubicación:', error);
        alert('Error al validar ubicación. Inténtalo de nuevo.');
        return;
      }
    } else {
      // Para descansos, usar la cache si está disponible (no tan crítico)
      try {
        const validacion = await validarUbicacionMutation.mutateAsync({
          latitude: ubicacionActual.latitude,
          longitude: ubicacionActual.longitude,
          forzarValidacion: false // Usar cache si disponible
        });
        
        if (!validacion.valida) {
          // Para descansos, solo mostrar advertencia pero permitir continuar
          const distancia = Math.round(validacion.distancia);
          const tolerancia = validacion.tolerancia;
          const ubicacionNombre = validacion.ubicacion?.nombre || 'tu ubicación de trabajo';
          
          const continuar = window.confirm(
            `Advertencia: Estás a ${distancia}m de ${ubicacionNombre}, fuera del rango permitido de ${tolerancia}m.\n\n` +
            `¿Deseas continuar de todos modos?`
          );
          
          if (!continuar) return;
        }
      } catch (error) {
        console.error('Error validando ubicación para descanso:', error);
        // En caso de error en validación de descanso, permitir continuar con advertencia
        const continuar = window.confirm(
          'No se pudo validar tu ubicación. ¿Deseas continuar de todos modos?'
        );
        
        if (!continuar) return;
      }
    }

    const timestamp = obtenerTimestampColombia();
    
    // Validación adicional para salida - evitar error de backend
    if (tipo === 'salida' && jornada?.entrada) {
      try {
        const entradaTime = new Date(jornada.entrada).getTime();
        const salidaTime = new Date(timestamp).getTime();
        
        if (salidaTime <= entradaTime) {
          alert('Error: No se puede registrar salida antes o al mismo tiempo que la entrada. ' +
                'Verifica que tengas la hora correcta en tu dispositivo.');
          return;
        }
        
        // Validación adicional: diferencia mínima de 1 minuto
        const diferenciaMinutos = (salidaTime - entradaTime) / (1000 * 60);
        if (diferenciaMinutos < 1) {
          alert('Error: Debe haber al menos 1 minuto de diferencia entre entrada y salida.');
          return;
        }
      } catch (error) {
        console.error('Error validando timestamps:', error);
        alert('Error validando horarios. Por favor intenta de nuevo.');
        return;
      }
    }

    const registro: RegistroTiempo = {
      tipo,
      timestamp,
      ubicacion: ubicacionActual,
      observaciones: ''
    };

    registrarTiempoMutation.mutate(registro);
  };

  // Usando la función obtenerTimestampColombia del tiempoLaboralService

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

  // Usando formatearHoraUI del tiempoLaboralService
  const formatearHora = formatearHoraUI;

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
                  <div className={`coords precision ${getPrecisionClass(ubicacionActual.accuracy)}`}>
                    Precisión: {ubicacionActual.accuracy.toFixed(0)}m
                    <span className="timestamp">
                      ({new Date(ubicacionActual.timestamp).toLocaleTimeString()})
                    </span>
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
              ) : gpsLoading ? (
                <div className="status cargando">
                  <div className="gps-progress">
                    <div className="progress-text">
                      🛰️ Obteniendo ubicación precisa... (Intento {gpsIntento}/3)
                    </div>
                    {gpsPrecision && (
                      <div className="precision-info">
                        Precisión actual: ±{Math.round(gpsPrecision)}m
                      </div>
                    )}
                    <div className="progress-tips">
                      💡 Para mejor precisión: ve al aire libre y espera unos segundos
                    </div>
                  </div>
                </div>
              ) : (
                <p className="status cargando">Ubicación no disponible</p>
              )}
            </div>
            
            <div className="jornada-laboral__ubicacion-actions">
              <button
                onClick={() => obtenerUbicacion()}
                disabled={gpsLoading}
                className={`jornada-laboral__btn-accion ${gpsLoading ? 'cargando' : ''}`}
              >
                <MapPin className="h-4 w-4" />
                {gpsLoading 
                  ? `Obteniendo GPS... (${gpsIntento}/5)` 
                  : 'GPS Rápido'
                }
              </button>
              
              <button
                onClick={() => getGPSLocationAdvanced()}
                disabled={gpsLoading}
                className={`jornada-laboral__btn-accion avanzado ${gpsLoading ? 'cargando' : ''}`}
                title="GPS de alta precisión - Toma múltiples lecturas y las promedia"
              >
                <MapPin className="h-4 w-4" />
                {gpsLoading 
                  ? `GPS Avanzado... (${gpsIntento}/3)` 
                  : 'GPS Alta Precisión'
                }
              </button>
              
              {ubicacionActual && (
                <div className="jornada-laboral__validacion-buttons">
                  <button
                    onClick={() => validarUbicacionMutation.mutate({
                      latitude: ubicacionActual.latitude,
                      longitude: ubicacionActual.longitude,
                      forzarValidacion: false // Usar cache si está disponible
                    })}
                    disabled={validarUbicacionMutation.isPending}
                    className="jornada-laboral__btn-accion secundario"
                    title="Validar usando cache si está disponible"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {validarUbicacionMutation.isPending ? 'Validando...' : 'Validar Ubicación'}
                  </button>
                  
                  <button
                    onClick={() => validarUbicacionMutation.mutate({
                      latitude: ubicacionActual.latitude,
                      longitude: ubicacionActual.longitude,
                      forzarValidacion: true // Ignorar cache y forzar validación
                    })}
                    disabled={validarUbicacionMutation.isPending}
                    className="jornada-laboral__btn-accion forzar-validacion"
                    title="Forzar validación con el servidor, ignorando cache"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Forzar Validación
                  </button>
                </div>
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
                  {jornada ? 
                    (jornada.salida
                      ? (typeof jornada?.horasTrabajadas === 'number' 
                          ? jornada.horasTrabajadas.toFixed(2) + 'h'
                          : tiempoLaboralService.calcularHorasDecimal(jornada).toFixed(2) + 'h')
                      : tiempoLaboralService.calcularHorasDecimal(jornada).toFixed(2) + 'h'
                    ) 
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

        {/* Línea de tiempo visual de la jornada */}
        {jornada && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <JornadaTimeline jornada={jornada} />
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default JornadaLaboralPage;