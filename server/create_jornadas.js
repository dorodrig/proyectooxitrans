const mysql = require('mysql2/promise');

async function createJornadaFromRegistros() {
  const connection = await mysql.createConnection({
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    user: 'admin', 
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans'
  });

  try {
    console.log('🔧 Creando tabla jornadas_laborales y jornada actual...');
    
    // Crear tabla jornadas_laborales si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS jornadas_laborales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        fecha DATE NOT NULL,
        entrada DATETIME,
        descanso_manana_inicio DATETIME,
        descanso_manana_fin DATETIME,
        almuerzo_inicio DATETIME,
        almuerzo_fin DATETIME,
        descanso_tarde_inicio DATETIME,
        descanso_tarde_fin DATETIME,
        salida DATETIME,
        horas_trabajadas DECIMAL(4,2) DEFAULT 0,
        estado ENUM('en_curso', 'completada', 'incompleta') DEFAULT 'en_curso',
        latitud_entrada DECIMAL(10,8),
        longitud_entrada DECIMAL(11,8),
        precision_entrada DECIMAL(8,2),
        observaciones_entrada TEXT,
        latitud_salida DECIMAL(10,8),
        longitud_salida DECIMAL(11,8),
        precision_salida DECIMAL(8,2),
        observaciones_salida TEXT,
        auto_cerrada BOOLEAN DEFAULT 0,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        UNIQUE KEY unique_usuario_fecha (usuario_id, fecha)
      )
    `);
    console.log('✅ Tabla jornadas_laborales creada');
    
    // Obtener fecha de hoy
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener los registros de acceso de hoy para cada usuario
    const [registros] = await connection.execute(`
      SELECT usuario_id, tipo, timestamp
      FROM registros_acceso 
      WHERE DATE(timestamp) = CURDATE()
      ORDER BY usuario_id, timestamp
    `);
    
    console.log('📊 Registros encontrados:', registros.length);
    
    // Agrupar registros por usuario
    const registrosPorUsuario = {};
    registros.forEach(reg => {
      if (!registrosPorUsuario[reg.usuario_id]) {
        registrosPorUsuario[reg.usuario_id] = [];
      }
      registrosPorUsuario[reg.usuario_id].push(reg);
    });
    
    // Crear jornadas para cada usuario
    for (const [usuarioId, regs] of Object.entries(registrosPorUsuario)) {
      console.log(`🔄 Procesando usuario ${usuarioId} con ${regs.length} registros`);
      
      // Organizar registros por tipo
      let entrada = null;
      let descansoMananaInicio = null;
      let descansoMananaFin = null; 
      let almuerzoInicio = null;
      let almuerzoFin = null;
      let descansoTardeInicio = null;
      let descansoTardeFin = null;
      let salida = null;
      
      // Mapear los registros a eventos de jornada
      regs.forEach((reg, index) => {
        const hora = new Date(reg.timestamp).getHours();
        
        if (reg.tipo === 'entrada') {
          if (!entrada) {
            entrada = reg.timestamp; // Primera entrada del día
          } else if (hora >= 10 && hora < 11 && !descansoMananaFin) {
            descansoMananaFin = reg.timestamp; // Regreso de descanso AM
          } else if (hora >= 13 && hora < 15 && !almuerzoFin) {
            almuerzoFin = reg.timestamp; // Regreso de almuerzo
          } else if (hora >= 15 && !descansoTardeFin) {
            descansoTardeFin = reg.timestamp; // Regreso de descanso PM
          }
        } else if (reg.tipo === 'salida') {
          if (hora >= 10 && hora < 11 && !descansoMananaInicio) {
            descansoMananaInicio = reg.timestamp; // Salida a descanso AM
          } else if (hora >= 12 && hora < 13 && !almuerzoInicio) {
            almuerzoInicio = reg.timestamp; // Salida a almuerzo
          } else if (hora >= 15 && hora < 16 && !descansoTardeInicio) {
            descansoTardeInicio = reg.timestamp; // Salida a descanso PM
          } else if (hora >= 16) {
            salida = reg.timestamp; // Salida del día
          }
        }
      });
      
      // Calcular horas trabajadas (aproximado)
      let horasTrabajadas = 0;
      if (entrada) {
        const entradaTime = new Date(entrada).getTime();
        const salidaTime = salida ? new Date(salida).getTime() : new Date().getTime();
        let tiempoTotal = (salidaTime - entradaTime) / (1000 * 60 * 60); // En horas
        
        // Restar pausas
        if (descansoMananaInicio && descansoMananaFin) {
          tiempoTotal -= (new Date(descansoMananaFin).getTime() - new Date(descansoMananaInicio).getTime()) / (1000 * 60 * 60);
        }
        if (almuerzoInicio && almuerzoFin) {
          tiempoTotal -= (new Date(almuerzoFin).getTime() - new Date(almuerzoInicio).getTime()) / (1000 * 60 * 60);
        }
        if (descansoTardeInicio && descansoTardeFin) {
          tiempoTotal -= (new Date(descansoTardeFin).getTime() - new Date(descansoTardeInicio).getTime()) / (1000 * 60 * 60);
        }
        
        horasTrabajadas = Math.max(0, tiempoTotal);
      }
      
      // Insertar o actualizar jornada
      await connection.execute(`
        INSERT INTO jornadas_laborales (
          usuario_id, fecha, entrada, 
          descanso_manana_inicio, descanso_manana_fin,
          almuerzo_inicio, almuerzo_fin,
          descanso_tarde_inicio, descanso_tarde_fin,
          salida, horas_trabajadas,
          latitud_entrada, longitud_entrada, precision_entrada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.6097, -74.0817, 5.0)
        ON DUPLICATE KEY UPDATE
          entrada = VALUES(entrada),
          descanso_manana_inicio = VALUES(descanso_manana_inicio),
          descanso_manana_fin = VALUES(descanso_manana_fin),
          almuerzo_inicio = VALUES(almuerzo_inicio),
          almuerzo_fin = VALUES(almuerzo_fin),
          descanso_tarde_inicio = VALUES(descanso_tarde_inicio),
          descanso_tarde_fin = VALUES(descanso_tarde_fin),
          salida = VALUES(salida),
          horas_trabajadas = VALUES(horas_trabajadas)
      `, [
        usuarioId, today, entrada,
        descansoMananaInicio, descansoMananaFin,
        almuerzoInicio, almuerzoFin,
        descansoTardeInicio, descansoTardeFin,
        salida, parseFloat(horasTrabajadas.toFixed(2))
      ]);
      
      console.log(`✅ Jornada creada para usuario ${usuarioId}: ${horasTrabajadas.toFixed(2)} horas`);
    }
    
    // Verificar jornadas creadas
    const [jornadas] = await connection.execute(`
      SELECT jl.*, u.nombre, u.apellido,
             DATE_FORMAT(jl.entrada, '%H:%i:%s') as entrada_hora,
             DATE_FORMAT(jl.almuerzo_inicio, '%H:%i:%s') as almuerzo_inicio_hora,
             DATE_FORMAT(jl.almuerzo_fin, '%H:%i:%s') as almuerzo_fin_hora,
             DATE_FORMAT(jl.salida, '%H:%i:%s') as salida_hora
      FROM jornadas_laborales jl
      INNER JOIN usuarios u ON jl.usuario_id = u.id
      WHERE jl.fecha = CURDATE()
    `);
    
    console.log('📊 Jornadas creadas:');
    console.table(jornadas);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createJornadaFromRegistros();