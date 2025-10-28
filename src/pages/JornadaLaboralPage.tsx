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
import { jornadaConfigService } from '../services/jornadaConfigService';
import { offlineService } from '../services/offlineService';
import JornadaTimeline from '../components/jornada/JornadaTimeline';
import Swal from 'sweetalert2';

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
  const [estaOnline, setEstaOnline] = useState<boolean>(navigator.onLine);
  const [esPWA, setEsPWA] = useState<boolean>(false);

  // Query para obtener jornada actual
  const { data: jornada, isLoading, error, refetch } = useQuery({
    queryKey: ['jornada-actual'],
    queryFn: () => jornadasService.obtenerJornadaActual(),
    staleTime: 30000,      // Datos frescos por 30 segundos
    gcTime: 5 * 60000,     // Mantener en cache por 5 minutos (antes cacheTime)
    refetchInterval: 30000, // Refrescar cada 30 segundos
    enabled: !!usuario, // Solo ejecutar si hay usuario autenticado
  });

  // Query para obtener configuración de tiempo laboral global
  const { data: configMaestra } = useQuery({
    queryKey: ['tiempo-laboral-global'],
    queryFn: () => jornadaConfigService.obtenerTiempoLaboralGlobal(),
    staleTime: 10 * 60000, // Cache por 10 minutos
    enabled: !!usuario, // Solo si hay usuario autenticado
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
        
        // Solo mostrar notificación silenciosa si la distancia es menor a cierto umbral
        if (distancia < 100) {
          notificacionesService.mostrar(
            `Ubicación validada: ${ubicacionNombre} (${distancia}m)`, 
            'success', 
            3000
          );
        }
        // Alert removido - la confirmación se maneja ahora con SweetAlert2 en registrarEvento()
      } else {
        // Alert removido - la validación se maneja ahora con SweetAlert2 en registrarEvento()
        // La validación de distancia se mantiene para uso interno
      }
    },
    onError: (error: Error) => {
      console.error('Error validando ubicación:', error);
      // Error se maneja ahora con SweetAlert2 en registrarEvento()
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
      // Error se maneja ahora con SweetAlert2 en registrarEvento()
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

  // Detectar estado PWA y conectividad
  useEffect(() => {
    // Detectar PWA
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
    setEsPWA(isPWAInstalled);

    // Listeners de conectividad
    const handleOnline = () => setEstaOnline(true);
    const handleOffline = () => setEstaOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para validar horarios según control maestro
  const validarHorarioControlMaestro = (tipoEvento: RegistroTiempo['tipo']): { esValido: boolean; mensaje?: string } => {
    if (!configMaestra) {
      return { esValido: true }; // Si no hay config, permitir (fallback)
    }

    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    
    const horaEntradaMaestra = configMaestra.hora_entrada;
    const horaSalidaMaestra = configMaestra.fin_jornada_laboral;

    // Validaciones por tipo de evento
    switch (tipoEvento) {
      case 'entrada':
        if (horaActual < horaEntradaMaestra) {
          return {
            esValido: false,
            mensaje: `⏰ No puede registrar entrada antes de las ${horaEntradaMaestra}. Hora configurada por administración.`
          };
        }
        break;
      
      case 'salida':
        if (horaActual > horaSalidaMaestra) {
          return {
            esValido: false,
            mensaje: `⏰ La jornada debe cerrarse antes de las ${horaSalidaMaestra}. Contacte a su supervisor para horario extendido.`
          };
        }
        break;
    }

    return { esValido: true };
  };

  // Función para mostrar confirmación con SweetAlert2
  const mostrarConfirmacionAccion = async (tipo: RegistroTiempo['tipo']): Promise<boolean> => {
    const acciones = {
      'entrada': {
        titulo: '🕐 Iniciar Jornada Laboral',
        texto: '¿Está seguro que desea registrar su entrada?',
        icono: '🟢',
        confirmText: 'Sí, registrar entrada',
        successTitle: '¡Entrada registrada!',
        successText: 'Su jornada laboral ha iniciado correctamente'
      },
      'descanso_manana_inicio': {
        titulo: '☕ Iniciar Descanso Mañana',
        texto: '¿Está seguro que desea iniciar su descanso de la mañana?',
        icono: '🟡',
        confirmText: 'Sí, iniciar descanso',
        successTitle: '¡Descanso iniciado!',
        successText: 'Disfrute su descanso de la mañana'
      },
      'descanso_manana_fin': {
        titulo: '☕ Finalizar Descanso Mañana',
        texto: '¿Está seguro que desea finalizar su descanso de la mañana?',
        icono: '🔙',
        confirmText: 'Sí, finalizar descanso',
        successTitle: '¡Descanso finalizado!',
        successText: 'Continuando con la jornada laboral'
      },
      'almuerzo_inicio': {
        titulo: '🍽️ Iniciar Almuerzo',
        texto: '¿Está seguro que desea iniciar su hora de almuerzo?',
        icono: '🔵',
        confirmText: 'Sí, iniciar almuerzo',
        successTitle: '¡Almuerzo iniciado!',
        successText: 'Disfrute su almuerzo'
      },
      'almuerzo_fin': {
        titulo: '🍽️ Finalizar Almuerzo',
        texto: '¿Está seguro que desea finalizar su hora de almuerzo?',
        icono: '🔙',
        confirmText: 'Sí, finalizar almuerzo',
        successTitle: '¡Almuerzo finalizado!',
        successText: 'Continuando con la jornada laboral'
      },
      'descanso_tarde_inicio': {
        titulo: '☕ Iniciar Descanso Tarde',
        texto: '¿Está seguro que desea iniciar su descanso de la tarde?',
        icono: '🟡',
        confirmText: 'Sí, iniciar descanso',
        successTitle: '¡Descanso iniciado!',
        successText: 'Disfrute su descanso de la tarde'
      },
      'descanso_tarde_fin': {
        titulo: '☕ Finalizar Descanso Tarde',
        texto: '¿Está seguro que desea finalizar su descanso de la tarde?',
        icono: '🔙',
        confirmText: 'Sí, finalizar descanso',
        successTitle: '¡Descanso finalizado!',
        successText: 'Continuando con la jornada laboral'
      },
      'salida': {
        titulo: '🔴 Finalizar Jornada Laboral',
        texto: '¿Está seguro que desea registrar su salida?',
        icono: '🔴',
        confirmText: 'Sí, registrar salida',
        successTitle: '¡Salida registrada!',
        successText: 'Su jornada laboral ha finalizado correctamente'
      }
    };

    const accion = acciones[tipo];
    
    const result = await Swal.fire({
      title: accion.titulo,
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 15px;">${accion.icono}</div>
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
            ${accion.texto}
          </p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              📍 Ubicación validada correctamente<br/>
              ⏰ ${new Date().toLocaleTimeString('es-CO', { hour12: false })}
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#dc2626',
      confirmButtonText: accion.confirmText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });

    return result.isConfirmed;
  };

  // Función para mostrar éxito después del registro
  const mostrarExitoRegistro = async (tipo: RegistroTiempo['tipo']) => {
    const acciones = {
      'entrada': { title: '¡Entrada registrada!', text: 'Su jornada laboral ha iniciado correctamente' },
      'descanso_manana_inicio': { title: '¡Descanso iniciado!', text: 'Disfrute su descanso de la mañana' },
      'descanso_manana_fin': { title: '¡Descanso finalizado!', text: 'Continuando con la jornada laboral' },
      'almuerzo_inicio': { title: '¡Almuerzo iniciado!', text: 'Disfrute su almuerzo' },
      'almuerzo_fin': { title: '¡Almuerzo finalizado!', text: 'Continuando con la jornada laboral' },
      'descanso_tarde_inicio': { title: '¡Descanso iniciado!', text: 'Disfrute su descanso de la tarde' },
      'descanso_tarde_fin': { title: '¡Descanso finalizado!', text: 'Continuando con la jornada laboral' },
      'salida': { title: '¡Salida registrada!', text: 'Su jornada laboral ha finalizado correctamente' }
    };

    const accion = acciones[tipo];
    
    await Swal.fire({
      title: accion.title,
      text: accion.text,
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  // Función para registrar evento con confirmación
  const registrarEvento = async (tipo: RegistroTiempo['tipo']) => {
    // 🌐 VALIDACIÓN OFFLINE/ONLINE PWA
    const validacionOffline = await offlineService.validarDisponibilidad(tipo);
    if (!validacionOffline.permitido) {
      await Swal.fire({
        title: 'Conexión Requerida',
        html: `
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">📶</div>
            <p style="color: #dc2626; font-weight: 500;">${validacionOffline.razon}</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
                <strong>💡 Consejo:</strong><br/>
                Verifique su conexión WiFi o datos móviles<br/>
                Los descansos y almuerzo pueden registrarse offline
              </p>
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    if (!ubicacionActual) {
      await Swal.fire({
        title: 'GPS no disponible',
        text: 'Esperando ubicación GPS... Por favor intente de nuevo en unos segundos.',
        icon: 'warning',
        confirmButtonColor: '#059669'
      });
      return;
    }

    // Validar ubicación para entrada y salida antes de registrar
    const necesitaValidacionEstricta = tipo === 'entrada' || tipo === 'salida';
    
    try {
      // Validar ubicación
      const validacion = await validarUbicacionMutation.mutateAsync({
        latitude: ubicacionActual.latitude,
        longitude: ubicacionActual.longitude,
        forzarValidacion: necesitaValidacionEstricta
      });
      
      if (!validacion.valida) {
        const distancia = Math.round(validacion.distancia);
        const tolerancia = validacion.tolerancia;
        const ubicacionNombre = validacion.ubicacion?.nombre || 'tu ubicación de trabajo';
        const tipoValidacion = validacion.tipoValidacion;
        
        // Mensajes personalizados según el tipo de validación
        if (tipoValidacion === 'visita_flexible') {
          // Usuario de visita con tolerancia amplia pero aún fuera de rango
          await Swal.fire({
            title: 'Ubicación de Visita Fuera de Rango',
            html: `
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">🚗</div>
                <p>Como usuario de <strong>visita</strong>, tienes mayor flexibilidad de ubicación</p>
                <div style="background: #fef7cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0; color: #d97706;">
                    <strong>Distancia actual:</strong> ${distancia}m<br/>
                    <strong>Tolerancia de visita:</strong> ${tolerancia}m
                  </p>
                </div>
                <p style="color: #6b7280;">Estás muy lejos de ${ubicacionNombre}. Por favor acércate más para poder registrar tu ${tipo}.</p>
              </div>
            `,
            icon: 'warning',
            confirmButtonColor: '#d97706'
          });
          return;
        }
        
        if (necesitaValidacionEstricta) {
          // Para entrada y salida, mostrar error y no permitir continuar
          await Swal.fire({
            title: 'Ubicación fuera de rango',
            html: `
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">📍</div>
                <p>Estás muy lejos de <strong>${ubicacionNombre}</strong></p>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 0; color: #dc2626;">
                    <strong>Distancia actual:</strong> ${distancia}m<br/>
                    <strong>Distancia máxima:</strong> ${tolerancia}m
                  </p>
                </div>
                <p style="color: #6b7280;">Debes estar dentro de ${tolerancia} metros para registrar entrada/salida.</p>
              </div>
            `,
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
          return;
        } else {
          // Para descansos, permitir continuar con advertencia
          const result = await Swal.fire({
            title: 'Advertencia de ubicación',
            html: `
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <p>Estás a <strong>${distancia}m</strong> de ${ubicacionNombre}</p>
                <p>Fuera del rango permitido de <strong>${tolerancia}m</strong></p>
                <p style="color: #6b7280;">¿Deseas continuar de todos modos?</p>
              </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Continuar de todos modos',
            cancelButtonText: 'Cancelar'
          });
          
          if (!result.isConfirmed) return;
        }
      }
    } catch (error) {
      console.error('Error validando ubicación:', error);
      const result = await Swal.fire({
        title: 'Error de validación',
        text: 'No se pudo validar tu ubicación. ¿Deseas continuar de todos modos?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        cancelButtonColor: '#dc2626',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
      });
      
      if (!result.isConfirmed) return;
    }

    // 🚨 VALIDACIÓN CONTROL MAESTRO - NUEVOS HORARIOS
    const validacionHorario = validarHorarioControlMaestro(tipo);
    if (!validacionHorario.esValido) {
      await Swal.fire({
        title: 'Horario no permitido',
        html: `
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">⏰</div>
            <p style="color: #dc2626; font-weight: 500;">${validacionHorario.mensaje}</p>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Configuración empresarial:</strong><br/>
                Entrada permitida desde: <strong>${configMaestra?.hora_entrada || 'N/A'}</strong><br/>
                Jornada finaliza a las: <strong>${configMaestra?.fin_jornada_laboral || 'N/A'}</strong>
              </p>
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    // Validación adicional para salida
    if (tipo === 'salida' && jornada?.entrada) {
      const timestamp = obtenerTimestampColombia();
      try {
        const entradaTime = new Date(jornada.entrada).getTime();
        const salidaTime = new Date(timestamp).getTime();
        
        if (salidaTime <= entradaTime) {
          await Swal.fire({
            title: 'Error de horario',
            text: 'No se puede registrar salida antes o al mismo tiempo que la entrada. Verifica la hora de tu dispositivo.',
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
          return;
        }
        
        const diferenciaMinutos = (salidaTime - entradaTime) / (1000 * 60);
        if (diferenciaMinutos < 1) {
          await Swal.fire({
            title: 'Tiempo insuficiente',
            text: 'Debe haber al menos 1 minuto de diferencia entre entrada y salida.',
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
          return;
        }
      } catch (error) {
        console.error('Error validando timestamps:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Error validando horarios. Por favor intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
    }

    // Mostrar confirmación con SweetAlert2
    const confirmado = await mostrarConfirmacionAccion(tipo);
    if (!confirmado) return;

    const timestamp = obtenerTimestampColombia();
    const registro: RegistroTiempo = {
      tipo,
      timestamp,
      ubicacion: ubicacionActual,
      observaciones: validacionOffline.modoOffline ? '[Registrado offline]' : ''
    };

    // 📱 MODO OFFLINE: Almacenar localmente si es evento permitido offline
    if (validacionOffline.modoOffline) {
      try {
        await offlineService.almacenarEventoOffline({
          tipo,
          timestamp,
          ubicacion: ubicacionActual,
          observaciones: 'Registrado en modo offline - sincronización pendiente'
        });
        
        // Simular éxito para la UI
        mostrarExitoRegistro(tipo);
        
        // Refrescar datos para actualizar la UI
        setTimeout(() => {
          refetch();
        }, 1000);
        
        return;
      } catch (error) {
        console.error('Error almacenando evento offline:', error);
        await Swal.fire({
          title: 'Error modo offline',
          text: 'No se pudo almacenar el evento offline. Intente cuando tenga conexión.',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
    }

    // 🌐 MODO ONLINE: Registrar normalmente
    registrarTiempoMutation.mutate(registro, {
      onSuccess: () => {
        // Mostrar mensaje de éxito
        mostrarExitoRegistro(tipo);
      },
      onError: (error) => {
        console.error('Error registrando evento:', error);
        Swal.fire({
          title: 'Error al registrar',
          text: error instanceof Error ? error.message : 'Error desconocido al registrar el evento',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    });
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
            {configMaestra && (
              <div className="info-item">
                <span className="label">Horario empresarial</span>
                <span className="value" style={{ fontSize: '0.9rem', color: '#059669' }}>
                  {configMaestra.hora_entrada} - {configMaestra.fin_jornada_laboral}
                </span>
              </div>
            )}
            {esPWA && (
              <div className="info-item">
                <span className="label">Estado</span>
                <span className="value" style={{ 
                  fontSize: '0.9rem', 
                  color: estaOnline ? '#059669' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: estaOnline ? '#10b981' : '#ef4444' 
                  }}></span>
                  {estaOnline ? '🌐 Online' : '📱 Offline'}
                </span>
              </div>
            )}
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

        {/* Estado de sincronización offline (solo en PWA) */}
        {esPWA && (
          <OfflineStatusComponent />
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

// Componente para mostrar el estado offline
const OfflineStatusComponent: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<{ pendientes: number; ultimaSincronizacion?: string }>({ pendientes: 0 });

  useEffect(() => {
    const actualizarEstadisticas = () => {
      const stats = offlineService.obtenerEstadisticas();
      setEstadisticas(stats);
    };

    // Actualizar al montar
    actualizarEstadisticas();

    // Actualizar cada 5 segundos
    const interval = setInterval(actualizarEstadisticas, 5000);

    return () => clearInterval(interval);
  }, []);

  if (estadisticas.pendientes === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="animate-pulse">
            <span className="text-blue-500 text-lg">📱</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Eventos offline pendientes
          </h3>
          <div className="mt-1 text-sm text-blue-600">
            <p>
              {estadisticas.pendientes} registro{estadisticas.pendientes !== 1 ? 's' : ''} esperando sincronización
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Se sincronizarán automáticamente cuando tengas conexión
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => offlineService.sincronizarEventosOffline()}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm"
            disabled={!navigator.onLine}
          >
            {navigator.onLine ? '🔄 Sincronizar' : '📶 Sin conexión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JornadaLaboralPage;