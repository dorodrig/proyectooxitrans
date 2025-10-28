/**
 * Verificar y Actualizar Email del Usuario
 * 
 * Este script te permite ver y actualizar el email del usuario en la base de datos
 */

import mysql from 'mysql2/promise';

// Configuración
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

async function verificarEmail() {
  console.log('\n' + '='.repeat(80));
  log('magenta', '📧 VERIFICACIÓN DE EMAIL DEL USUARIO');
  log('magenta', '👤 Documento: ' + TEST_USER_DOC);
  console.log('='.repeat(80) + '\n');

  let db;

  try {
    // Conectar a la base de datos
    log('cyan', '🔌 Conectando a la base de datos AWS...');
    db = await mysql.createConnection(DB_CONFIG);
    log('green', '✅ Conexión establecida');

    // Obtener información completa del usuario
    const [usuarios] = await db.execute(
      'SELECT id, nombre, apellido, email, documento, telefono, created_at, updated_at FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );

    if (usuarios.length === 0) {
      log('red', `❌ Usuario con documento ${TEST_USER_DOC} no encontrado`);
      return;
    }

    const usuario = usuarios[0];
    
    log('green', '✅ Usuario encontrado:');
    log('blue', `   👤 ID: ${usuario.id}`);
    log('blue', `   📝 Nombre: ${usuario.nombre} ${usuario.apellido}`);
    log('blue', `   📄 Documento: ${usuario.documento}`);
    log('blue', `   📧 Email actual: ${usuario.email || 'NO CONFIGURADO'}`);
    log('blue', `   📞 Teléfono: ${usuario.telefono || 'NO CONFIGURADO'}`);
    log('blue', `   📅 Creado: ${usuario.created_at}`);
    log('blue', `   📅 Actualizado: ${usuario.updated_at}`);

    // Verificar si el email está configurado
    if (!usuario.email || usuario.email.trim() === '') {
      log('yellow', '\n⚠️ ADVERTENCIA: Este usuario NO tiene email configurado');
      log('yellow', '📧 No recibirá notificaciones por email');
      
      // Aquí puedes descomentar las siguientes líneas si quieres actualizar el email
      /*
      log('cyan', '\n🔧 ¿Quieres actualizar el email? Descomenta y modifica el código...');
      const nuevoEmail = 'tu_email@ejemplo.com'; // Cambia esto por el email correcto
      
      await db.execute(
        'UPDATE usuarios SET email = ?, updated_at = NOW() WHERE documento = ?',
        [nuevoEmail, TEST_USER_DOC]
      );
      
      log('green', `✅ Email actualizado a: ${nuevoEmail}`);
      */
    } else {
      log('green', '\n✅ El usuario tiene email configurado');
      log('blue', '📧 Recibirá notificaciones en: ' + usuario.email);
    }

    // Mostrar ejemplo de cómo actualizar el email si es necesario
    log('cyan', '\n💡 INSTRUCCIONES PARA ACTUALIZAR EMAIL:');
    log('blue', '   1. Si el email mostrado arriba NO es correcto');
    log('blue', '   2. Edita este archivo (test-verificar-email.mjs)');
    log('blue', '   3. Descomenta las líneas 69-77');
    log('blue', '   4. Cambia "tu_email@ejemplo.com" por el email correcto');
    log('blue', '   5. Ejecuta el script nuevamente');
    
    console.log('\n' + '='.repeat(80));
    log('magenta', '📊 RESUMEN');
    console.log('='.repeat(80));
    log('blue', `Usuario: ${usuario.nombre} ${usuario.apellido}`);
    log('blue', `Email: ${usuario.email || 'NO CONFIGURADO'}`);
    log(usuario.email ? 'green' : 'yellow', 
        usuario.email ? '✅ Email configurado correctamente' : '⚠️ Email NO configurado');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    log('red', `💥 ERROR: ${error.message}`);
    console.error(error);
  } finally {
    if (db) {
      await db.end();
      log('blue', '🔌 Conexión cerrada');
    }
  }
}

// También incluir una función para actualizar el email si es necesario
async function actualizarEmail(nuevoEmail) {
  console.log('\n' + '='.repeat(80));
  log('magenta', '📧 ACTUALIZANDO EMAIL DEL USUARIO');
  console.log('='.repeat(80) + '\n');

  let db;

  try {
    db = await mysql.createConnection(DB_CONFIG);
    
    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoEmail)) {
      throw new Error('Formato de email inválido');
    }

    await db.execute(
      'UPDATE usuarios SET email = ?, updated_at = NOW() WHERE documento = ?',
      [nuevoEmail, TEST_USER_DOC]
    );

    log('green', `✅ Email actualizado exitosamente a: ${nuevoEmail}`);
    
    // Verificar la actualización
    const [usuarios] = await db.execute(
      'SELECT email FROM usuarios WHERE documento = ?',
      [TEST_USER_DOC]
    );
    
    if (usuarios.length > 0 && usuarios[0].email === nuevoEmail) {
      log('green', '✅ Actualización verificada en la base de datos');
    } else {
      log('red', '❌ Error: La actualización no se reflejó correctamente');
    }

  } catch (error) {
    log('red', `💥 ERROR actualizando email: ${error.message}`);
  } finally {
    if (db) {
      await db.end();
    }
  }
}

// Ejecutar verificación
verificarEmail();

// Para actualizar email, descomenta la siguiente línea y cambia el email:
actualizarEmail('rodriguezdavid386@gmail.com');