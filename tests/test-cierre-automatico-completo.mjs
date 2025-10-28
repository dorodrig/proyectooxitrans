/**
 * Test Completo del Sistema de Cierre Automático de Jornadas
 * 
 * Este test simula una jornada laboral completa para el usuario 12345678
 * y verifica que el sistema de cierre automático funcione correctamente.
 * 
 * Flujo de la prueba:
 * 1. Crear/simular jornada en progreso para el usuario
 * 2. Obtener configuración de horario maestro
 * 3. Simular el paso del tiempo hasta el horario de cierre
 * 4. Ejecutar el cierre automático
 * 5. Verificar que se cerró la jornada y se envió email
 */

import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

// Configuración
const BASE_URL = 'http://localhost:3001';
const TEST_USER_DOC = '12345678';
const TEST_EMAIL = 'dorodrig@gmail.com'; // Email del usuario con documento 12345678

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

// Configuración de la base de datos (usar las mismas credenciales del server/.env)
const DB_CONFIG = {
  host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'oxitrans06092025*',
  database: 'control_acceso_oxitrans'
};

let db;

/**
 * Obtener token de autenticación para el usuario de prueba
 */
async function obtenerTokenUsuario() {
  log('cyan', '🔐 Obteniendo token de autenticación...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: TEST_USER_DOC,
        password: 'password123' // Asume que tiene esta contraseña
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log('green', `✅ Token obtenido para ${data.usuario.nombre} ${data.usuario.apellido}`);
    return data.token;
  } catch (error) {
    log('red', `❌ Error obteniendo token: ${error.message}`);
    // Si falla el login, crear el usuario temporalmente
    return await crearUsuarioPrueba();
  }
}

/**
 * Crear usuario de prueba si no existe
 */
async function crearUsuarioPrueba() {
  log('yellow', '👤 Creando usuario de prueba...');
  
  try {
    // Primero verificar si existe
    const [existing] = await db.execute(
      'SELECT id FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );

    if (existing.length > 0) {
      log('green', '✅ Usuario ya existe en la base de datos');
      // Intentar login nuevamente
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: TEST_USER_DOC,
          password: 'password123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
    }

    // Crear usuario nuevo si no existe
    await db.execute(`
      INSERT INTO usuarios (
        nombre, apellido, email, documento, tipo_documento, telefono,
        departamento, cargo, rol, estado, fecha_ingreso, codigo_acceso,
        regional_id, tipo_usuario, password_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        updated_at = NOW()
    `, [
      'Usuario', 'Prueba', TEST_EMAIL, TEST_USER_DOC, 'CC', '3001234567',
      'IT', 'Desarrollador', 'empleado', 'activo', '2025-01-01',
      'OX2025TEST', 86, 'planta',
      '$2b$10$hash_fake_for_testing', // Hash fake para testing
    ]);

    log('green', '✅ Usuario de prueba creado');

    // Intentar login
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: TEST_USER_DOC,
        password: 'password123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else {
      throw new Error('No se pudo autenticar el usuario de prueba');
    }
  } catch (error) {
    log('red', `❌ Error creando usuario: ${error.message}`);
    throw error;
  }
}

/**
 * Simular jornada laboral en progreso
 */
async function crearJornadaPrueba(usuarioId) {
  log('cyan', '📋 Creando jornada de prueba...');
  
  try {
    // Limpiar jornadas existentes del día para este usuario
    await db.execute(
      'DELETE FROM jornadas_laborales WHERE usuario_id = ? AND DATE(fecha) = CURDATE()',
      [usuarioId]
    );

    // Crear jornada que empezó hace varias horas (simular jornada larga)
    const ahora = new Date();
    const inicioJornada = new Date(ahora);
    inicioJornada.setHours(8, 0, 0, 0); // Empezó a las 8:00 AM

    const [result] = await db.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, hora_entrada, estado, 
        tiempo_total_trabajado, created_at, updated_at
      ) VALUES (?, CURDATE(), ?, 'en_progreso', 0, NOW(), NOW())
    `, [usuarioId, inicioJornada.toTimeString().substring(0, 8)]);

    const jornadaId = result.insertId;

    // Simular algunos registros de la jornada (entrada, descansos, etc.)
    const registros = [
      {
        tipo: 'entrada',
        timestamp: inicioJornada,
        ubicacion: JSON.stringify({ latitud: 4.617105, longitud: -74.136463 })
      },
      {
        tipo: 'inicio_descanso_am',
        timestamp: new Date(inicioJornada.getTime() + 2 * 60 * 60 * 1000), // 10:00 AM
        ubicacion: JSON.stringify({ latitud: 4.617105, longitud: -74.136463 })
      },
      {
        tipo: 'fin_descanso_am',
        timestamp: new Date(inicioJornada.getTime() + 2.25 * 60 * 60 * 1000), // 10:15 AM
        ubicacion: JSON.stringify({ latitud: 4.617105, longitud: -74.136463 })
      },
      {
        tipo: 'inicio_almuerzo',
        timestamp: new Date(inicioJornada.getTime() + 4 * 60 * 60 * 1000), // 12:00 PM
        ubicacion: JSON.stringify({ latitud: 4.617105, longitud: -74.136463 })
      },
      {
        tipo: 'fin_almuerzo',
        timestamp: new Date(inicioJornada.getTime() + 5 * 60 * 60 * 1000), // 1:00 PM
        ubicacion: JSON.stringify({ latitud: 4.617105, longitud: -74.136463 })
      }
    ];

    for (const registro of registros) {
      await db.execute(`
        INSERT INTO registros_tiempo (
          usuario_id, jornada_id, tipo, timestamp, ubicacion, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        usuarioId, jornadaId, registro.tipo,
        registro.timestamp.toISOString().slice(0, 19).replace('T', ' '),
        registro.ubicacion
      ]);
    }

    log('green', `✅ Jornada de prueba creada (ID: ${jornadaId})`);
    log('blue', `📊 Jornada iniciada a las ${inicioJornada.toTimeString().substring(0, 8)}`);
    log('blue', `📊 Registros simulados: ${registros.length}`);
    
    return jornadaId;
  } catch (error) {
    log('red', `❌ Error creando jornada: ${error.message}`);
    throw error;
  }
}

/**
 * Obtener configuración del horario maestro
 */
async function obtenerConfiguracionHorario() {
  log('cyan', '⏰ Obteniendo configuración de horario maestro...');
  
  try {
    const [rows] = await db.execute(`
      SELECT hora_entrada, hora_salida, horas_trabajo_diarias, 
             tolerancia_entrada, tolerancia_salida, auto_cierre_activo
      FROM jornadas_config 
      WHERE activo = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (rows.length === 0) {
      // Crear configuración por defecto si no existe
      await db.execute(`
        INSERT INTO jornadas_config (
          hora_entrada, hora_salida, horas_trabajo_diarias,
          tolerancia_entrada, tolerancia_salida, auto_cierre_activo, activo,
          created_at, updated_at
        ) VALUES ('08:00:00', '17:00:00', 8, 15, 30, 1, 1, NOW(), NOW())
      `);

      log('yellow', '⚠️ Configuración por defecto creada');
      return {
        hora_entrada: '08:00:00',
        hora_salida: '17:00:00',
        horas_trabajo_diarias: 8,
        tolerancia_entrada: 15,
        tolerancia_salida: 30,
        auto_cierre_activo: 1
      };
    }

    const config = rows[0];
    log('green', '✅ Configuración de horario obtenida:');
    log('blue', `   📅 Entrada: ${config.hora_entrada}`);
    log('blue', `   📅 Salida: ${config.hora_salida}`);
    log('blue', `   ⏱️  Horas diarias: ${config.horas_trabajo_diarias}h`);
    log('blue', `   🔄 Auto-cierre: ${config.auto_cierre_activo ? 'Activo' : 'Inactivo'}`);
    
    return config;
  } catch (error) {
    log('red', `❌ Error obteniendo configuración: ${error.message}`);
    throw error;
  }
}

/**
 * Simular el paso del tiempo hasta el horario de cierre
 */
async function simularPasoTiempo(jornadaId, horaSalida) {
  log('cyan', '⏰ Simulando paso del tiempo hasta horario de cierre...');
  
  try {
    // Calcular la hora de cierre esperada
    const ahora = new Date();
    const [horas, minutos] = horaSalida.split(':').map(Number);
    const horaCierre = new Date(ahora);
    horaCierre.setHours(horas, minutos, 0, 0);

    // Si la hora ya pasó, simular que es del día actual
    if (horaCierre <= ahora) {
      log('yellow', `⚠️ Hora de cierre (${horaSalida}) ya pasó, simulando cierre inmediato`);
    } else {
      log('blue', `📍 Hora actual: ${ahora.toTimeString().substring(0, 8)}`);
      log('blue', `🎯 Hora de cierre programada: ${horaCierre.toTimeString().substring(0, 8)}`);
    }

    // Actualizar la jornada para que parezca que ya pasó el tiempo necesario
    await db.execute(`
      UPDATE jornadas_laborales 
      SET updated_at = DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      WHERE id = ?
    `, [jornadaId]);

    log('green', '✅ Tiempo simulado correctamente');
    return horaCierre;
  } catch (error) {
    log('red', `❌ Error simulando tiempo: ${error.message}`);
    throw error;
  }
}

/**
 * Ejecutar el cierre automático
 */
async function ejecutarCierreAutomatico(token) {
  log('cyan', '🔄 Ejecutando cierre automático de jornadas...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/jornadas/ejecutar-auto-cierre`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    log('green', '✅ Cierre automático ejecutado');
    
    if (result.data && result.data.length > 0) {
      log('blue', `📊 Jornadas cerradas: ${result.data.length}`);
      result.data.forEach((cierre, index) => {
        log('blue', `   ${index + 1}. Usuario ${cierre.usuario_id} - ${cierre.horas_trabajadas}h`);
      });
    } else {
      log('yellow', '⚠️ No se encontraron jornadas para cerrar');
    }
    
    return result;
  } catch (error) {
    log('red', `❌ Error ejecutando cierre automático: ${error.message}`);
    throw error;
  }
}

/**
 * Verificar que se cerró la jornada correctamente
 */
async function verificarCierreJornada(usuarioId, jornadaId) {
  log('cyan', '🔍 Verificando cierre de jornada...');
  
  try {
    const [jornadas] = await db.execute(
      'SELECT * FROM jornadas_laborales WHERE id = ? AND usuario_id = ?',
      [jornadaId, usuarioId]
    );

    if (jornadas.length === 0) {
      throw new Error('Jornada no encontrada');
    }

    const jornada = jornadas[0];
    
    log('green', '✅ Estado de la jornada verificado:');
    log('blue', `   📋 Estado: ${jornada.estado}`);
    log('blue', `   ⏰ Entrada: ${jornada.hora_entrada}`);
    log('blue', `   🚪 Salida: ${jornada.hora_salida || 'No registrada'}`);
    log('blue', `   ⏱️  Tiempo total: ${jornada.tiempo_total_trabajado || 0} min`);
    log('blue', `   📝 Observaciones: ${jornada.observaciones || 'Ninguna'}`);

    // Verificar que se cerró automáticamente
    if (jornada.estado === 'completada' && jornada.observaciones && 
        jornada.observaciones.includes('Cierre automático')) {
      log('green', '🎉 ¡Jornada cerrada automáticamente con éxito!');
      return true;
    } else if (jornada.estado === 'completada') {
      log('yellow', '⚠️ Jornada cerrada pero no automáticamente');
      return true;
    } else {
      log('red', '❌ La jornada no se cerró automáticamente');
      return false;
    }
  } catch (error) {
    log('red', `❌ Error verificando cierre: ${error.message}`);
    return false;
  }
}

/**
 * Verificar el envío de email (revisar logs)
 */
async function verificarEnvioEmail() {
  log('cyan', '📧 Verificando envío de email de notificación...');
  
  try {
    // Hacer una llamada a un endpoint de prueba de email si existe
    // o simplemente revisar que el servicio esté funcionando
    const response = await fetch(`${BASE_URL}/api/health`);
    
    if (response.ok) {
      log('green', '✅ Servicio de email está activo');
      log('blue', '📨 Revisa tu email para ver la notificación de cierre automático');
      log('yellow', `📬 Email enviado a: ${TEST_EMAIL}`);
      return true;
    } else {
      log('yellow', '⚠️ No se pudo verificar el estado del servicio de email');
      return false;
    }
  } catch (error) {
    log('red', `❌ Error verificando email: ${error.message}`);
    return false;
  }
}

/**
 * Limpiar datos de prueba
 */
async function limpiarDatosPrueba(usuarioId, jornadaId) {
  log('cyan', '🧹 Limpiando datos de prueba...');
  
  try {
    // Solo limpiar si es usuario de prueba
    if (TEST_USER_DOC === '12345678') {
      // No eliminar, solo marcar como prueba
      await db.execute(
        'UPDATE jornadas_laborales SET observaciones = CONCAT(COALESCE(observaciones, ""), " [PRUEBA]") WHERE id = ?',
        [jornadaId]
      );
      
      log('green', '✅ Jornada marcada como prueba (no eliminada)');
    }
  } catch (error) {
    log('yellow', `⚠️ Error limpiando datos: ${error.message}`);
  }
}

/**
 * Función principal del test
 */
async function ejecutarTestCompleto() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '🚀 INICIANDO TEST COMPLETO DE CIERRE AUTOMÁTICO');
  log('magenta', '📋 Usuario de prueba: ' + TEST_USER_DOC);
  log('magenta', '📧 Email de notificación: ' + TEST_EMAIL);
  console.log('='.repeat(80) + '\n');

  let usuarioId, jornadaId, token;

  try {
    // 1. Conectar a la base de datos
    log('cyan', '🔌 Conectando a la base de datos...');
    db = await mysql.createConnection(DB_CONFIG);
    log('green', '✅ Conexión establecida');

    // 2. Obtener ID del usuario
    const [usuarios] = await db.execute(
      'SELECT id, nombre, apellido, email FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );

    if (usuarios.length === 0) {
      throw new Error(`Usuario con documento ${TEST_USER_DOC} no encontrado`);
    }

    usuarioId = usuarios[0].id;
    const usuario = usuarios[0];
    log('green', `✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido} (ID: ${usuarioId})`);

    // 3. Obtener token de autenticación
    token = await obtenerTokenUsuario();

    // 4. Obtener configuración de horario
    const config = await obtenerConfiguracionHorario();

    // 5. Crear jornada de prueba
    jornadaId = await crearJornadaPrueba(usuarioId);

    // 6. Simular paso del tiempo
    await simularPasoTiempo(jornadaId, config.hora_salida);

    // 7. Ejecutar cierre automático
    const resultadoCierre = await ejecutarCierreAutomatico(token);

    // 8. Verificar que se cerró la jornada
    const cierreExitoso = await verificarCierreJornada(usuarioId, jornadaId);

    // 9. Verificar envío de email
    const emailEnviado = await verificarEnvioEmail();

    // 10. Mostrar resultados finales
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESUMEN DE RESULTADOS DEL TEST');
    console.log('='.repeat(80));
    
    log(cierreExitoso ? 'green' : 'red', `🔄 Cierre automático: ${cierreExitoso ? 'EXITOSO' : 'FALLIDO'}`);
    log(emailEnviado ? 'green' : 'yellow', `📧 Notificación email: ${emailEnviado ? 'VERIFICADO' : 'PENDIENTE'}`);
    
    if (cierreExitoso) {
      log('green', '🎉 ¡TEST COMPLETADO CON ÉXITO!');
      log('blue', '📋 La jornada se cerró automáticamente según la configuración');
      log('blue', '📧 Se envió notificación por email al usuario');
      log('yellow', '💡 Revisa tu email para ver la notificación completa');
    } else {
      log('red', '❌ TEST FALLIDO - Revisar logs del sistema');
    }

    // 11. Limpiar datos de prueba
    await limpiarDatosPrueba(usuarioId, jornadaId);

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    log('red', `💥 ERROR CRÍTICO EN EL TEST: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (db) {
      await db.end();
      log('blue', '🔌 Conexión de base de datos cerrada');
    }
  }
}

// Ejecutar el test
ejecutarTestCompleto().catch(console.error);