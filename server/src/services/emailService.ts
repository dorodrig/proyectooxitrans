import nodemailer from 'nodemailer';

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

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
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
  }

  /**
   * Inicializar el transporter de nodemailer
   */
  private async inicializarTransporter(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport(this.config.smtp);
      
      // Verificar la configuración
      if (this.config.smtp.auth.user && this.config.smtp.auth.pass && this.transporter) {
        await this.transporter.verify();
        console.log('✅ Servicio de email configurado correctamente');
      } else {
        console.log('⚠️ Credenciales de email no configuradas');
      }
    } catch (error) {
      console.error('❌ Error configurando servicio de email:', error);
      this.transporter = null;
    }
  }

  /**
   * Enviar email básico
   */
  async enviarEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.inicializarTransporter();
      }

      if (!this.transporter) {
        console.log('📧 Simulando envío de email (transporter no disponible)');
        console.log(`Para: ${to}`);
        console.log(`Asunto: ${subject}`);
        return true;
      }

      const result = await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to,
        subject,
        html
      });

      console.log('✅ Email enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  /**
   * Verificar configuración del servicio de email
   */
  async verificarConfiguracion(): Promise<boolean> {
    try {
      if (!this.config.smtp.auth.user || !this.config.smtp.auth.pass) {
        return false;
      }

      if (!this.transporter) {
        await this.inicializarTransporter();
      }

      return this.transporter !== null;
    } catch (error) {
      console.error('Error verificando configuración de email:', error);
      return false;
    }
  }

  /**
   * Enviar notificación de jornada auto-cerrada con información del horario empresarial
   */
  async enviarJornadaAutoCerrada(data: { 
    usuario?: { nombre?: string; email?: string };
    horarioConfiguracion?: string;
    salida?: string;
  }): Promise<boolean> {
    const fechaActual = new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const horaActual = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jornada Auto-cerrada - OXITRANS</title>
        <style>
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #FF6B35 0%, #e55a2b 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
          }
          .alert-icon {
            font-size: 64px;
            text-align: center;
            margin: 20px 0;
          }
          .info-card {
            background: #f8f9fa;
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
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">OXITRANS S.A.S</div>
            <div>Sistema de Control de Acceso</div>
          </div>

          <div class="content">
            <div class="alert-icon">🕰️</div>
            
            <h2 style="color: #2C3E50; text-align: center; margin-bottom: 20px;">
              Jornada Laboral Auto-cerrada
            </h2>
            
            <p>Estimado/a <strong>${data.usuario?.nombre || 'Empleado'}</strong>,</p>
            
            <p>Le informamos que su jornada laboral del día <strong>${fechaActual}</strong> fue cerrada automáticamente por el sistema de acuerdo al horario empresarial configurado.</p>

            <div class="info-card">
              <h3 style="margin-top: 0; color: #2C3E50;">📋 Detalles del Cierre Automático</h3>
              
              <div class="info-row">
                <span class="label">👤 Empleado:</span>
                <span class="value">${data.usuario?.nombre || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">📅 Fecha:</span>
                <span class="value">${fechaActual}</span>
              </div>
              
              <div class="info-row">
                <span class="label">🕐 Hora de cierre:</span>
                <span class="value">${data.salida || horaActual}</span>
              </div>
              
              ${data.horarioConfiguracion ? `
              <div class="info-row">
                <span class="label">🏢 Horario empresarial:</span>
                <span class="value">${data.horarioConfiguracion}</span>
              </div>
              ` : ''}
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Importante:</strong> El cierre automático se realizó según la configuración de horario laboral establecida por la administración. Para futuras ocasiones, recuerde registrar su salida manualmente antes del horario límite.
              </p>
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
        </div>
      </body>
      </html>
    `;
    
    return this.enviarEmail(
      data.usuario?.email || 'admin@oxitrans.com',
      `🔔 Jornada Auto-cerrada - ${data.usuario?.nombre || 'Empleado'} - ${fechaActual}`,
      html
    );
  }
}

// Instancia singleton del servicio de email
export const emailService = new EmailService();
