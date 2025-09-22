import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { NavigationBar } from '../components/common/NavigationBar';
import { Clock, MapPin, Play, Pause, Square, Coffee, Utensils, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';

interface JornadaState {
  entrada?: string;
  descansoMananaInicio?: string;
  descansoMananaFin?: string;
  almuerzoInicio?: string;
  almuerzoFin?: string;
  descansoTardeInicio?: string;
  descansoTardeFin?: string;
  salida?: string;
  horasTrabajadas: number;
  ubicacionValida: boolean;
  enDescanso: boolean;
  tipoDescansoActivo?: 'manana' | 'tarde' | 'almuerzo';
}

interface UbicacionActual {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const JornadaLaboralPage: React.FC = () => {
  const { usuario } = useAuthStore();
  const [jornada, setJornada] = useState<JornadaState>({
    horasTrabajadas: 0,
    ubicacionValida: false,
    enDescanso: false
  });
  
  const [ubicacionActual, setUbicacionActual] = useState<UbicacionActual | null>(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [tiempoDescanso, setTiempoDescanso] = useState(0);
  const [horaActual, setHoraActual] = useState(new Date());

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Obtener ubicación en tiempo real
  useEffect(() => {
    if (navigator.geolocation) {
      setCargandoUbicacion(true);
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUbicacionActual({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setCargandoUbicacion(false);
          validarUbicacion(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setCargandoUbicacion(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Validar ubicación contra regional asignada (tolerancia 10m)
  const validarUbicacion = (lat: number, lng: number) => {
    if (!usuario?.regional_id) {
      setJornada(prev => ({ ...prev, ubicacionValida: false }));
      return;
    }

    // Simulamos coordenadas de la regional del usuario
    // En producción esto vendría de la BD
    const regionalLat = 4.7110; // Bogotá ejemplo
    const regionalLng = -74.0721;
    
    const distancia = calcularDistancia(lat, lng, regionalLat, regionalLng);
    const ubicacionValida = distancia <= 10; // 10 metros de tolerancia
    
    setJornada(prev => ({ ...prev, ubicacionValida }));
  };

  // Calcular distancia entre dos puntos en metros
  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Formatear tiempo para display
  const formatearTiempo = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular duración entre dos tiempos
  const calcularDuracion = (inicio: string, fin?: string) => {
    const inicioDate = new Date(inicio);
    const finDate = fin ? new Date(fin) : new Date();
    const diff = finDate.getTime() - inicioDate.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  // Registrar entrada
  const registrarEntrada = async () => {
    if (!jornada.ubicacionValida) return;
    
    const ahora = new Date().toISOString();
    setJornada(prev => ({ ...prev, entrada: ahora }));
    // TODO: Llamar API backend
  };

  // Registrar almuerzo
  const registrarAlmuerzo = async () => {
    if (!jornada.ubicacionValida) return;
    
    const ahora = new Date().toISOString();
    
    if (!jornada.almuerzoInicio) {
      setJornada(prev => ({ 
        ...prev, 
        almuerzoInicio: ahora,
        enDescanso: true,
        tipoDescansoActivo: 'almuerzo'
      }));
    } else {
      setJornada(prev => ({ 
        ...prev, 
        almuerzoFin: ahora,
        enDescanso: false,
        tipoDescansoActivo: undefined
      }));
    }
    // TODO: Llamar API backend
  };

  // Registrar salida
  const registrarSalida = async () => {
    if (!jornada.ubicacionValida) return;
    
    const ahora = new Date().toISOString();
    setJornada(prev => ({ ...prev, salida: ahora }));
    // TODO: Llamar API backend
  };

  // Registrar descanso
  const registrarDescanso = async (tipo: 'manana' | 'tarde') => {
    if (!jornada.ubicacionValida) return;
    
    const ahora = new Date().toISOString();
    
    if (tipo === 'manana') {
      if (!jornada.descansoMananaInicio) {
        setJornada(prev => ({ 
          ...prev, 
          descansoMananaInicio: ahora,
          enDescanso: true,
          tipoDescansoActivo: 'manana'
        }));
      } else {
        setJornada(prev => ({ 
          ...prev, 
          descansoMananaFin: ahora,
          enDescanso: false,
          tipoDescansoActivo: undefined
        }));
      }
    } else {
      if (!jornada.descansoTardeInicio) {
        setJornada(prev => ({ 
          ...prev, 
          descansoTardeInicio: ahora,
          enDescanso: true,
          tipoDescansoActivo: 'tarde'
        }));
      } else {
        setJornada(prev => ({ 
          ...prev, 
          descansoTardeFin: ahora,
          enDescanso: false,
          tipoDescansoActivo: undefined
        }));
      }
    }
    // TODO: Llamar API backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar 
        titulo="Jornada Laboral"
        subtitulo="Control de tiempo y asistencia"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header con información del empleado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Hola, {usuario?.nombre}!
              </h1>
              <p className="text-gray-600 mt-1">
                {horaActual.toLocaleDateString('es-CO', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-oxitrans-red">
                {horaActual.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <p className="text-sm text-gray-500">Hora actual</p>
            </div>
          </div>
        </div>

        {/* Estado de ubicación */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${jornada.ubicacionValida ? 'bg-green-100' : 'bg-red-100'}`}>
              <MapPin className={`w-6 h-6 ${jornada.ubicacionValida ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Estado de Ubicación</h3>
              {cargandoUbicacion ? (
                <p className="text-gray-600">Obteniendo ubicación...</p>
              ) : jornada.ubicacionValida ? (
                <p className="text-green-600">✓ Ubicación válida - Puedes registrar actividades</p>
              ) : (
                <p className="text-red-600">✗ Fuera del área autorizada</p>
              )}
            </div>
            {ubicacionActual && (
              <div className="text-right text-sm text-gray-500">
                <p>Precisión: {Math.round(ubicacionActual.accuracy)}m</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de acciones principales */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-oxitrans-red" />
              Registros Obligatorios
            </h2>

            <div className="space-y-4">
              {/* Entrada */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${jornada.entrada ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Play className={`w-4 h-4 ${jornada.entrada ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Entrada</p>
                    {jornada.entrada && (
                      <p className="text-sm text-green-600">{formatearTiempo(jornada.entrada)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={registrarEntrada}
                  disabled={!jornada.ubicacionValida || !!jornada.entrada}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    jornada.entrada
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : jornada.ubicacionValida
                      ? 'bg-oxitrans-red text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {jornada.entrada ? 'Registrado' : 'Registrar'}
                </button>
              </div>

              {/* Almuerzo */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    jornada.almuerzoFin ? 'bg-green-100' : 
                    jornada.almuerzoInicio ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Utensils className={`w-4 h-4 ${
                      jornada.almuerzoFin ? 'text-green-600' : 
                      jornada.almuerzoInicio ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Almuerzo</p>
                    {jornada.almuerzoInicio && (
                      <div className="text-sm">
                        <span className="text-blue-600">Inicio: {formatearTiempo(jornada.almuerzoInicio)}</span>
                        {jornada.almuerzoFin && (
                          <span className="text-green-600 ml-2">
                            - Fin: {formatearTiempo(jornada.almuerzoFin)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={registrarAlmuerzo}
                  disabled={!jornada.ubicacionValida || !jornada.entrada || !!jornada.salida}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !jornada.entrada
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : !jornada.ubicacionValida
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : jornada.almuerzoFin
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : jornada.almuerzoInicio
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {jornada.almuerzoFin ? 'Completado' : 
                   jornada.almuerzoInicio ? 'Finalizar' : 'Iniciar'}
                </button>
              </div>

              {/* Salida */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${jornada.salida ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Square className={`w-4 h-4 ${jornada.salida ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Salida</p>
                    {jornada.salida && (
                      <p className="text-sm text-green-600">{formatearTiempo(jornada.salida)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={registrarSalida}
                  disabled={!jornada.ubicacionValida || !jornada.entrada || !jornada.almuerzoFin || !!jornada.salida}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    jornada.salida
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : !jornada.entrada || !jornada.almuerzoFin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : jornada.ubicacionValida
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {jornada.salida ? 'Registrado' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>

          {/* Panel de descansos opcionales */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-oxitrans-red" />
              Descansos Opcionales
            </h2>

            <div className="space-y-4">
              {/* Descanso Mañana */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    jornada.descansoMananaFin ? 'bg-green-100' : 
                    jornada.descansoMananaInicio ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Pause className={`w-4 h-4 ${
                      jornada.descansoMananaFin ? 'text-green-600' : 
                      jornada.descansoMananaInicio ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Descanso Mañana</p>
                    <p className="text-xs text-gray-500">Máximo 15 minutos</p>
                    {jornada.descansoMananaInicio && (
                      <div className="text-sm">
                        {jornada.descansoMananaFin ? (
                          <span className="text-green-600">
                            {calcularDuracion(jornada.descansoMananaInicio, jornada.descansoMananaFin)}
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            En curso: {calcularDuracion(jornada.descansoMananaInicio)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => registrarDescanso('manana')}
                  disabled={!jornada.ubicacionValida || !jornada.entrada || !!jornada.salida}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !jornada.entrada
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : jornada.descansoMananaFin
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : jornada.descansoMananaInicio
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {jornada.descansoMananaFin ? 'Usado' : 
                   jornada.descansoMananaInicio ? 'Finalizar' : 'Iniciar'}
                </button>
              </div>

              {/* Descanso Tarde */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    jornada.descansoTardeFin ? 'bg-green-100' : 
                    jornada.descansoTardeInicio ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Pause className={`w-4 h-4 ${
                      jornada.descansoTardeFin ? 'text-green-600' : 
                      jornada.descansoTardeInicio ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Descanso Tarde</p>
                    <p className="text-xs text-gray-500">Máximo 15 minutos</p>
                    {jornada.descansoTardeInicio && (
                      <div className="text-sm">
                        {jornada.descansoTardeFin ? (
                          <span className="text-green-600">
                            {calcularDuracion(jornada.descansoTardeInicio, jornada.descansoTardeFin)}
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            En curso: {calcularDuracion(jornada.descansoTardeInicio)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => registrarDescanso('tarde')}
                  disabled={!jornada.ubicacionValida || !jornada.entrada || !jornada.almuerzoFin || !!jornada.salida}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !jornada.entrada || !jornada.almuerzoFin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : jornada.descansoTardeFin
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : jornada.descansoTardeInicio
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {jornada.descansoTardeFin ? 'Usado' : 
                   jornada.descansoTardeInicio ? 'Finalizar' : 'Iniciar'}
                </button>
              </div>
            </div>

            {/* Resumen del día */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Resumen del Día
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Horas trabajadas</p>
                  <p className="font-semibold text-lg text-oxitrans-red">
                    {jornada.horasTrabajadas.toFixed(1)}h / 8.0h
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Estado</p>
                  <p className={`font-semibold ${jornada.enDescanso ? 'text-yellow-600' : 'text-green-600'}`}>
                    {jornada.enDescanso ? `En ${jornada.tipoDescansoActivo}` : 'Trabajando'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas y notificaciones */}
        {!jornada.ubicacionValida && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Ubicación no válida</h3>
                <p className="text-red-700">
                  Debes estar en la ubicación de tu regional asignada para registrar actividades.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JornadaLaboralPage;