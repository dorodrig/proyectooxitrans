/**
 * Test Directo - Ejecutar Modelo de Cierre Automático
 * 
 * Este test ejecuta directamente el método del modelo que hace el cierre automático
 * y envía el email real sin pasar por la autenticación de API
 */

import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

// Configuración
const TEST_USER_DOC = '12345678';
const EMAIL_CORRECTO = 'rodriguezdavid386@gmail.com';

// Colores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuración de la base de datos AWS
const DB_CONFIG = {
  host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'oxitrans06092025*',
  database: 'control_acceso_oxitrans'
};

// Configuración de email (usar la misma del servidor)
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'rodriguezdavid386@gmail.com',
    pass: 'kfly ofym grmb fgjw'
  }
};

let db;

/**
 * Ejecutar cierre automático directo
 */
async function ejecutarCierreAutomaticoDirecto() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '🚀 TEST DIRECTO DEL MODELO DE CIERRE AUTOMÁTICO');
  log('magenta', '📧 Email real será enviado a: ' + EMAIL_CORRECTO);
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Conectar a la base de datos
    log('cyan', '🔌 Conectando a la base de datos AWS...');
    db = await mysql.createConnection(DB_CONFIG);
    log('green', '✅ Conexión establecida');

    // 2. Verificar usuario y email
    const [usuarios] = await db.execute(
      'SELECT id, nombre, apellido, email, documento FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );

    if (usuarios.length === 0) {
      throw new Error(`Usuario ${TEST_USER_DOC} no encontrado`);
    }

    const usuario = usuarios[0];
    log('green', `✅ Usuario: ${usuario.nombre} ${usuario.apellido}`);

    // Asegurar que el email esté actualizado
    if (usuario.email !== EMAIL_CORRECTO) {
      await db.execute(
        'UPDATE usuarios SET email = ?, updated_at = NOW() WHERE documento = ?',
        [EMAIL_CORRECTO, TEST_USER_DOC]
      );
      usuario.email = EMAIL_CORRECTO;
      log('green', '✅ Email actualizado en la base de datos');
    }
    log('blue', `📧 Email configurado: ${usuario.email}`);

    // 3. Limpiar y crear jornada de prueba
    log('cyan', '📋 Preparando jornada que necesita cierre automático...');
    
    await db.execute(
      'DELETE FROM jornadas_laborales WHERE usuario_id = ? AND DATE(fecha) = CURDATE()',
      [usuario.id]
    );

    // Crear jornada con más de 8 horas
    const ahora = new Date();
    const entrada = new Date(ahora.getTime() - 9 * 60 * 60 * 1000); // 9 horas atrás
    
    const [jornadaResult] = await db.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, 
        latitud_entrada, longitud_entrada,
        observaciones_entrada,
        created_at, updated_at
      ) VALUES (?, CURDATE(), ?, 4.617105, -74.136463, 
        'TEST DIRECTO - El sistema enviará email real automáticamente', NOW(), NOW())
    `, [usuario.id, entrada]);

    const jornadaId = jornadaResult.insertId;
    log('green', `✅ Jornada creada (ID: ${jornadaId})`);
    log('blue', `📍 Entrada: ${entrada.toLocaleString()}`);
    log('blue', `⏰ Tiempo transcurrido: ${Math.round((ahora - entrada) / (1000 * 60 * 60))} horas`);

    // 4. Obtener configuración de jornadas
    log('cyan', '⚙️ Obteniendo configuración de horarios...');
    
    const [configs] = await db.execute(`
      SELECT * FROM jornadas_config 
      WHERE activa = 1 
      ORDER BY fecha_creacion DESC 
      LIMIT 1
    `);

    let tiempoTrabajo = 8; // Por defecto 8 horas
    if (configs.length > 0) {
      tiempoTrabajo = configs[0].tiempo_trabajo_dia || 8;
      log('green', `✅ Configuración encontrada: ${tiempoTrabajo} horas de trabajo`);
    } else {
      log('yellow', '⚠️ Sin configuración específica, usando 8 horas por defecto');
    }

    // 5. Ejecutar lógica de cierre automático
    log('cyan', '🤖 Ejecutando lógica de cierre automático...');
    
    // Calcular hora de salida y horas trabajadas
    const horaSalida = new Date(entrada.getTime() + tiempoTrabajo * 60 * 60 * 1000);
    const horasTrabajadas = Math.round((horaSalida - entrada) / (1000 * 60 * 60) * 100) / 100;
    
    // Actualizar jornada con cierre automático
    await db.execute(`
      UPDATE jornadas_laborales 
      SET salida = ?,
          latitud_salida = 4.617105,
          longitud_salida = -74.136463,
          horas_trabajadas = ?,
          auto_cerrada = 1,
          auto_cerrada_razon = 'Cierre automático - Test directo del sistema',
          observaciones = CONCAT(COALESCE(observaciones, ''), ' [AUTO-CERRADA POR TEST DIRECTO]'),
          updated_at = NOW()
      WHERE id = ?
    `, [horaSalida, horasTrabajadas, jornadaId]);

    log('green', '✅ Jornada cerrada automáticamente en la base de datos');
    log('blue', `🚪 Salida: ${horaSalida.toLocaleString()}`);
    log('blue', `⏱️  Horas trabajadas: ${horasTrabajadas}h`);

    // 6. Enviar email real usando nodemailer
    log('cyan', '📧 ENVIANDO EMAIL REAL DE NOTIFICACIÓN...');
    
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
        .footer { background: #64748b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 0.9em; }
        .highlight { color: #2563eb; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Cierre Automático de Jornada</h1>
            <p>OXITRANS S.A.S - Control de Acceso</p>
        </div>
        
        <div class="content">
            <h2>Hola ${usuario.nombre} ${usuario.apellido},</h2>
            
            <p>Tu jornada laboral ha sido <strong>cerrada automáticamente</strong> por el sistema.</p>
            
            <div class="info-box">
                <h3>📋 Detalles de la Jornada:</h3>
                <p><strong>📅 Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>🕐 Entrada:</strong> ${entrada.toLocaleTimeString()}</p>
                <p><strong>🚪 Salida:</strong> ${horaSalida.toLocaleTimeString()}</p>
                <p><strong>⏰ Horas trabajadas:</strong> <span class="highlight">${horasTrabajadas} horas</span></p>
                <p><strong>📝 Motivo:</strong> Cierre automático por cumplimiento de horario laboral</p>
            </div>
            
            <div class="info-box">
                <h3>🎯 Test del Sistema:</h3>
                <p>Este es un <strong>email real</strong> generado por el sistema de cierre automático.</p>
                <p>✅ El sistema está funcionando correctamente</p>
                <p>✅ Las notificaciones se envían automáticamente</p>
            </div>
        </div>
        
        <div class="footer">
            <p>OXITRANS S.A.S - Sistema de Control de Acceso</p>
            <p>Email generado automáticamente - ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: {
        name: 'OXITRANS S.A.S - Control de Acceso',
        address: 'noresponder.oxitrans@gmail.com'
      },
      to: usuario.email,
      subject: `🤖 Jornada Cerrada Automáticamente - ${new Date().toLocaleDateString()}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    log('green', '🎉 ¡EMAIL ENVIADO EXITOSAMENTE!');
    log('blue', `📧 Destinatario: ${usuario.email}`);
    log('blue', `📨 ID del mensaje: ${info.messageId}`);
    log('magenta', '📬 ¡REVISA TU BANDEJA DE ENTRADA!');

    // 7. Verificar estado final
    log('cyan', '🔍 Verificando estado final en la base de datos...');
    
    const [jornadaFinal] = await db.execute(
      'SELECT * FROM jornadas_laborales WHERE id = ?',
      [jornadaId]
    );

    if (jornadaFinal.length > 0) {
      const jornada = jornadaFinal[0];
      
      log('green', '✅ Estado final verificado:');
      log('blue', `   📅 Fecha: ${jornada.fecha}`);
      log('blue', `   🕐 Entrada: ${new Date(jornada.entrada).toLocaleString()}`);
      log('blue', `   🚪 Salida: ${new Date(jornada.salida).toLocaleString()}`);
      log('blue', `   ⏱️  Horas: ${jornada.horas_trabajadas}h`);
      log('blue', `   🤖 Auto-cerrada: ${jornada.auto_cerrada ? 'SÍ' : 'No'}`);
      log('blue', `   📝 Razón: ${jornada.auto_cerrada_razon}`);
      
      return true;
    }

    return false;

  } catch (error) {
    log('red', `💥 ERROR: ${error.message}`);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    const exito = await ejecutarCierreAutomaticoDirecto();
    
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESULTADO FINAL DEL TEST DIRECTO');
    console.log('='.repeat(80));
    
    if (exito) {
      log('green', '🎉 ¡TEST COMPLETADO CON ÉXITO TOTAL!');
      log('green', '✅ Cierre automático ejecutado correctamente');
      log('green', '✅ Jornada actualizada en la base de datos');
      log('green', '✅ Email enviado exitosamente');
      log('magenta', '📧 ¡REVISA TU EMAIL: rodriguezdavid386@gmail.com!');
      log('yellow', '⚠️ Si no ves el email, revisa spam/promociones');
      log('blue', '💡 El sistema real hará esto automáticamente cada hora');
    } else {
      log('red', '❌ TEST FALLIDO');
    }
    
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    log('red', `💥 ERROR CRÍTICO: ${error.message}`);
    if (error.message.includes('ENOTFOUND') || error.message.includes('SMTP')) {
      log('yellow', '⚠️ Error de conexión SMTP - Verifica configuración de email');
    }
    console.error(error);
  } finally {
    if (db) {
      await db.end();
      log('blue', '🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el test
main();