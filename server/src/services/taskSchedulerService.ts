import cron from 'cron';
import { JornadaModel } from '../models/JornadaModel';
import { emailService } from './emailService';

export class TaskSchedulerService {
  private jobs: Map<string, cron.CronJob> = new Map();

  constructor() {
    this.inicializarTareas();
  }

  /**
   * Inicializar todas las tareas programadas
   */
  private inicializarTareas(): void {
    // Auto-cierre de jornadas cada hora
    this.programarAutoCierreJornadas();

    console.log('🕐 Tareas programadas inicializadas correctamente');
  }

  /**
   * Programar auto-cierre de jornadas (cada hora)
   */
  private programarAutoCierreJornadas(): void {
    const job = new cron.CronJob(
      '0 * * * *', // Cada hora en punto
      async () => {
        try {
          console.log('🔄 Ejecutando auto-cierre de jornadas...');
          
          const resultado = await JornadaModel.ejecutarAutoCierre();
          
          if (resultado.jornadasCerradas > 0) {
            console.log(`✅ Auto-cerradas ${resultado.jornadasCerradas} jornadas`);
            
            // Enviar emails de notificación
            for (const detalle of resultado.detalles) {
              try {
                await emailService.enviarJornadaAutoCerrada({
                  usuario: {
                    nombre: detalle.nombre,
                    email: detalle.email
                  }
                });
              } catch (emailError) {
                console.error(`❌ Error enviando email a ${detalle.email}:`, emailError);
              }
            }
          } else {
            console.log('✅ No hay jornadas para auto-cerrar');
          }
          
        } catch (error) {
          console.error('❌ Error en auto-cierre de jornadas:', error);
        }
      },
      null, // onComplete
      true, // start immediately
      'America/Bogota' // timezone
    );

    this.jobs.set('autoCierreJornadas', job);
    console.log('📅 Programado: Auto-cierre de jornadas cada hora');
  }

  /**
   * Detener una tarea específica
   */
  detenerTarea(nombreTarea: string): boolean {
    const job = this.jobs.get(nombreTarea);
    if (job) {
      job.stop();
      this.jobs.delete(nombreTarea);
      console.log(`🛑 Tarea '${nombreTarea}' detenida`);
      return true;
    }
    return false;
  }

  /**
   * Detener todas las tareas
   */
  detenerTodasLasTareas(): void {
    for (const [nombre, job] of this.jobs) {
      job.stop();
      console.log(`🛑 Tarea '${nombre}' detenida`);
    }
    this.jobs.clear();
    console.log('� Todas las tareas programadas han sido detenidas');
  }

  /**
   * Ejecutar auto-cierre manual
   */
  async ejecutarAutoCierreManual(): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
      console.log('� Ejecutando auto-cierre manual...');
      
      const resultado = await JornadaModel.ejecutarAutoCierre();
      
      if (resultado.jornadasCerradas > 0) {
        // Procesar emails
        const emailsEnviados: string[] = [];
        for (const detalle of resultado.detalles) {
          try {
            await emailService.enviarJornadaAutoCerrada({
              usuario: {
                nombre: detalle.nombre,
                email: detalle.email
              }
            });
            emailsEnviados.push(detalle.email);
          } catch (emailError) {
            console.error(`❌ Error enviando email a ${detalle.email}:`, emailError);
          }
        }

        return {
          success: true,
          message: `Se cerraron automáticamente ${resultado.jornadasCerradas} jornadas y se enviaron ${emailsEnviados.length} emails`,
          data: {
            jornadasCerradas: resultado.jornadasCerradas,
            emailsEnviados: emailsEnviados.length,
            detalles: resultado.detalles
          }
        };
      } else {
        return {
          success: true,
          message: 'No hay jornadas para auto-cerrar',
          data: { jornadasCerradas: 0 }
        };
      }
      
    } catch (error) {
      console.error('❌ Error en auto-cierre manual:', error);
      return {
        success: false,
        message: 'Error ejecutando auto-cierre manual'
      };
    }
  }

  /**
   * Obtener estado básico de las tareas
   */
  obtenerEstadoTareas(): Array<{ nombre: string; activa: boolean }> {
    const estado: Array<{ nombre: string; activa: boolean }> = [];
    
    for (const [nombre] of this.jobs) {
      estado.push({
        nombre,
        activa: true // Simplificado por ahora
      });
    }
    
    return estado;
  }
}

// Instancia singleton del programador de tareas
export const taskScheduler = new TaskSchedulerService();