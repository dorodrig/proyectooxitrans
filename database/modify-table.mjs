// Script para modificar la tabla jornadas_config y permitir configuración global
import mysql from 'mysql2/promise';

// Usar la misma configuración que el backend
import dotenv from 'dotenv';
dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_acceso_oxitrans'
};

async function modificarTablaParaConfigGlobal() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('📋 Verificando estructura actual...');
    const [currentStructure] = await connection.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'jornadas_config' 
        AND TABLE_SCHEMA = 'control_acceso_oxitrans'
        AND COLUMN_NAME = 'usuario_id'
    `);
    
    console.log('📊 Estructura actual:', currentStructure);
    
    if (currentStructure[0]?.IS_NULLABLE === 'NO') {
      console.log('🔧 Modificando tabla para permitir configuración global...');
      
      // 1. Quitar la restricción de clave foránea
      console.log('1️⃣ Eliminando clave foránea...');
      try {
        await connection.execute(`ALTER TABLE jornadas_config DROP FOREIGN KEY fk_jornadas_config_usuario`);
        console.log('✅ Clave foránea eliminada');
      } catch (error) {
        console.log('ℹ️ Clave foránea ya eliminada o no existe');
      }
      
      // 2. Modificar la columna para permitir NULL
      console.log('2️⃣ Modificando columna usuario_id...');
      await connection.execute(`
        ALTER TABLE jornadas_config 
        MODIFY COLUMN usuario_id INT NULL COMMENT 'ID del usuario (NULL para configuración global empresarial)'
      `);
      console.log('✅ Columna modificada para permitir NULL');
      
      // 3. Recrear la clave foránea
      console.log('3️⃣ Recreando clave foránea...');
      await connection.execute(`
        ALTER TABLE jornadas_config 
        ADD CONSTRAINT fk_jornadas_config_usuario 
          FOREIGN KEY (usuario_id) 
          REFERENCES usuarios (id) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
      `);
      console.log('✅ Clave foránea recreada');
      
      console.log('🎉 ¡Tabla modificada exitosamente!');
    } else {
      console.log('✅ La tabla ya permite NULL en usuario_id');
    }
    
    // Verificar el cambio
    console.log('🔍 Verificando cambios...');
    const [newStructure] = await connection.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'jornadas_config' 
        AND TABLE_SCHEMA = 'control_acceso_oxitrans'
        AND COLUMN_NAME = 'usuario_id'
    `);
    
    console.log('📊 Nueva estructura:', newStructure);
    
    if (newStructure[0]?.IS_NULLABLE === 'YES') {
      console.log('🎯 ¡ÉXITO! La tabla ahora permite configuración global');
    } else {
      console.log('❌ Error: La tabla aún no permite NULL');
    }
    
  } catch (error) {
    console.error('❌ Error modificando la tabla:', error.message);
    console.error('Código de error:', error.code);
    console.error('SQL State:', error.sqlState);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el script
modificarTablaParaConfigGlobal();