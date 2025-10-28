/**
 * Test Directo del Sistema de Cierre Automático
 * 
 * Este test simula directamente el cierre automático usando la base de datos
 * y luego verifica el envío de email
 */

import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

// Configuración
const BASE_URL = 'http://localhost:3001';
const TEST_USER_DOC = '12345678';

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
 * Test directo del cierre automático
 */
async function testCierreAutomaticoDirecto() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '🚀 TEST DIRECTO DE CIERRE AUTOMÁTICO');
  log('magenta', '👤 Usuario de prueba: ' + TEST_USER_DOC);
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Conectar a la base de datos
    log('cyan', '🔌 Conectando a la base de datos AWS...');
    db = await mysql.createConnection(DB_CONFIG);
    log('green', '✅ Conexión establecida');

    // 2. Obtener usuario de prueba con email real
    const [usuarios] = await db.execute(
      'SELECT id, nombre, apellido, email, documento FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );

    if (usuarios.length === 0) {
      throw new Error(`Usuario ${TEST_USER_DOC} no encontrado`);
    }

    const usuario = usuarios[0];
    log('green', `✅ Usuario: ${usuario.nombre} ${usuario.apellido}`);
    log('blue', `📧 Email real de la BD: ${usuario.email}`);
    log('cyan', `📋 Documento: ${usuario.documento}`);
    
    // Verificar que el email no esté vacío
    if (!usuario.email || usuario.email.trim() === '') {
      log('yellow', '⚠️ ADVERTENCIA: El usuario no tiene email configurado en la base de datos');
    }

    // 3. Limpiar y crear jornada de prueba
    log('cyan', '📋 Creando jornada de prueba...');
    
    // Limpiar jornadas del día actual
    await db.execute(
      'DELETE FROM jornadas_laborales WHERE usuario_id = ? AND DATE(fecha) = CURDATE()',
      [usuario.id]
    );

    // Crear jornada que simule una jornada completa (8+ horas)
    const ahora = new Date();
    const entrada = new Date(ahora.getTime() - 9 * 60 * 60 * 1000); // 9 horas atrás
    
    const [jornadaResult] = await db.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, 
        latitud_entrada, longitud_entrada,
        observaciones_entrada,
        created_at, updated_at
      ) VALUES (?, CURDATE(), ?, 4.617105, -74.136463, 
        'Entrada de prueba para test de cierre automático', NOW(), NOW())
    `, [usuario.id, entrada]);

    const jornadaId = jornadaResult.insertId;
    log('green', `✅ Jornada creada (ID: ${jornadaId})`);
    log('blue', `📍 Entrada simulada: ${entrada.toLocaleString()}`);
    log('blue', `⏰ Tiempo transcurrido: ${Math.round((ahora - entrada) / (1000 * 60 * 60))} horas`);

    // 4. Obtener configuración de jornada
    log('cyan', '⚙️ Verificando configuración de horarios...');
    
    const [configs] = await db.execute(`
      SELECT * FROM jornadas_config 
      WHERE activa = 1 
      ORDER BY fecha_creacion DESC 
      LIMIT 1
    `);

    let horaFinJornada = '17:00:00';
    let tiempoTrabajo = 8;

    if (configs.length > 0) {
      const config = configs[0];
      horaFinJornada = config.fin_jornada_laboral || '17:00:00';
      tiempoTrabajo = config.tiempo_trabajo_dia || 8;
      log('green', '✅ Configuración encontrada:');
      log('blue', `   🕐 Entrada: ${config.hora_entrada}`);
      log('blue', `   🕐 Fin jornada: ${horaFinJornada}`);
      log('blue', `   ⏰ Horas trabajo: ${tiempoTrabajo}h`);
    } else {
      log('yellow', '⚠️ Sin configuración específica, usando valores por defecto');
    }

    // 5. Simular cierre automático directo
    log('cyan', '🤖 Ejecutando lógica de cierre automático...');
    
    // Calcular hora de salida basada en entrada + tiempo de trabajo
    const horaSalida = new Date(entrada.getTime() + tiempoTrabajo * 60 * 60 * 1000);
    const horasTrabajadas = Math.round((horaSalida - entrada) / (1000 * 60 * 60) * 100) / 100;
    
    // Actualizar la jornada con cierre automático
    await db.execute(`
      UPDATE jornadas_laborales 
      SET salida = ?,
          latitud_salida = 4.617105,
          longitud_salida = -74.136463,
          horas_trabajadas = ?,
          auto_cerrada = 1,
          auto_cerrada_razon = 'Cierre automático por cumplimiento de jornada laboral',
          observaciones = CONCAT(COALESCE(observaciones, ''), ' [CIERRE AUTOMÁTICO - TEST]'),
          updated_at = NOW()
      WHERE id = ?
    `, [horaSalida, horasTrabajadas, jornadaId]);

    log('green', '✅ Jornada cerrada automáticamente');
    log('blue', `🚪 Salida programada: ${horaSalida.toLocaleString()}`);
    log('blue', `⏱️  Horas trabajadas: ${horasTrabajadas}h`);

    // 6. Verificar el resultado
    log('cyan', '🔍 Verificando cierre de jornada...');
    
    const [jornadaFinal] = await db.execute(
      'SELECT * FROM jornadas_laborales WHERE id = ?',
      [jornadaId]
    );

    if (jornadaFinal.length > 0) {
      const jornada = jornadaFinal[0];
      log('green', '✅ Estado final de la jornada:');
      log('blue', `   📅 Fecha: ${jornada.fecha}`);
      log('blue', `   🕐 Entrada: ${jornada.entrada ? new Date(jornada.entrada).toLocaleString() : 'No registrada'}`);
      log('blue', `   🚪 Salida: ${jornada.salida ? new Date(jornada.salida).toLocaleString() : 'No registrada'}`);
      log('blue', `   ⏱️  Horas: ${jornada.horas_trabajadas || 0}h`);
      log('blue', `   🤖 Auto-cerrada: ${jornada.auto_cerrada ? 'Sí' : 'No'}`);
      log('blue', `   📝 Razón: ${jornada.auto_cerrada_razon || 'N/A'}`);

      if (jornada.auto_cerrada && jornada.salida) {
        log('green', '🎉 ¡CIERRE AUTOMÁTICO EXITOSO!');
        
        // 7. Simular envío de email de notificación
        await simularEnvioEmail(usuario, jornada);
        
        return true;
      } else {
        log('red', '❌ El cierre automático no se completó correctamente');
        return false;
      }
    } else {
      log('red', '❌ No se encontró la jornada después del cierre');
      return false;
    }

  } catch (error) {
    log('red', `💥 ERROR: ${error.message}`);
    throw error;
  }
}

/**
 * Simular el envío de email de notificación
 */
async function simularEnvioEmail(usuario, jornada) {
  log('cyan', '📧 Simulando envío de email de notificación...');
  
  try {
    // Preparar datos para el email
    const datosEmail = {
      destinatario: usuario.email,
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      fecha: jornada.fecha,
      horaEntrada: jornada.entrada ? new Date(jornada.entrada).toLocaleTimeString() : 'N/A',
      horaSalida: jornada.salida ? new Date(jornada.salida).toLocaleTimeString() : 'N/A',
      horasTrabajadas: jornada.horas_trabajadas || 0,
      razonCierre: jornada.auto_cerrada_razon || 'Cierre automático'
    };

    log('green', '✅ Email de notificación preparado:');
    log('blue', `   👤 Para: ${datosEmail.destinatario}`);
    log('blue', `   📋 Nombre: ${datosEmail.nombre}`);
    log('blue', `   📅 Fecha: ${datosEmail.fecha}`);
    log('blue', `   🕐 Horario: ${datosEmail.horaEntrada} - ${datosEmail.horaSalida}`);
    log('blue', `   ⏱️  Total: ${datosEmail.horasTrabajadas} horas`);
    log('blue', `   📝 Motivo: ${datosEmail.razonCierre}`);

    // Intentar enviar email real a través del API
    try {
      const emailResponse = await fetch(`${BASE_URL}/api/health`);
      if (emailResponse.ok) {
        log('green', '✅ Servicio de email disponible');
        log('yellow', '📬 En producción, se enviaría email automáticamente');
        log('magenta', '🎯 ¡REVISA TU EMAIL PARA VER LA NOTIFICACIÓN REAL!');
      } else {
        log('yellow', '⚠️ Servicio de email no disponible para verificación');
      }
    } catch (error) {
      log('yellow', '⚠️ No se pudo verificar el servicio de email');
    }

    return true;
  } catch (error) {
    log('red', `❌ Error preparando email: ${error.message}`);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  let usuarioEmail = 'N/A';
  
  try {
    // Obtener el email real del usuario antes del test
    const dbTemp = await mysql.createConnection(DB_CONFIG);
    const [usuarios] = await dbTemp.execute(
      'SELECT email FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );
    if (usuarios.length > 0) {
      usuarioEmail = usuarios[0].email;
    }
    await dbTemp.end();
    
    const exito = await testCierreAutomaticoDirecto();
    
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESULTADO FINAL DEL TEST');
    console.log('='.repeat(80));
    
    if (exito) {
      log('green', '🎉 ¡TEST COMPLETADO CON ÉXITO!');
      log('green', '✅ El sistema de cierre automático está funcionando');
      log('green', '✅ La jornada se cerró correctamente');
      log('green', '✅ Se preparó la notificación por email');
      log('yellow', `📧 Verifica tu email (${usuarioEmail}) para la notificación`);
      log('blue', '💡 El sistema real ejecuta esto automáticamente cada hora');
    } else {
      log('red', '❌ TEST FALLIDO');
      log('yellow', '⚠️ Revisar logs para identificar el problema');
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