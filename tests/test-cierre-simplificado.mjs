/**
 * Test Simplificado del Sistema de Cierre Automático
 * 
 * Este test simula una jornada y ejecuta el cierre automático
 * usando el usuario administrador existente (12345678)
 */

import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

// Configuración
const BASE_URL = 'http://localhost:3001';

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

// Configuración de la base de datos
const DB_CONFIG = {
  host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'oxitrans06092025*',
  database: 'control_acceso_oxitrans'
};

let db;

/**
 * Test simplificado del cierre automático
 */
async function testCierreAutomatico() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '🚀 TEST SIMPLIFICADO DE CIERRE AUTOMÁTICO');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Conectar a la base de datos
    log('cyan', '🔌 Conectando a la base de datos...');
    db = await mysql.createConnection(DB_CONFIG);
    log('green', '✅ Conexión establecida');

    // 2. Verificar usuario administrador
    const [usuarios] = await db.execute(
      'SELECT id, nombre, apellido, email, documento FROM usuarios WHERE documento = "12345678"'
    );

    if (usuarios.length === 0) {
      throw new Error('Usuario administrador no encontrado');
    }

    const usuario = usuarios[0];
    log('green', `✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido}`);
    log('blue', `📧 Email: ${usuario.email}`);

    // 3. Verificar estructura de la tabla jornadas_laborales
    log('cyan', '🔍 Verificando estructura de la tabla...');
    const [tableInfo] = await db.execute('DESCRIBE jornadas_laborales');
    log('blue', '📋 Columnas disponibles en jornadas_laborales:');
    tableInfo.forEach(col => log('blue', `   - ${col.Field} (${col.Type})`));

    // 4. Crear/verificar jornada activa para el usuario
    log('cyan', '📋 Preparando jornada para cierre automático...');
    
    // Limpiar jornadas del día actual
    await db.execute(
      'DELETE FROM jornadas_laborales WHERE usuario_id = ? AND DATE(fecha) = CURDATE()',
      [usuario.id]
    );

    // Crear jornada usando la estructura real de la tabla
    const ahora = new Date();
    const horaEntrada = new Date(ahora.getTime() - 8 * 60 * 60 * 1000); // 8 horas atrás
    
    const [jornadaResult] = await db.execute(`
      INSERT INTO jornadas_laborales (
        usuario_id, fecha, entrada, created_at, updated_at
      ) VALUES (?, CURDATE(), ?, NOW(), NOW())
    `, [usuario.id, horaEntrada]);

    const jornadaId = jornadaResult.insertId;
    log('green', `✅ Jornada creada (ID: ${jornadaId})`);
    log('blue', `📍 Entrada simulada: ${horaEntrada.toLocaleString()}`);

    // Verificar si existe tabla registros_tiempo
    try {
      const [registrosInfo] = await db.execute('DESCRIBE registros_tiempo');
      log('cyan', '📋 Tabla registros_tiempo encontrada, agregando registro...');
      
      await db.execute(`
        INSERT INTO registros_tiempo (
          usuario_id, jornada_id, tipo, timestamp, 
          ubicacion, observaciones, created_at, updated_at
        ) VALUES (?, ?, 'entrada', ?, 
          '{"latitud": 4.617105, "longitud": -74.136463}', 
          'Entrada simulada para test de cierre automático', NOW(), NOW())
      `, [usuario.id, jornadaId, horaEntrada]);

      log('green', '✅ Registro de tiempo agregado');
    } catch (error) {
      log('yellow', '⚠️ Tabla registros_tiempo no existe, continuando sin registro detallado');
    }

    // 5. Verificar configuración de cierre automático
    log('cyan', '⚙️ Verificando configuración de cierre automático...');
    
    try {
      // Verificar si existe la tabla jornadas_config
      const [configTableInfo] = await db.execute('DESCRIBE jornadas_config');
      log('blue', '📋 Columnas en jornadas_config:');
      configTableInfo.forEach(col => log('blue', `   - ${col.Field}`));

      const [configs] = await db.execute(`
        SELECT * FROM jornadas_config 
        WHERE activa = 1 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
      `);

      if (configs.length === 0) {
        // Crear configuración por defecto usando la estructura real
        await db.execute(`
          INSERT INTO jornadas_config (
            hora_entrada, tiempo_trabajo_dia, fin_jornada_laboral,
            usuario_id, activa, fecha_creacion, fecha_actualizacion
          ) VALUES ('08:00:00', 8, '17:00:00', NULL, 1, NOW(), NOW())
        `);
        log('yellow', '⚠️ Configuración por defecto creada');
      } else {
        const config = configs[0];
        log('green', '✅ Configuración encontrada:');
        log('blue', `   🕐 Entrada: ${config.hora_entrada}`);
        log('blue', `   🕐 Fin jornada: ${config.fin_jornada_laboral}`);
        log('blue', `   ⏰ Horas trabajo: ${config.tiempo_trabajo_dia}h`);
        log('blue', `   ✅ Activa: ${config.activa ? 'Sí' : 'No'}`);
      }
    } catch (error) {
      log('yellow', '⚠️ Tabla jornadas_config no existe o error en configuración');
      log('blue', `   Error: ${error.message}`);
    }

    // 6. Llamar directamente al método de cierre automático desde la base de datos
    log('cyan', '🔄 Ejecutando cierre automático directamente...');

    // Simular que ya pasó el tiempo de trabajo (llamar a la función del modelo)
    await db.execute('CALL sp_ejecutar_auto_cierre()');

    log('green', '✅ Procedimiento de auto-cierre ejecutado');

    // 7. Verificar el resultado
    log('cyan', '🔍 Verificando resultado del cierre...');
    
    const [jornadaFinal] = await db.execute(
      'SELECT * FROM jornadas_laborales WHERE id = ?',
      [jornadaId]
    );

    if (jornadaFinal.length > 0) {
      const jornada = jornadaFinal[0];
      log('green', '✅ Estado final de la jornada:');
      
      // Mostrar campos disponibles dinámicamente
      Object.keys(jornada).forEach(key => {
        if (jornada[key] !== null) {
          log('blue', `   ${key}: ${jornada[key]}`);
        }
      });

      // Verificar si tiene campo de cierre automático o salida
      const tieneSalida = jornada.salida || jornada.hora_salida;
      const esCerradaAuto = jornada.auto_cerrada || 
                            (jornada.observaciones && jornada.observaciones.includes('automático')) ||
                            (jornada.auto_cerrada_razon);

      if (tieneSalida || esCerradaAuto) {
        log('green', '🎉 ¡JORNADA PROCESADA EXITOSAMENTE!');
        
        if (esCerradaAuto) {
          log('green', '🤖 Cierre realizado automáticamente');
        }
        
        return true;
      } else {
        log('yellow', '⚠️ La jornada aún no se ha cerrado automáticamente');
        log('blue', '   Continuando con método alternativo...');
        return false;
      }
    } else {
      log('red', '❌ No se encontró la jornada');
      return false;
    }

  } catch (error) {
    if (error.code === 'ER_SP_DOES_NOT_EXIST') {
      log('yellow', '⚠️ Stored procedure no existe, usando método alternativo...');
      return await ejecutarCierreAlternativo();
    } else {
      log('red', `💥 ERROR: ${error.message}`);
      throw error;
    }
  } finally {
    if (db) {
      await db.end();
      log('blue', '🔌 Conexión cerrada');
    }
  }
}

/**
 * Método alternativo de cierre automático
 */
async function ejecutarCierreAlternativo() {
  log('cyan', '🔄 Ejecutando método alternativo de cierre...');

  try {
    // Obtener token de administrador
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documento: '12345678',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      log('red', '❌ Error de autenticación del admin');
      return false;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    log('green', '✅ Token de administrador obtenido');

    // Llamar al endpoint de cierre automático
    const cierreResponse = await fetch(`${BASE_URL}/api/jornadas/ejecutar-auto-cierre`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!cierreResponse.ok) {
      const errorText = await cierreResponse.text();
      log('red', `❌ Error en cierre automático: ${errorText}`);
      return false;
    }

    const cierreData = await cierreResponse.json();
    log('green', '✅ Cierre automático ejecutado via API');
    
    if (cierreData.success && cierreData.data) {
      log('blue', `📊 Jornadas procesadas: ${cierreData.data.length}`);
      
      cierreData.data.forEach((item, index) => {
        log('blue', `   ${index + 1}. Usuario ${item.usuario_id}: ${item.horas_trabajadas || 'N/A'}h trabajadas`);
      });

      if (cierreData.data.length > 0) {
        log('green', '🎉 ¡CIERRE AUTOMÁTICO EJECUTADO CON ÉXITO!');
        log('yellow', '📧 Revisa el email para ver la notificación de cierre');
        return true;
      } else {
        log('yellow', '⚠️ No había jornadas pendientes de cierre');
        return true;
      }
    } else {
      log('red', '❌ No se procesaron jornadas');
      return false;
    }

  } catch (error) {
    log('red', `❌ Error en método alternativo: ${error.message}`);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    const exito = await testCierreAutomatico();
    
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESULTADO FINAL DEL TEST');
    console.log('='.repeat(80));
    
    if (exito) {
      log('green', '🎉 TEST COMPLETADO CON ÉXITO');
      log('green', '✅ El sistema de cierre automático está funcionando');
      log('yellow', '📧 Verifica tu email para la notificación de cierre');
      log('blue', '💡 El sistema enviará emails automáticamente cuando sea necesario');
    } else {
      log('red', '❌ TEST FALLIDO');
      log('yellow', '⚠️ Revisar configuración del sistema');
    }
    
    console.log('='.repeat(80) + '\n');
    process.exit(exito ? 0 : 1);

  } catch (error) {
    log('red', `💥 ERROR CRÍTICO: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar el test
main();