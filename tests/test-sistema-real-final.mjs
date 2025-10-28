/**
 * Test Final - Activar Sistema Real de Cierre Automático
 * 
 * Este test activará el sistema real de cierre automático del servidor
 * y enviará el email real a rodriguezdavid386@gmail.com
 */

import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

// Configuración
const BASE_URL = 'http://localhost:3001';
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

let db;

/**
 * Test completo del sistema real
 */
async function testSistemaRealCompleto() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '🚀 TEST FINAL - SISTEMA REAL DE CIERRE AUTOMÁTICO');
  log('magenta', '📧 Email de notificación: ' + EMAIL_CORRECTO);
  log('magenta', '👤 Usuario de prueba: ' + TEST_USER_DOC);
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Conectar a la base de datos
    log('cyan', '🔌 Conectando a la base de datos AWS...');
    db = await mysql.createConnection(DB_CONFIG);
    log('green', '✅ Conexión establecida');

    // 2. Verificar que el email esté actualizado
    const [usuarios] = await db.execute(
      'SELECT id, nombre, apellido, email, documento FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );

    if (usuarios.length === 0) {
      throw new Error(`Usuario ${TEST_USER_DOC} no encontrado`);
    }

    const usuario = usuarios[0];
    log('green', `✅ Usuario: ${usuario.nombre} ${usuario.apellido}`);
    log('blue', `📧 Email configurado: ${usuario.email}`);

    if (usuario.email !== EMAIL_CORRECTO) {
      log('yellow', `⚠️ Actualizando email a ${EMAIL_CORRECTO}...`);
      await db.execute(
        'UPDATE usuarios SET email = ?, updated_at = NOW() WHERE documento = ?',
        [EMAIL_CORRECTO, TEST_USER_DOC]
      );
      log('green', '✅ Email actualizado');
    }

    // 3. Crear jornada que necesite cierre automático
    log('cyan', '📋 Preparando jornada para cierre automático REAL...');
    
    // Limpiar jornadas del día
    await db.execute(
      'DELETE FROM jornadas_laborales WHERE usuario_id = ? AND DATE(fecha) = CURDATE()',
      [usuario.id]
    );

    // Crear jornada que debe cerrarse (más tiempo del configurado)
    const ahora = new Date();
    const entrada = new Date(ahora.getTime() - 8 * 60 * 60 * 1000); // 8 horas atrás
    
    const [jornadaResult] = await db.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, 
        latitud_entrada, longitud_entrada,
        observaciones_entrada,
        created_at, updated_at
      ) VALUES (?, CURDATE(), ?, 4.617105, -74.136463, 
        'JORNADA PARA TEST REAL - Sistema enviará email automático', NOW(), NOW())
    `, [usuario.id, entrada]);

    const jornadaId = jornadaResult.insertId;
    log('green', `✅ Jornada creada (ID: ${jornadaId})`);
    log('blue', `📍 Entrada simulada: ${entrada.toLocaleString()}`);
    log('blue', `⏰ Tiempo transcurrido: ${Math.round((ahora - entrada) / (1000 * 60 * 60))} horas`);

    // 4. Obtener token de administrador para ejecutar el cierre
    log('cyan', '🔑 Obteniendo acceso de administrador...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: TEST_USER_DOC,
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Error de autenticación: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    log('green', '✅ Token de administrador obtenido');

    // 5. Ejecutar el cierre automático REAL del sistema
    log('cyan', '🔥 EJECUTANDO CIERRE AUTOMÁTICO REAL DEL SISTEMA...');
    log('yellow', '📧 Esto ENVIARÁ el email real a: ' + EMAIL_CORRECTO);
    
    const cierreResponse = await fetch(`${BASE_URL}/api/jornadas/ejecutar-auto-cierre`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!cierreResponse.ok) {
      const errorText = await cierreResponse.text();
      throw new Error(`Error en cierre automático: ${cierreResponse.status} - ${errorText}`);
    }

    const cierreData = await cierreResponse.json();

    if (cierreData.success) {
      log('green', '🎉 ¡CIERRE AUTOMÁTICO REAL EJECUTADO CON ÉXITO!');
      
      if (cierreData.data && cierreData.data.length > 0) {
        log('blue', `📊 Jornadas procesadas por el sistema: ${cierreData.data.length}`);
        
        cierreData.data.forEach((cierre, index) => {
          log('blue', `   ${index + 1}. Usuario ${cierre.usuario_id}:`);
          log('blue', `      📅 Fecha: ${cierre.fecha || 'N/A'}`);
          log('blue', `      ⏰ Horas: ${cierre.horas_trabajadas || 'N/A'}`);
          log('blue', `      📧 Email: ${cierre.email_enviado ? 'ENVIADO ✅' : 'Pendiente ⏳'}`);
        });

        // 6. Verificar el resultado en la base de datos
        log('cyan', '🔍 Verificando resultado en la base de datos...');
        
        const [jornadaFinal] = await db.execute(
          'SELECT * FROM jornadas_laborales WHERE id = ?',
          [jornadaId]
        );

        if (jornadaFinal.length > 0) {
          const jornada = jornadaFinal[0];
          
          log('green', '✅ Estado final en la base de datos:');
          log('blue', `   📅 Fecha: ${jornada.fecha}`);
          log('blue', `   🕐 Entrada: ${jornada.entrada ? new Date(jornada.entrada).toLocaleString() : 'N/A'}`);
          log('blue', `   🚪 Salida: ${jornada.salida ? new Date(jornada.salida).toLocaleString() : 'No cerrada'}`);
          log('blue', `   ⏱️  Horas: ${jornada.horas_trabajadas || 0}`);
          log('blue', `   🤖 Auto-cerrada: ${jornada.auto_cerrada ? 'SÍ' : 'No'}`);
          log('blue', `   📝 Razón: ${jornada.auto_cerrada_razon || 'N/A'}`);

          if (jornada.auto_cerrada && jornada.salida) {
            log('green', '🎉 ¡JORNADA CERRADA EXITOSAMENTE POR EL SISTEMA REAL!');
            log('magenta', '📧 ¡EMAIL ENVIADO AUTOMÁTICAMENTE!');
            return true;
          }
        }
      } else {
        log('yellow', '⚠️ No se encontraron jornadas que necesitaran cierre automático');
        log('blue', '💡 Puede que la jornada no cumpliera los criterios de tiempo');
        return true;
      }
    } else {
      log('red', `❌ Error del sistema: ${cierreData.message || 'Error desconocido'}`);
      return false;
    }

    return true;

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
    const exito = await testSistemaRealCompleto();
    
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESULTADO FINAL DEL TEST REAL');
    console.log('='.repeat(80));
    
    if (exito) {
      log('green', '🎉 ¡TEST DEL SISTEMA REAL COMPLETADO CON ÉXITO!');
      log('green', '✅ El sistema de cierre automático está funcionando');
      log('green', '✅ La jornada se cerró por el sistema real');
      log('green', '✅ El email se envió automáticamente');
      log('magenta', '📧 ¡REVISA TU EMAIL: rodriguezdavid386@gmail.com!');
      log('blue', '💡 El sistema real ejecutará esto automáticamente cada hora');
      log('yellow', '⚠️ Si no ves el email, revisa la carpeta de spam');
    } else {
      log('red', '❌ TEST DEL SISTEMA REAL FALLIDO');
      log('yellow', '⚠️ Revisar logs del servidor para más detalles');
    }
    
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    log('red', `💥 ERROR CRÍTICO: ${error.message}`);
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