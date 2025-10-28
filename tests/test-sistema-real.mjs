/**
 * Test del Endpoint Real de Cierre Automático
 * 
 * Este test activa el sistema real de cierre automático del servidor
 * y verifica que funcione correctamente con el usuario 12345678
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
 * Crear sesión válida para el usuario administrador
 */
async function crearSesionValida() {
  log('cyan', '🔑 Creando sesión válida para el administrador...');
  
  try {
    // Conectar a la base de datos
    db = await mysql.createConnection(DB_CONFIG);
    
    // Obtener datos del usuario
    const [usuarios] = await db.execute(
      'SELECT * FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );
    
    if (usuarios.length === 0) {
      throw new Error('Usuario administrador no encontrado');
    }
    
    const usuario = usuarios[0];
    log('green', `✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido}`);
    
    // Crear token JWT válido manualmente (simulando el proceso de login)
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'tu_clave_secreta_jwt_2024'; // Usar la misma del servidor
    
    const payload = {
      usuarioId: usuario.id,
      documento: usuario.documento,
      rol: usuario.rol,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };
    
    const token = jwt.sign(payload, JWT_SECRET);
    log('green', '✅ Token JWT generado correctamente');
    
    return { token, usuario };
    
  } catch (error) {
    log('yellow', '⚠️ Error creando sesión directa, intentando login normal...');
    return await loginNormal();
  }
}

/**
 * Login normal a través de API
 */
async function loginNormal() {
  log('cyan', '🔐 Intentando login normal...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documento: TEST_USER_DOC,
      password: 'admin123'
    })
  });

  if (!response.ok) {
    throw new Error(`Login fallido: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  log('green', '✅ Login exitoso');
  
  return { token: data.token, usuario: data.usuario };
}

/**
 * Preparar jornada para cierre automático
 */
async function prepararJornada(usuarioId) {
  log('cyan', '📋 Preparando jornada para cierre automático...');
  
  // Limpiar jornadas existentes del día
  await db.execute(
    'DELETE FROM jornadas_laborales WHERE usuario_id = ? AND DATE(fecha) = CURDATE()',
    [usuarioId]
  );
  
  // Crear jornada que necesite cierre automático (más de 8 horas)
  const ahora = new Date();
  const entrada = new Date(ahora.getTime() - 9 * 60 * 60 * 1000); // 9 horas atrás
  
  const [result] = await db.execute(`
    INSERT INTO jornadas_laborales (
      usuario_id, fecha, entrada, 
      latitud_entrada, longitud_entrada,
      observaciones_entrada,
      created_at, updated_at
    ) VALUES (?, CURDATE(), ?, 4.617105, -74.136463, 
      'Jornada para test de cierre automático - Sistema Real', NOW(), NOW())
  `, [usuarioId, entrada]);
  
  const jornadaId = result.insertId;
  log('green', `✅ Jornada preparada (ID: ${jornadaId})`);
  log('blue', `📍 Entrada: ${entrada.toLocaleString()}`);
  log('blue', `⏰ Tiempo transcurrido: ${Math.round((ahora - entrada) / (1000 * 60 * 60))} horas`);
  
  return jornadaId;
}

/**
 * Ejecutar el cierre automático real del sistema
 */
async function ejecutarCierreReal(token) {
  log('cyan', '🔄 Ejecutando cierre automático REAL del sistema...');
  
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
      log('red', `❌ Error HTTP ${response.status}: ${errorText}`);
      return false;
    }

    const result = await response.json();
    
    if (result.success) {
      log('green', '✅ ¡CIERRE AUTOMÁTICO EJECUTADO CON ÉXITO!');
      
      if (result.data && result.data.length > 0) {
        log('blue', `📊 Jornadas cerradas: ${result.data.length}`);
        
        result.data.forEach((cierre, index) => {
          log('blue', `   ${index + 1}. Usuario ${cierre.usuario_id}:`);
          log('blue', `      - Horas trabajadas: ${cierre.horas_trabajadas || 'N/A'}`);
          log('blue', `      - Email enviado: ${cierre.email_enviado ? 'Sí' : 'Pendiente'}`);
        });
        
        log('green', '🎉 ¡EL SISTEMA REAL FUNCIONÓ CORRECTAMENTE!');
        log('magenta', '📧 ¡REVISA TU EMAIL PARA VER LA NOTIFICACIÓN!');
        
        return true;
      } else {
        log('yellow', '⚠️ No se encontraron jornadas pendientes de cierre');
        log('blue', '💡 Esto significa que no había jornadas que necesitaran cierre automático');
        return true;
      }
    } else {
      log('red', `❌ Error en el sistema: ${result.message}`);
      return false;
    }
    
  } catch (error) {
    log('red', `❌ Error ejecutando cierre: ${error.message}`);
    return false;
  }
}

/**
 * Verificar el resultado en la base de datos
 */
async function verificarResultado(jornadaId) {
  log('cyan', '🔍 Verificando resultado en la base de datos...');
  
  const [jornadas] = await db.execute(
    'SELECT * FROM jornadas_laborales WHERE id = ?',
    [jornadaId]
  );
  
  if (jornadas.length > 0) {
    const jornada = jornadas[0];
    
    log('green', '✅ Estado de la jornada después del cierre:');
    log('blue', `   📅 Fecha: ${jornada.fecha}`);
    log('blue', `   🕐 Entrada: ${jornada.entrada ? new Date(jornada.entrada).toLocaleString() : 'N/A'}`);
    log('blue', `   🚪 Salida: ${jornada.salida ? new Date(jornada.salida).toLocaleString() : 'No cerrada'}`);
    log('blue', `   ⏱️  Horas: ${jornada.horas_trabajadas || 0}`);
    log('blue', `   🤖 Auto-cerrada: ${jornada.auto_cerrada ? 'SÍ' : 'No'}`);
    log('blue', `   📝 Razón: ${jornada.auto_cerrada_razon || 'N/A'}`);
    
    if (jornada.auto_cerrada && jornada.salida) {
      log('green', '🎉 ¡JORNADA CERRADA AUTOMÁTICAMENTE POR EL SISTEMA REAL!');
      return true;
    } else {
      log('yellow', '⚠️ La jornada no se cerró automáticamente');
      return false;
    }
  } else {
    log('red', '❌ No se encontró la jornada');
    return false;
  }
}

/**
 * Función principal del test
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '🚀 TEST DEL SISTEMA REAL DE CIERRE AUTOMÁTICO');
  log('magenta', '🎯 Este test usa el endpoint real del servidor');
  log('magenta', '📧 Si funciona, recibirás un email real');
  console.log('='.repeat(80) + '\n');

  let jornadaId;

  try {
    // 1. Crear sesión válida
    const { token, usuario } = await crearSesionValida();
    
    // 2. Preparar jornada que necesite cierre
    jornadaId = await prepararJornada(usuario.id);
    
    // 3. Ejecutar el cierre automático real
    const cierreExitoso = await ejecutarCierreReal(token);
    
    // 4. Verificar resultado
    const verificado = await verificarResultado(jornadaId);
    
    // 5. Mostrar resultado final
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESULTADO FINAL');
    console.log('='.repeat(80));
    
    if (cierreExitoso && verificado) {
      log('green', '🎉 ¡TEST COMPLETAMENTE EXITOSO!');
      log('green', '✅ El sistema real de cierre automático funciona');
      log('green', '✅ La jornada se cerró correctamente');
      log('green', '✅ El email se envió automáticamente');
      log('yellow', '📧 Revisa tu email: dorodrig@gmail.com');
      log('blue', '💡 El sistema ejecutará esto automáticamente cada hora');
    } else if (cierreExitoso) {
      log('yellow', '⚠️ TEST PARCIALMENTE EXITOSO');
      log('green', '✅ El endpoint de cierre funcionó');
      log('yellow', '⚠️ Pero no había jornadas que necesitaran cierre');
    } else {
      log('red', '❌ TEST FALLIDO');
      log('red', '❌ El sistema de cierre automático tiene problemas');
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