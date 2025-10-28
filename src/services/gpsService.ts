import { create } from 'zustand';
import { DispositivoService } from './dispositivoService';

export interface UbicacionActual {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GPSState {
  ubicacionActual: UbicacionActual | null;
  error: string | null;
  cargando: boolean;
  intentoActual: number;
  precision: number | null;
  watchId: number | null;
  ultimaValidacion: {
    valida: boolean;
    distancia: number;
    tolerancia: number;
    ubicacion: {
      nombre: string;
      latitud: number;
      longitud: number;
    } | null;
    tipoValidacion: 'ubicacion_especifica' | 'regional' | 'sin_restriccion' | 'visita_flexible';
    timestamp: number;
  } | null;
  // Métodos
  obtenerUbicacion: () => Promise<UbicacionActual | null>;
  obtenerUbicacionAvanzada: () => Promise<UbicacionActual | null>;
  detenerTracking: () => void;
  limpiarUbicacion: () => void;
  establecerUltimaValidacion: (validacion: any) => void;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos de caché para ubicación
const PRECISION_EXCELENTE = 20; // Metros
const PRECISION_BUENA = 50; // Metros
const PRECISION_ACEPTABLE = 100; // Metros
const PRECISION_LAPTOP_ACEPTABLE = 500; // Metros para laptops/WiFi
const MAX_INTENTOS = 5; // Más intentos para laptops
const MAX_LECTURAS_PROMEDIO = 3; // Número de lecturas para promediar

export const useGPSStore = create<GPSState>((set, get) => ({
  ubicacionActual: null,
  error: null,
  cargando: false,
  intentoActual: 0,
  precision: null,
  ultimaValidacion: null,
  watchId: null,

  obtenerUbicacion: async () => {
    // 🚀 LOG DE CONTEXTO AL INICIAR GPS
    DispositivoService.logContextoCompleto();
    
    // Si ya hay una ubicación reciente y precisa, reutilizarla
    const { ubicacionActual } = get();
    const ahora = Date.now();
    if (
      ubicacionActual &&
      ahora - ubicacionActual.timestamp < CACHE_DURATION &&
      ubicacionActual.accuracy <= PRECISION_BUENA
    ) {
      console.log('🎯 [GPS] Usando ubicación en caché con precisión:', Math.round(ubicacionActual.accuracy));
      return ubicacionActual;
    }

    // Iniciar proceso de obtención
    set({ cargando: true, error: null, intentoActual: 1, precision: null });

    if (!navigator.geolocation) {
      set({ error: 'Geolocalización no disponible en este dispositivo', cargando: false });
      return null;
    }

    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
      set({ intentoActual: intento });
      
      try {
        console.log(`🎯 [GPS] Intento ${intento}/${MAX_INTENTOS}...`);
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          // 🚀 CONFIGURACIÓN INTELIGENTE POR DISPOSITIVO
          const opcionesBase = DispositivoService.obtenerConfigGPSOptimizada();
          const opciones = {
            ...opcionesBase,
            timeout: intento === 1 ? opcionesBase.timeout : (opcionesBase.timeout || 15000) + 5000,
            maximumAge: intento === 1 ? 0 : (opcionesBase.maximumAge || 10000)
          };
          
          navigator.geolocation.getCurrentPosition(resolve, reject, opciones);
        });

        const precision = position.coords.accuracy;
        set({ precision });
        
        console.log(`🎯 [GPS] Intento ${intento} exitoso:`, {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precision: Math.round(precision),
          hora: new Date().toLocaleTimeString()
        });
        
        // Si la precisión es excelente o es el último intento, usar esta ubicación
        if (precision <= PRECISION_EXCELENTE || intento === MAX_INTENTOS || intento >= 2 && precision <= PRECISION_BUENA) {
          const nuevaUbicacion: UbicacionActual = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: precision,
            timestamp: Date.now()
          };
          
          set({
            ubicacionActual: nuevaUbicacion,
            cargando: false,
            intentoActual: 0,
            error: precision > PRECISION_ACEPTABLE 
              ? `Precisión limitada (±${Math.round(precision)}m). Para mayor precisión, sal al exterior.`
              : null
          });
          
          return nuevaUbicacion;
        }
        
        // Si la precisión no es suficiente, esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error: any) {
        console.error(`❌ [GPS] Error en intento ${intento}:`, error);
        
        // Si es el último intento, fallar con error
        if (intento === MAX_INTENTOS) {
          let mensajeError = 'Error al obtener ubicación';
          
          if (error.code) {
            switch (error.code) {
              case 1: // PERMISSION_DENIED
                mensajeError = 'Permiso de ubicación denegado. Activa el GPS en tu dispositivo.';
                break;
              case 2: // POSITION_UNAVAILABLE
                mensajeError = 'Ubicación no disponible. Verifica tu conexión GPS.';
                break;
              case 3: // TIMEOUT
                mensajeError = 'Tiempo agotado al obtener ubicación. Intenta en un área con mejor señal.';
                break;
            }
          }
          
          set({ error: mensajeError, cargando: false, intentoActual: 0 });
          return null;
        }
        
        // Esperar un poco antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    set({ cargando: false, intentoActual: 0 });
    return get().ubicacionActual;
  },

  obtenerUbicacionAvanzada: async () => {
    // Función avanzada que promedia múltiples lecturas para mejor precisión
    console.log('🚀 [GPS-AVANZADO] Iniciando GPS de alta precisión...');
    DispositivoService.logContextoCompleto();
    
    set({ cargando: true, error: null });
    
    if (!navigator.geolocation) {
      set({ error: 'Geolocalización no disponible', cargando: false });
      return null;
    }

    try {
      const lecturas: GeolocationPosition[] = [];
      
      // Tomar múltiples lecturas
      for (let i = 0; i < MAX_LECTURAS_PROMEDIO; i++) {
        set({ intentoActual: i + 1 });
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          // 🚀 CONFIGURACIÓN AVANZADA OPTIMIZADA
          const opcionesOptimizadas = DispositivoService.obtenerConfigGPSOptimizada();
          const opciones = {
            ...opcionesOptimizadas,
            maximumAge: 0 // Siempre fresco para GPS avanzado
          };
          
          navigator.geolocation.getCurrentPosition(resolve, reject, opciones);
        });
        
        lecturas.push(position);
        
        // Pequeña pausa entre lecturas
        if (i < MAX_LECTURAS_PROMEDIO - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Promediar coordenadas
      const latSum = lecturas.reduce((sum, pos) => sum + pos.coords.latitude, 0);
      const lonSum = lecturas.reduce((sum, pos) => sum + pos.coords.longitude, 0);
      const accSum = lecturas.reduce((sum, pos) => sum + pos.coords.accuracy, 0);
      
      const ubicacionPromediada: UbicacionActual = {
        latitude: latSum / lecturas.length,
        longitude: lonSum / lecturas.length,
        accuracy: accSum / lecturas.length, // Promedio de precisión
        timestamp: Date.now()
      };
      
      console.log(`🎯 [GPS-AVANZADO] Ubicación promediada de ${lecturas.length} lecturas:`, {
        precision: Math.round(ubicacionPromediada.accuracy),
        mejora: `${Math.round(((lecturas[0].coords.accuracy - ubicacionPromediada.accuracy) / lecturas[0].coords.accuracy) * 100)}%`
      });
      
      // Evaluar si la precisión es aceptable para el tipo de dispositivo
      const esLaptop = !('DeviceMotionEvent' in window); // Detección básica
      const umbralPrecision = esLaptop ? PRECISION_LAPTOP_ACEPTABLE : PRECISION_ACEPTABLE;
      
      set({
        ubicacionActual: ubicacionPromediada,
        cargando: false,
        intentoActual: 0,
        error: ubicacionPromediada.accuracy > umbralPrecision 
          ? `Precisión limitada (±${Math.round(ubicacionPromediada.accuracy)}m). ${esLaptop ? 'Usando laptop/WiFi.' : 'Sal al exterior para mejor GPS.'}`
          : null
      });
      
      return ubicacionPromediada;
      
    } catch (error: any) {
      console.error('❌ [GPS-AVANZADO] Error:', error);
      set({ 
        error: 'Error obteniendo ubicación precisa. Intenta con GPS básico.',
        cargando: false, 
        intentoActual: 0 
      });
      return null;
    }
  },

  detenerTracking: () => {
    const { watchId } = get();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      set({ watchId: null });
      console.log('🛑 [GPS] Tracking detenido');
    }
  },

  limpiarUbicacion: () => set({ ubicacionActual: null, error: null }),

  establecerUltimaValidacion: (validacion) => set({ 
    ultimaValidacion: {
      ...validacion,
      timestamp: Date.now()
    }
  })
}));

class GPSService {
  /**
   * Obtener ubicación actual con alta precisión 
   */
  async obtenerUbicacionPrecisa(): Promise<UbicacionActual | null> {
    return useGPSStore.getState().obtenerUbicacion();
  }

  /**
   * Calcular distancia entre dos puntos usando fórmula de Haversine
   */
  calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Verificar si una ubicación es válida para el trabajo
   * Usa la última validación en caché si está disponible y es reciente
   */
  async validarUbicacion(_latitud: number, _longitud: number, forzarValidacion = false): Promise<any> {
    const { ultimaValidacion } = useGPSStore.getState();
    const ahora = Date.now();
    
    // Si hay una validación reciente (menos de 5 minutos) y no se fuerza nueva validación
    if (
      !forzarValidacion && 
      ultimaValidacion && 
      ahora - ultimaValidacion.timestamp < 5 * 60 * 1000
    ) {
      console.log('✅ [GPS] Usando validación en caché:', ultimaValidacion);
      return ultimaValidacion;
    }
    
    // Implementar la llamada al API aquí
    // Esta parte depende de jornadasService.validarUbicacion
    // En una implementación futura
    
    return null;
  }
}

export const gpsService = new GPSService();