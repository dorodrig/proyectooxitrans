/**
 * 🌐 SERVICIO DE MANEJO OFFLINE/ONLINE PARA PWA
 * Diferencia eventos críticos (entrada/salida) de eventos permitidos offline (descansos/almuerzo)
 */

import { DispositivoService } from './dispositivoService';
import type { RegistroTiempo } from './jornadasService';
import Swal from 'sweetalert2';

// Tipos de eventos y su requerimiento de conectividad
const EVENTOS_ONLINE_REQUERIDO: Array<RegistroTiempo['tipo']> = ['entrada', 'salida'];

interface EventoOffline {
  id: string;
  tipo: RegistroTiempo['tipo'];
  timestamp: string;
  ubicacion: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  observaciones?: string;
  fechaCreacion: string;
}

class OfflineService {
  private readonly STORAGE_KEY = 'oxitrans_eventos_offline';
  private readonly SYNC_INTERVAL = 30000; // 30 segundos
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.inicializarSincronizacion();
    this.configurarListenersConectividad();
  }

  /**
   * Verificar si un tipo de evento requiere conexión online
   */
  requiereConexionOnline(tipoEvento: RegistroTiempo['tipo']): boolean {
    return EVENTOS_ONLINE_REQUERIDO.includes(tipoEvento);
  }

  /**
   * Verificar si está en modo PWA
   */
  private esPWA(): boolean {
    return DispositivoService.detectarContexto().esPWA;
  }

  /**
   * Verificar estado de conectividad
   */
  private estaOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Validar si se puede realizar un evento según conectividad
   */
  async validarDisponibilidad(tipoEvento: RegistroTiempo['tipo']): Promise<{
    permitido: boolean;
    razon?: string;
    modoOffline?: boolean;
  }> {
    const esPWA = this.esPWA();
    const estaOnline = this.estaOnline();
    const requiereOnline = this.requiereConexionOnline(tipoEvento);

    console.log('🔍 [OfflineService] Validando disponibilidad:', {
      tipoEvento,
      esPWA,
      estaOnline,
      requiereOnline
    });

    // Si no es PWA, todo funciona normal (siempre requiere online)
    if (!esPWA) {
      if (!estaOnline) {
        return {
          permitido: false,
          razon: 'Se requiere conexión a internet para registrar eventos.'
        };
      }
      return { permitido: true };
    }

    // Es PWA: aplicar lógica diferenciada
    if (requiereOnline && !estaOnline) {
      return {
        permitido: false,
        razon: `⚠️ Conexión requerida para ${tipoEvento === 'entrada' ? 'iniciar' : 'finalizar'} jornada laboral.\n\nEn modo PWA, solo los descansos y almuerzo pueden registrarse offline.`
      };
    }

    if (!requiereOnline && !estaOnline) {
      return {
        permitido: true,
        modoOffline: true
      };
    }

    return { permitido: true };
  }

  /**
   * Almacenar evento offline para sincronización posterior
   */
  async almacenarEventoOffline(evento: Omit<EventoOffline, 'id' | 'fechaCreacion'>): Promise<string> {
    const eventoCompleto: EventoOffline = {
      ...evento,
      id: this.generarId(),
      fechaCreacion: new Date().toISOString()
    };

    const eventosExistentes = this.obtenerEventosOffline();
    eventosExistentes.push(eventoCompleto);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(eventosExistentes));
    
    console.log('💾 [OfflineService] Evento almacenado offline:', eventoCompleto);
    
    // Mostrar notificación de almacenamiento offline
    await this.mostrarNotificacionOffline(evento.tipo);
    
    return eventoCompleto.id;
  }

  /**
   * Obtener eventos almacenados offline
   */
  private obtenerEventosOffline(): EventoOffline[] {
    try {
      const eventos = localStorage.getItem(this.STORAGE_KEY);
      return eventos ? JSON.parse(eventos) : [];
    } catch (error) {
      console.error('❌ [OfflineService] Error obteniendo eventos offline:', error);
      return [];
    }
  }

  /**
   * Sincronizar eventos offline cuando hay conexión
   */
  async sincronizarEventosOffline(): Promise<{ exitosos: number; fallidos: number }> {
    if (!this.estaOnline()) {
      return { exitosos: 0, fallidos: 0 };
    }

    const eventos = this.obtenerEventosOffline();
    if (eventos.length === 0) {
      return { exitosos: 0, fallidos: 0 };
    }

    console.log(`🔄 [OfflineService] Sincronizando ${eventos.length} eventos offline...`);

    let exitosos = 0;
    let fallidos = 0;
    const eventosSincronizados: string[] = [];

    for (const evento of eventos) {
      try {
        // Aquí haríamos la llamada real al API
        const { jornadasService } = await import('./jornadasService');
        
        await jornadasService.registrarTiempo({
          tipo: evento.tipo,
          timestamp: evento.timestamp,
          ubicacion: evento.ubicacion,
          observaciones: `${evento.observaciones || ''} [Sincronizado desde offline]`
        });

        eventosSincronizados.push(evento.id);
        exitosos++;
        console.log(`✅ [OfflineService] Evento sincronizado: ${evento.tipo} (${evento.id})`);
      } catch (error) {
        console.error(`❌ [OfflineService] Error sincronizando evento ${evento.id}:`, error);
        fallidos++;
      }
    }

    // Remover eventos sincronizados exitosamente
    if (eventosSincronizados.length > 0) {
      const eventosRestantes = eventos.filter(e => !eventosSincronizados.includes(e.id));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(eventosRestantes));
    }

    if (exitosos > 0) {
      await this.mostrarNotificacionSincronizacion(exitosos, fallidos);
    }

    return { exitosos, fallidos };
  }

  /**
   * Mostrar notificación de evento almacenado offline
   */
  private async mostrarNotificacionOffline(tipoEvento: RegistroTiempo['tipo']): Promise<void> {
    const etiquetas = {
      'descanso_manana_inicio': 'Inicio de descanso AM',
      'descanso_manana_fin': 'Fin de descanso AM',
      'almuerzo_inicio': 'Inicio de almuerzo',
      'almuerzo_fin': 'Fin de almuerzo',
      'descanso_tarde_inicio': 'Inicio de descanso PM',
      'descanso_tarde_fin': 'Fin de descanso PM'
    };

    await Swal.fire({
      title: '📱 Registrado Offline',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">💾</div>
          <p><strong>${etiquetas[tipoEvento as keyof typeof etiquetas] || tipoEvento}</strong> almacenado offline</p>
          <div style="background: #e6f7ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #0969da; font-size: 14px;">
              🔄 Se sincronizará automáticamente cuando tengas conexión
            </p>
          </div>
        </div>
      `,
      icon: 'info',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  /**
   * Mostrar notificación de sincronización completada
   */
  private async mostrarNotificacionSincronizacion(exitosos: number, fallidos: number): Promise<void> {
    const titulo = fallidos === 0 ? '✅ Sincronización Completada' : '⚠️ Sincronización Parcial';
    const mensaje = fallidos === 0 
      ? `${exitosos} eventos sincronizados correctamente`
      : `${exitosos} eventos sincronizados, ${fallidos} fallidos`;

    await Swal.fire({
      title: titulo,
      text: mensaje,
      icon: fallidos === 0 ? 'success' : 'warning',
      timer: 2500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  /**
   * Configurar listeners de conectividad
   */
  private configurarListenersConectividad(): void {
    window.addEventListener('online', () => {
      console.log('🌐 [OfflineService] Conexión restaurada');
      // Sincronizar inmediatamente al reconectar
      setTimeout(() => this.sincronizarEventosOffline(), 1000);
    });

    window.addEventListener('offline', () => {
      console.log('🚫 [OfflineService] Conexión perdida');
    });
  }

  /**
   * Inicializar sincronización automática
   */
  private inicializarSincronizacion(): void {
    // Sincronización periódica cada 30 segundos
    this.syncTimer = setInterval(() => {
      if (this.estaOnline()) {
        this.sincronizarEventosOffline();
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Generar ID único para eventos
   */
  private generarId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Limpiar recursos
   */
  destruir(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Obtener estadísticas de eventos offline
   */
  obtenerEstadisticas(): { pendientes: number; ultimaSincronizacion?: string } {
    const eventos = this.obtenerEventosOffline();
    return {
      pendientes: eventos.length,
      ultimaSincronizacion: eventos.length > 0 ? eventos[eventos.length - 1]?.fechaCreacion : undefined
    };
  }
}

// Instancia singleton
export const offlineService = new OfflineService();
export default offlineService;