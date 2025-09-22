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
   * Placeholder para funciones más complejas
   */
  async enviarJornadaAutoCerrada(data: { usuario?: { nombre?: string; email?: string } }): Promise<boolean> {
    const html = `
      <h1>Jornada Auto-cerrada</h1>
      <p>La jornada de ${data.usuario?.nombre} fue cerrada automáticamente.</p>
    `;
    
    return this.enviarEmail(
      data.usuario?.email || 'admin@oxitrans.com',
      'Jornada Auto-cerrada',
      html
    );
  }
}

// Instancia singleton del servicio de email
export const emailService = new EmailService();
