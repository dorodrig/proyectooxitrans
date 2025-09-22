import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface JornadaAutoCerradaData {
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    documento: string;
    departamento: string;
  };
  jornada: {
    fecha: string;
    entrada: string;
    salida: string;
    horasTrabajadas: number;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      },
      from: {
        name: process.env.SMTP_FROM_NAME || 'OXITRANS Control de Acceso',
        email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
      }
    };

    this.transporter = nodemailer.createTransport(this.config.smtp);
  }

  /**
   * Verificar configuración de email
   */
  async verificarConfiguracion(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Configuración de email verificada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en configuración de email:', error);
      return false;
    }
  }

  /**
   * Enviar email de jornada auto-cerrada
   */
  async enviarJornadaAutoCerrada(data: JornadaAutoCerradaData): Promise<boolean> {
    try {
      const template = this.generarTemplateJornadaAutoCerrada(data);
      
      const mailOptions = {
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: data.usuario.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a ${data.usuario.email}:`, result.messageId);
      return true;

    } catch (error) {
      console.error(`❌ Error enviando email a ${data.usuario.email}:`, error);
      return false;
    }
  }

  /**
   * Enviar email de notificación general
   */
  async enviarNotificacion(
    destinatario: string,
    asunto: string,
    mensaje: string,
    esHTML: boolean = false
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: destinatario,
        subject: asunto,
        [esHTML ? 'html' : 'text']: mensaje
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notificación enviada a ${destinatario}:`, result.messageId);
      return true;

    } catch (error) {
      console.error(`❌ Error enviando notificación a ${destinatario}:`, error);
      return false;
    }
  }

  /**
   * Enviar email masivo de resumen diario a administradores
   */
  async enviarResumenDiario(
    administradores: string[],
    resumenData: {
      fecha: string;
      totalEmpleados: number;
      empleadosConEntrada: number;
      empleadosConSalida: number;
      jornadasAutoCerradas: number;
      promedioHoras: number;
    }
  ): Promise<boolean> {
    try {
      const template = this.generarTemplateResumenDiario(resumenData);
      
      const promises = administradores.map(email => {
        const mailOptions = {
          from: `"${this.config.from.name}" <${this.config.from.email}>`,
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text
        };

        return this.transporter.sendMail(mailOptions);
      });

      await Promise.all(promises);
      console.log(`✅ Resumen diario enviado a ${administradores.length} administradores`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando resumen diario:', error);
      return false;
    }
  }

  /**
   * Generar template HTML para jornada auto-cerrada
   */
  private generarTemplateJornadaAutoCerrada(data: JornadaAutoCerradaData): EmailTemplate {
    const fechaFormateada = new Date(data.jornada.fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const entradaFormateada = new Date(data.jornada.entrada).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const salidaFormateada = new Date(data.jornada.salida).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const horasFormateadas = data.jornada.horasTrabajadas.toFixed(2);

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jornada Auto-cerrada - OXITRANS</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .email-container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #FF6B35;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #FF6B35;
                margin-bottom: 10px;
            }
            .alert-icon {
                font-size: 48px;
                color: #FFA500;
                margin-bottom: 20px;
            }
            .title {
                color: #2C3E50;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
            }
            .info-card {
                background-color: #f8f9fa;
                border-left: 4px solid #FF6B35;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .label {
                font-weight: bold;
                color: #2C3E50;
            }
            .value {
                color: #666;
            }
            .warning-box {
                background-color: #FFF3CD;
                border: 1px solid #FFD43B;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
            }
            .button {
                display: inline-block;
                background-color: #FF6B35;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">OXITRANS S.A.S</div>
                <div style="color: #666; font-size: 14px;">Sistema de Control de Acceso</div>
            </div>

            <div class="alert-icon">⚠️</div>
            
            <h1 class="title">Jornada Laboral Auto-cerrada</h1>
            
            <p>Estimado/a <strong>${data.usuario.nombre} ${data.usuario.apellido}</strong>,</p>
            
            <p>Le informamos que su jornada laboral del día <strong>${fechaFormateada}</strong> fue cerrada automáticamente por el sistema después de <strong>8 horas</strong> de trabajo continuo.</p>

            <div class="info-card">
                <h3 style="margin-top: 0; color: #2C3E50;">📋 Detalles de la Jornada</h3>
                
                <div class="info-row">
                    <span class="label">👤 Empleado:</span>
                    <span class="value">${data.usuario.nombre} ${data.usuario.apellido}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">🆔 Documento:</span>
                    <span class="value">${data.usuario.documento}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">🏢 Departamento:</span>
                    <span class="value">${data.usuario.departamento}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">📅 Fecha:</span>
                    <span class="value">${fechaFormateada}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">🕐 Hora de Entrada:</span>
                    <span class="value">${entradaFormateada}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">🕕 Hora de Salida (Auto):</span>
                    <span class="value">${salidaFormateada}</span>
                </div>
                
                <div class="info-row">
                    <span class="label">⏱️ Horas Trabajadas:</span>
                    <span class="value">${horasFormateadas} horas</span>
                </div>
            </div>

            <div class="warning-box">
                <strong>⚠️ Importante:</strong> Para futuras ocasiones, recuerde registrar su salida manualmente antes de completar 8 horas de trabajo para evitar el cierre automático.
            </div>

            <p>Si tiene alguna consulta sobre este registro automático, por favor contacte al área de Recursos Humanos o al administrador del sistema.</p>

            <div class="footer">
                <p><strong>OXITRANS S.A.S</strong><br>
                Sistema de Control de Acceso<br>
                Este es un mensaje automático, por favor no responder.</p>
                <p style="margin-top: 10px; font-size: 10px; color: #999;">
                    Enviado el ${new Date().toLocaleString('es-CO')}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    OXITRANS S.A.S - Sistema de Control de Acceso
    
    JORNADA LABORAL AUTO-CERRADA
    
    Estimado/a ${data.usuario.nombre} ${data.usuario.apellido},
    
    Su jornada laboral del ${fechaFormateada} fue cerrada automáticamente por el sistema después de 8 horas de trabajo.
    
    DETALLES:
    - Empleado: ${data.usuario.nombre} ${data.usuario.apellido}
    - Documento: ${data.usuario.documento}
    - Departamento: ${data.usuario.departamento}
    - Fecha: ${fechaFormateada}
    - Hora de Entrada: ${entradaFormateada}
    - Hora de Salida (Auto): ${salidaFormateada}
    - Horas Trabajadas: ${horasFormateadas} horas
    
    IMPORTANTE: Para futuras ocasiones, recuerde registrar su salida manualmente antes de completar 8 horas de trabajo.
    
    Si tiene consultas, contacte al área de Recursos Humanos.
    
    OXITRANS S.A.S
    Este es un mensaje automático.
    `;

    return {
      subject: `🔔 Jornada Auto-cerrada - ${data.usuario.nombre} ${data.usuario.apellido} - ${fechaFormateada}`,
      html,
      text
    };
  }

  /**
   * Generar template para resumen diario
   */
  private generarTemplateResumenDiario(data: {
    fecha: string;
    totalEmpleados: number;
    empleadosConEntrada: number;
    empleadosConSalida: number;
    jornadasAutoCerradas: number;
    promedioHoras: number;
  }): EmailTemplate {
    const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const porcentajeEntrada = ((data.empleadosConEntrada / data.totalEmpleados) * 100).toFixed(1);
    const porcentajeSalida = ((data.empleadosConSalida / data.totalEmpleados) * 100).toFixed(1);

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resumen Diario - OXITRANS</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .email-container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #FF6B35;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .stat-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 20px 0;
            }
            .stat-card {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                border-left: 4px solid #FF6B35;
            }
            .stat-number {
                font-size: 28px;
                font-weight: bold;
                color: #FF6B35;
            }
            .stat-label {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div style="font-size: 28px; font-weight: bold; color: #FF6B35; margin-bottom: 10px;">OXITRANS S.A.S</div>
                <div style="color: #666; font-size: 14px;">Resumen Diario de Jornadas Laborales</div>
            </div>

            <h1 style="color: #2C3E50; text-align: center;">📊 Resumen del ${fechaFormateada}</h1>

            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-number">${data.totalEmpleados}</div>
                    <div class="stat-label">Total Empleados</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-number">${data.empleadosConEntrada}</div>
                    <div class="stat-label">Con Entrada (${porcentajeEntrada}%)</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-number">${data.empleadosConSalida}</div>
                    <div class="stat-label">Con Salida (${porcentajeSalida}%)</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-number">${data.jornadasAutoCerradas}</div>
                    <div class="stat-label">Auto-cerradas</div>
                </div>
            </div>

            <div style="background-color: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #2C3E50;">⏱️ Promedio de Horas Trabajadas</h3>
                <div style="font-size: 24px; color: #FF6B35; font-weight: bold;">${data.promedioHoras.toFixed(2)} horas</div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p><strong>OXITRANS S.A.S</strong><br>
                Sistema de Control de Acceso<br>
                Resumen generado automáticamente el ${new Date().toLocaleString('es-CO')}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    OXITRANS S.A.S - Resumen Diario de Jornadas Laborales
    
    RESUMEN DEL ${fechaFormateada}
    
    📊 ESTADÍSTICAS:
    - Total Empleados: ${data.totalEmpleados}
    - Con Entrada: ${data.empleadosConEntrada} (${porcentajeEntrada}%)
    - Con Salida: ${data.empleadosConSalida} (${porcentajeSalida}%)
    - Jornadas Auto-cerradas: ${data.jornadasAutoCerradas}
    - Promedio Horas Trabajadas: ${data.promedioHoras.toFixed(2)} horas
    
    Resumen generado automáticamente el ${new Date().toLocaleString('es-CO')}
    `;

    return {
      subject: `📊 Resumen Diario OXITRANS - ${fechaFormateada}`,
      html,
      text
    };
  }
}

// Instancia singleton del servicio de email
export const emailService = new EmailService();