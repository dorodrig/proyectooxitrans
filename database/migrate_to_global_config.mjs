#!/usr/bin/env node

// ================================================
// Script de Migración Inteligente: Configuración Global OXITRANS
// ================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oxitrans_access_control',
  timezone: '+00:00'
};

class ConfiguracionGlobalMigrator {
  constructor() {
    this.connection = null;
  }

  async conectar() {
    try {
      this.connection = await mysql.createConnection(DB_CONFIG);
      console.log('✅ Conectado a la base de datos');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error.message);
      throw error;
    }
  }

  async desconectar() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Desconectado de la base de datos');
    }
  }

  async analizarConfiguracionesExistentes() {
    console.log('\n🔍 ANALIZANDO CONFIGURACIONES EXISTENTES...');
    
    const [configuraciones] = await this.connection.execute(`
      SELECT 
        jc.hora_entrada,
        jc.tiempo_trabajo_dia,
        jc.fin_jornada_laboral,
        COUNT(*) as frecuencia,
        GROUP_CONCAT(DISTINCT jc.usuario_id) as usuarios,
        GROUP_CONCAT(DISTINCT CONCAT(u.nombre, ' ', u.apellido)) as nombres_usuarios
      FROM jornadas_config jc
      LEFT JOIN usuarios u ON jc.usuario_id = u.id
      WHERE jc.activa = 1
      GROUP BY jc.hora_entrada, jc.tiempo_trabajo_dia, jc.fin_jornada_laboral
      ORDER BY frecuencia DESC
    `);

    console.log('\n📊 ANÁLISIS DE CONFIGURACIONES:');
    configuraciones.forEach((config, index) => {
      console.log(`\n${index + 1}. Configuración (${config.frecuencia} usuarios):`);
      console.log(`   🕒 Inicio: ${config.hora_entrada}`);
      console.log(`   ⏱️  Horas: ${config.tiempo_trabajo_dia}h`);
      console.log(`   🕔 Fin: ${config.fin_jornada_laboral}`);
      console.log(`   👥 Usuarios: ${config.nombres_usuarios || 'Sin nombres'}`);
    });

    return configuraciones;
  }

  async determinarConfiguracionGlobal(configuraciones) {
    console.log('\n🎯 DETERMINANDO CONFIGURACIÓN GLOBAL...');

    let configGlobal;

    if (configuraciones.length === 0) {
      console.log('📝 No hay configuraciones existentes. Usando valores estándar OXITRANS.');
      configGlobal = {
        hora_entrada: '08:00:00',
        tiempo_trabajo_dia: 8.00,
        fin_jornada_laboral: '17:00:00'
      };
    } else {
      // Usar la configuración más común
      const masComun = configuraciones[0];
      configGlobal = {
        hora_entrada: masComun.hora_entrada,
        tiempo_trabajo_dia: masComun.tiempo_trabajo_dia,
        fin_jornada_laboral: masComun.fin_jornada_laboral
      };
      
      console.log(`✅ Usando configuración más común (${masComun.frecuencia} usuarios)`);
    }

    console.log('🏢 CONFIGURACIÓN GLOBAL SELECCIONADA:');
    console.log(`   🕒 Hora inicio: ${configGlobal.hora_entrada}`);
    console.log(`   ⏱️  Horas trabajo: ${configGlobal.tiempo_trabajo_dia}h`);
    console.log(`   🕔 Hora salida: ${configGlobal.fin_jornada_laboral}`);

    return configGlobal;
  }

  async crearBackup() {
    console.log('\n💾 CREANDO BACKUP...');
    
    try {
      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS jornadas_config_backup AS
        SELECT 
          *,
          'MIGRACIÓN_GLOBAL' as motivo_backup,
          NOW() as fecha_backup
        FROM jornadas_config
        WHERE id > 0
      `);
      
      const [resultado] = await this.connection.execute(`
        SELECT COUNT(*) as registros_backup FROM jornadas_config_backup
      `);
      
      console.log(`✅ Backup creado: ${resultado[0].registros_backup} registros`);
    } catch (error) {
      console.log('⚠️  Backup ya existe o error creándolo:', error.message);
    }
  }

  async desactivarConfiguracionesExistentes() {
    console.log('\n🔄 DESACTIVANDO CONFIGURACIONES EXISTENTES...');
    
    const [resultado] = await this.connection.execute(`
      UPDATE jornadas_config 
      SET activa = 0, fecha_actualizacion = NOW()
      WHERE activa = 1
    `);
    
    console.log(`✅ ${resultado.affectedRows} configuraciones desactivadas`);
  }

  async crearConfiguracionGlobal(configGlobal) {
    console.log('\n🌐 CREANDO CONFIGURACIÓN GLOBAL...');
    
    try {
      const [resultado] = await this.connection.execute(`
        INSERT INTO jornadas_config (
          hora_entrada,
          tiempo_trabajo_dia,
          fin_jornada_laboral,
          usuario_id,
          activa,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (?, ?, ?, -1, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          hora_entrada = VALUES(hora_entrada),
          tiempo_trabajo_dia = VALUES(tiempo_trabajo_dia),
          fin_jornada_laboral = VALUES(fin_jornada_laboral),
          activa = VALUES(activa),
          fecha_actualizacion = NOW()
      `, [
        configGlobal.hora_entrada,
        configGlobal.tiempo_trabajo_dia,
        configGlobal.fin_jornada_laboral
      ]);
      
      console.log(`✅ Configuración global creada (ID: ${resultado.insertId || 'actualizada'})`);
    } catch (error) {
      console.error('❌ Error creando configuración global:', error.message);
      throw error;
    }
  }

  async verificarResultado() {
    console.log('\n🔍 VERIFICANDO RESULTADO...');
    
    const [configuraciones] = await this.connection.execute(`
      SELECT 
        id,
        TIME_FORMAT(hora_entrada, '%H:%i') as hora_inicio,
        tiempo_trabajo_dia as horas_trabajo,
        TIME_FORMAT(fin_jornada_laboral, '%H:%i') as hora_salida,
        CASE 
          WHEN usuario_id = -1 THEN 'CONFIGURACIÓN GLOBAL OXITRANS'
          ELSE CONCAT('Usuario: ', usuario_id)
        END as tipo,
        activa,
        fecha_actualizacion
      FROM jornadas_config 
      WHERE activa = 1
      ORDER BY usuario_id
    `);
    
    console.log('\n📋 CONFIGURACIONES ACTIVAS:');
    configuraciones.forEach(config => {
      console.log(`   ${config.tipo}: ${config.hora_inicio} - ${config.hora_salida} (${config.horas_trabajo}h)`);
    });
    
    if (configuraciones.length === 1 && configuraciones[0].tipo.includes('GLOBAL')) {
      console.log('\n✅ MIGRACIÓN EXITOSA: Solo existe una configuración global activa');
      return true;
    } else {
      console.log('\n❌ MIGRACIÓN INCOMPLETA: Se encontraron múltiples configuraciones activas');
      return false;
    }
  }

  async ejecutarMigracion() {
    console.log('🚀 INICIANDO MIGRACIÓN A CONFIGURACIÓN GLOBAL OXITRANS');
    console.log('=' .repeat(60));
    
    try {
      await this.conectar();
      
      // Paso 1: Analizar configuraciones existentes
      const configuraciones = await this.analizarConfiguracionesExistentes();
      
      // Paso 2: Determinar configuración global
      const configGlobal = await this.determinarConfiguracionGlobal(configuraciones);
      
      // Paso 3: Crear backup
      await this.crearBackup();
      
      // Paso 4: Desactivar configuraciones existentes
      await this.desactivarConfiguracionesExistentes();
      
      // Paso 5: Crear configuración global
      await this.crearConfiguracionGlobal(configGlobal);
      
      // Paso 6: Verificar resultado
      const exito = await this.verificarResultado();
      
      if (exito) {
        console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('🏢 Todos los empleados OXITRANS ahora usan la misma configuración de tiempo laboral');
      } else {
        console.log('\n⚠️  MIGRACIÓN COMPLETADA CON ADVERTENCIAS');
        console.log('🔧 Revise manualmente las configuraciones activas');
      }
      
    } catch (error) {
      console.error('\n❌ ERROR EN LA MIGRACIÓN:', error.message);
      console.error('🔙 Revertir cambios manualmente si es necesario');
      throw error;
    } finally {
      await this.desconectar();
    }
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  const migrator = new ConfiguracionGlobalMigrator();
  
  migrator.ejecutarMigracion()
    .then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script falló:', error.message);
      process.exit(1);
    });
}

module.exports = ConfiguracionGlobalMigrator;