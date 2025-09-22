import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { NavigationBar } from '../components/common/NavigationBar';
import { jornadasService, RegistroJornada, RegistroTiempo } from '../services/jornadasService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, Play, Pause, Square, Coffee, Utensils, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';

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
  });

  // Query para validar ubicación
  const { data: validacionUbicacion, refetch: refetchUbicacion } = useQuery({
    queryKey: ['validar-ubicacion', ubicacionActual?.latitude, ubicacionActual?.longitude],
    queryFn: () => {
      if (!ubicacionActual) return Promise.resolve(null);
      return jornadasService.validarUbicacion(ubicacionActual.latitude, ubicacionActual.longitude);
    },
    enabled: !!ubicacionActual,
  });

  // Mutation para registrar tiempo
  const registrarTiempoMutation = useMutation({
    mutationFn: (data: RegistroTiempo) => jornadasService.registrarTiempo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jornada-actual'] });
    },
    onError: (error: any) => {
      console.error('Error registrando tiempo:', error);
      alert(error.response?.data?.message || 'Error registrando tiempo');
    }
  });

  // Obtener ubicación actual
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
        refetchUbicacion();
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

  // Obtener ubicación al cargar
  useEffect(() => {
    obtenerUbicacion();
  }, []);

  // Función para registrar evento
  const registrarEvento = async (tipo: RegistroTiempo['tipo']) => {
    if (!ubicacionActual) {
      alert('Esperando ubicación GPS...');
      return;
    }

    // Validar ubicación para entrada y salida
    if ((tipo === 'entrada' || tipo === 'salida') && !validacionUbicacion?.valida) {
      alert('Debes estar en la ubicación de trabajo para registrar entrada/salida');
      return;
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

  const formatearHora = (fecha?: string) => {
    if (!fecha) return '--:--';
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="min-h-screen bg-gray-50">
      <NavigationBar title="Jornada Laboral" />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header con información del usuario */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Jornada Laboral
              </h1>
              <p className="text-gray-600 mt-1">
                {usuario?.nombre} {usuario?.apellido} - {usuario?.departamento}
              </p>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">
                {tiempoTranscurrido}
              </div>
              <p className="text-sm text-gray-500">Tiempo trabajado</p>
            </div>
          </div>
        </div>

        {/* Estado de ubicación */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Estado de Ubicación</h3>
                {ubicacionError ? (
                  <p className="text-red-600 text-sm mt-1">{ubicacionError}</p>
                ) : ubicacionActual ? (
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Lat: {ubicacionActual.latitude.toFixed(6)}, Lng: {ubicacionActual.longitude.toFixed(6)}</p>
                    <p>Precisión: {ubicacionActual.accuracy.toFixed(0)}m</p>
                    {validacionUbicacion && (
                      <p className={validacionUbicacion.valida ? 'text-green-600' : 'text-red-600'}>
                        {validacionUbicacion.valida ? '✓ Ubicación válida' : '✗ Fuera del rango permitido'}
                        {!validacionUbicacion.valida && ` (${validacionUbicacion.distancia.toFixed(0)}m de distancia)`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-yellow-600 text-sm mt-1">Obteniendo ubicación...</p>
                )}
              </div>
            </div>
            <button
              onClick={obtenerUbicacion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Botones de registro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Entrada */}
          <button
            onClick={() => registrarEvento('entrada')}
            disabled={!puedeRegistrar('entrada') || registrarTiempoMutation.isPending}
            className={`p-6 rounded-lg shadow-lg transition-all ${
              !puedeRegistrar('entrada')
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : jornada?.entrada
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-white text-gray-900 hover:bg-orange-50 hover:border-orange-300 border-2 border-gray-200'
            }`}
          >
            <div className="text-center">
              {jornada?.entrada ? (
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600" />
              ) : (
                <Play className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              )}
              <h3 className="font-semibold mb-2">Entrada</h3>
              <p className="text-sm">
                {jornada?.entrada ? formatearHora(jornada.entrada) : 'Registrar'}
              </p>
            </div>
          </button>

          {/* Almuerzo */}
          <button
            onClick={() => registrarEvento(jornada?.almuerzoInicio && !jornada?.almuerzoFin ? 'almuerzo_fin' : 'almuerzo_inicio')}
            disabled={
              (!puedeRegistrar('almuerzo_inicio') && !puedeRegistrar('almuerzo_fin')) ||
              registrarTiempoMutation.isPending
            }
            className={`p-6 rounded-lg shadow-lg transition-all ${
              !puedeRegistrar('almuerzo_inicio') && !puedeRegistrar('almuerzo_fin')
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : jornada?.almuerzoInicio && jornada?.almuerzoFin
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : jornada?.almuerzoInicio
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                : 'bg-white text-gray-900 hover:bg-orange-50 hover:border-orange-300 border-2 border-gray-200'
            }`}
          >
            <div className="text-center">
              {jornada?.almuerzoInicio && jornada?.almuerzoFin ? (
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600" />
              ) : jornada?.almuerzoInicio ? (
                <Pause className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
              ) : (
                <Utensils className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              )}
              <h3 className="font-semibold mb-2">Almuerzo</h3>
              <p className="text-sm">
                {jornada?.almuerzoInicio && jornada?.almuerzoFin
                  ? `${formatearHora(jornada.almuerzoInicio)} - ${formatearHora(jornada.almuerzoFin)}`
                  : jornada?.almuerzoInicio
                  ? `Desde ${formatearHora(jornada.almuerzoInicio)}`
                  : 'Iniciar'
                }
              </p>
            </div>
          </button>

          {/* Descanso Mañana */}
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
            className={`p-6 rounded-lg shadow-lg transition-all ${
              !puedeRegistrar('descanso_manana_inicio') && !puedeRegistrar('descanso_manana_fin')
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : jornada?.descansoMananaInicio && jornada?.descansoMananaFin
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : jornada?.descansoMananaInicio
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                : 'bg-white text-gray-900 hover:bg-orange-50 hover:border-orange-300 border-2 border-gray-200'
            }`}
          >
            <div className="text-center">
              {jornada?.descansoMananaInicio && jornada?.descansoMananaFin ? (
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600" />
              ) : jornada?.descansoMananaInicio ? (
                <Pause className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
              ) : (
                <Coffee className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              )}
              <h3 className="font-semibold mb-2">Descanso AM</h3>
              <p className="text-sm">
                {jornada?.descansoMananaInicio && jornada?.descansoMananaFin
                  ? `${formatearHora(jornada.descansoMananaInicio)} - ${formatearHora(jornada.descansoMananaFin)}`
                  : jornada?.descansoMananaInicio
                  ? `Desde ${formatearHora(jornada.descansoMananaInicio)}`
                  : 'Iniciar'
                }
              </p>
            </div>
          </button>

          {/* Salida */}
          <button
            onClick={() => registrarEvento('salida')}
            disabled={!puedeRegistrar('salida') || registrarTiempoMutation.isPending}
            className={`p-6 rounded-lg shadow-lg transition-all ${
              !puedeRegistrar('salida')
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : jornada?.salida
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-white text-gray-900 hover:bg-orange-50 hover:border-orange-300 border-2 border-gray-200'
            }`}
          >
            <div className="text-center">
              {jornada?.salida ? (
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600" />
              ) : (
                <Square className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              )}
              <h3 className="font-semibold mb-2">Salida</h3>
              <p className="text-sm">
                {jornada?.salida ? formatearHora(jornada.salida) : 'Registrar'}
              </p>
            </div>
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
                  {jornada.horasTrabajadas.toFixed(2)}h
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
            
            {jornada.autoCerrada && (
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
  );
};

export default JornadaLaboralPage;