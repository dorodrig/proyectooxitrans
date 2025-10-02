import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { validationResult } from 'express-validator';

interface AuthenticatedRequest extends Request {
  usuario?: {
    id: string;
    rol: string;
  };
}

export class RegistrosController {
  
  // Obtener todos los registros con paginación y filtros
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, fecha, usuarioId, tipo, departamento } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      let whereClause = 'WHERE 1=1';
      const params: string[] = [];
      
      if (fecha) {
        whereClause += ' AND DATE(ra.timestamp) = ?';
        params.push(fecha as string);
      }
      
      if (usuarioId) {
        whereClause += ' AND ra.usuario_id = ?';
        params.push(usuarioId as string);
      }
      
      if (tipo) {
        whereClause += ' AND ra.tipo = ?';
        params.push(tipo as string);
      }
      
      if (departamento) {
        whereClause += ' AND u.departamento = ?';
        params.push(departamento as string);
      }
      
      const query = `
        SELECT 
          ra.id,
          ra.usuario_id,
          ra.tipo,
          ra.timestamp,
          ra.latitud,
          ra.longitud,
          ra.dispositivo,
          ra.notas,
          ra.created_at,
          u.nombre,
          u.apellido,
          u.email,
          u.departamento,
          u.cargo
        FROM registros_acceso ra
        INNER JOIN usuarios u ON ra.usuario_id = u.id
        ${whereClause}
        ORDER BY ra.timestamp DESC
        LIMIT ? OFFSET ?
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM registros_acceso ra
        INNER JOIN usuarios u ON ra.usuario_id = u.id
        ${whereClause}
      `;
      
      const [registros, countResult] = await Promise.all([
        executeQuery(query, [...params, limitNum.toString(), offset.toString()]),
        executeQuery(countQuery, params)
      ]);
      
      const total = Array.isArray(countResult) ? countResult[0].total : 0;
      
      res.json({
        success: true,
        data: {
          registros,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error obteniendo registros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Crear nuevo registro de acceso
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }
      
      const { usuarioId, tipo, ubicacion, dispositivo, notas } = req.body;
      
      const query = `
        INSERT INTO registros_acceso (
          usuario_id, tipo, timestamp, latitud, longitud, dispositivo, notas
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        usuarioId,
        tipo,
        new Date(),
        ubicacion?.latitud || null,
        ubicacion?.longitud || null,
        dispositivo || null,
        notas || null
      ];
      
      const result = await executeQuery(query, params);
      const insertId = Array.isArray(result) && result.length > 0 ? result[0]?.insertId : null;
      
      if (!insertId) {
        res.status(500).json({
          success: false,
          message: 'Error al crear el registro'
        });
        return;
      }
      
      // Obtener el registro creado
      const registroQuery = `
        SELECT 
          ra.*,
          u.nombre,
          u.apellido,
          u.departamento
        FROM registros_acceso ra
        INNER JOIN usuarios u ON ra.usuario_id = u.id
        WHERE ra.id = ?
      `;
      
      const registro = await executeQuery(registroQuery, [insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Registro creado exitosamente',
        data: Array.isArray(registro) && registro.length > 0 ? registro[0] : null
      });
    } catch (error) {
      console.error('Error creando registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Registrar entrada
  static async registrarEntrada(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { usuarioId, ubicacion } = req.body;
      const dispositivo = req.headers['user-agent'] || 'Desconocido';
      
      // Verificar que no hay una entrada sin salida
      const ultimoRegistroQuery = `
        SELECT tipo FROM registros_acceso 
        WHERE usuario_id = ? AND DATE(timestamp) = CURDATE()
        ORDER BY timestamp DESC 
        LIMIT 1
      `;
      
      const ultimoRegistro = await executeQuery(ultimoRegistroQuery, [usuarioId]);
      
      if (Array.isArray(ultimoRegistro) && ultimoRegistro.length > 0 && ultimoRegistro[0].tipo === 'entrada') {
        res.status(400).json({
          success: false,
          message: 'Ya existe una entrada registrada sin salida para hoy'
        });
        return;
      }
      
      const query = `
        INSERT INTO registros_acceso (
          usuario_id, tipo, timestamp, latitud, longitud, dispositivo
        ) VALUES (?, 'entrada', ?, ?, ?, ?)
      `;
      
      const params = [
        usuarioId,
        new Date(),
        ubicacion?.latitud || null,
        ubicacion?.longitud || null,
        dispositivo
      ];
      
      await executeQuery(query, params);
      
      res.status(201).json({
        success: true,
        message: 'Entrada registrada exitosamente'
      });
    } catch (error) {
      console.error('Error registrando entrada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Registrar salida
  static async registrarSalida(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { usuarioId, ubicacion } = req.body;
      const dispositivo = req.headers['user-agent'] || 'Desconocido';
      
      // Verificar que hay una entrada sin salida
      const ultimoRegistroQuery = `
        SELECT tipo FROM registros_acceso 
        WHERE usuario_id = ? AND DATE(timestamp) = CURDATE()
        ORDER BY timestamp DESC 
        LIMIT 1
      `;
      
      const ultimoRegistro = await executeQuery(ultimoRegistroQuery, [usuarioId]);
      
      if (!Array.isArray(ultimoRegistro) || ultimoRegistro.length === 0 || ultimoRegistro[0].tipo !== 'entrada') {
        res.status(400).json({
          success: false,
          message: 'No se encontró una entrada registrada para hoy'
        });
        return;
      }
      
      const query = `
        INSERT INTO registros_acceso (
          usuario_id, tipo, timestamp, latitud, longitud, dispositivo
        ) VALUES (?, 'salida', ?, ?, ?, ?)
      `;
      
      const params = [
        usuarioId,
        new Date(),
        ubicacion?.latitud || null,
        ubicacion?.longitud || null,
        dispositivo
      ];
      
      await executeQuery(query, params);
      
      res.status(201).json({
        success: true,
        message: 'Salida registrada exitosamente'
      });
    } catch (error) {
      console.error('Error registrando salida:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
    // Obtener registros del día actual
  static async getToday(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query = `
        SELECT 
          ra.id,
          ra.usuario_id,
          ra.tipo,
          ra.timestamp,
          u.nombre,
          u.apellido,
          u.departamento,
          u.cargo
        FROM registros_acceso ra
        INNER JOIN usuarios u ON ra.usuario_id = u.id
        WHERE DATE(ra.timestamp) = CURDATE()
        ORDER BY ra.timestamp DESC
      `;
      
      const registros = await executeQuery(query);
      
      console.log(`[getToday] Encontrados ${Array.isArray(registros) ? registros.length : 0} registros para hoy`);
      
      // Headers para prevenir cache
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json({
        success: true,
        data: registros,
        timestamp: new Date().toISOString(),
        count: Array.isArray(registros) ? registros.length : 0
      });
    } catch (error) {
      console.error('Error obteniendo registros de hoy:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Obtener estadísticas
  static async getEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const params: string[] = [];
      
      if (startDate && endDate) {
        params.push(startDate as string, endDate as string);
      }
      
      const queries = [
        `SELECT COUNT(DISTINCT id) as totalEmpleados FROM usuarios WHERE estado = 'activo'`,
        `SELECT COUNT(*) as empleadosActivos FROM usuarios WHERE estado = 'activo'`,
        `SELECT COUNT(*) as registrosHoy FROM registros_acceso ra WHERE DATE(ra.timestamp) = CURDATE()`,
        `SELECT COUNT(DISTINCT ra.usuario_id) as empleadosPresentes 
         FROM registros_acceso ra 
         WHERE ra.tipo = 'entrada' 
         AND DATE(ra.timestamp) = CURDATE()
         AND NOT EXISTS (
           SELECT 1 FROM registros_acceso ra2 
           WHERE ra2.usuario_id = ra.usuario_id 
           AND ra2.tipo = 'salida' 
           AND ra2.timestamp > ra.timestamp 
           AND DATE(ra2.timestamp) = CURDATE()
         )`
      ];
      
      const results = await Promise.all(queries.map(query => executeQuery(query)));
      
      const estadisticas = {
        totalEmpleados: Array.isArray(results[0]) ? results[0][0]?.totalEmpleados || 0 : 0,
        empleadosActivos: Array.isArray(results[1]) ? results[1][0]?.empleadosActivos || 0 : 0,
        registrosHoy: Array.isArray(results[2]) ? results[2][0]?.registrosHoy || 0 : 0,
        empleadosPresentes: Array.isArray(results[3]) ? results[3][0]?.empleadosPresentes || 0 : 0,
        tardanzasHoy: 0, // Implementar lógica de tardanzas
        promedioHorasSemanales: 40.0 // Valor por defecto
      };
      
      console.log(`[getEstadisticas] Calculadas:`, estadisticas);
      
      // Headers para prevenir cache
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json({
        success: true,
        data: estadisticas,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
