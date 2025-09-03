import { Request, Response } from 'express';
import { UsuarioModel } from '../models/UsuarioModel';
import { validationResult } from 'express-validator';

export class UsuariosController {
  // Dashboard: estadísticas generales
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const total = await UsuarioModel.countAll();
      const activos = await UsuarioModel.countByEstado('activo');
      const inactivos = await UsuarioModel.countByEstado('inactivo');
      const supervisores = await UsuarioModel.countByRol('supervisor');
      res.json({ total, activos, inactivos, supervisores });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Dashboard: usuarios por rol
  static async getPorRol(req: Request, res: Response): Promise<void> {
    try {
      const result = await UsuarioModel.countGroupByRol();
  const roles = result.map((r: { rol: string; total: number }) => r.rol);
  const cantidades = result.map((r: { rol: string; total: number }) => r.total);
      res.json({ roles, cantidades });
    } catch (error) {
      console.error('Error en getPorRol:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Dashboard: usuarios por departamento (regionales)
  static async getPorDepartamento(req: Request, res: Response): Promise<void> {
    try {
      const result = await UsuarioModel.countGroupByDepartamento();
      const departamentos = result.map((r: { departamento: string; total: number }) => r.departamento);
      const cantidades = result.map((r: { departamento: string; total: number }) => r.total);
      res.json({ departamentos, cantidades });
    } catch (error) {
      console.error('Error en getPorDepartamento:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Dashboard: usuarios por cargo
  static async getPorCargo(req: Request, res: Response): Promise<void> {
    try {
      const result = await UsuarioModel.countGroupByCargo();
      const cargos = result.map((r: { cargo: string; total: number }) => r.cargo);
      const cantidades = result.map((r: { cargo: string; total: number }) => r.total);
      res.json({ cargos, cantidades });
    } catch (error) {
      console.error('Error en getPorCargo:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Dashboard: estadísticas de novedades
  static async getNovedadesStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await UsuarioModel.getNovedadesStats();
      res.json(result);
    } catch (error) {
      console.error('Error en getNovedadesStats:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
  // Asignar regional y tipo_usuario a un usuario
  static async asignarRegionalYTipo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { regionalId, tipoUsuario } = req.body;
      if (!regionalId || !['planta', 'visita'].includes(tipoUsuario)) {
        res.status(400).json({ success: false, message: 'Datos inválidos' });
        return;
      }
      const updated = await UsuarioModel.asignarRegionalYTipo(id, regionalId, tipoUsuario);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      const usuario = await UsuarioModel.findById(id);
      res.json({ success: true, message: 'Regional y tipo asignados correctamente', data: usuario });
    } catch (error) {
      console.error('Error asignando regional y tipo:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
    // Asignar cargo a un usuario
    static async asignarCargo(req: Request, res: Response): Promise<void> {
      try {
        const { id } = req.params;
        const { cargo } = req.body;
        if (!cargo || typeof cargo !== 'string') {
          res.status(400).json({ success: false, message: 'Cargo inválido' });
          return;
        }
        const updated = await UsuarioModel.asignarCargo(id, cargo);
        if (!updated) {
          res.status(404).json({ success: false, message: 'Usuario no encontrado' });
          return;
        }
        const usuario = await UsuarioModel.findById(id);
        res.json({ success: true, message: 'Cargo asignado correctamente', data: usuario });
      } catch (error) {
        console.error('Error asignando cargo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
      }
    }
  // Asignar rol a un usuario
  static async asignarRol(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rol } = req.body;
      console.log('[asignarRol] id recibido:', id, 'rol recibido:', rol);
      if (!['admin', 'empleado', 'supervisor'].includes(rol)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
        return;
      }
      const updated = await UsuarioModel.asignarRol(id, rol);
      console.log('[asignarRol] resultado update:', updated);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      const usuario = await UsuarioModel.findById(id);
      res.json({
        success: true,
        message: 'Rol asignado correctamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error asignando rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Obtener todos los usuarios con paginación
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      // Forzar conversión segura a number
      const pageNum = Number.isFinite(Number(page)) && !isNaN(Number(page)) ? Number(page) : 1;
      const limitNum = Number.isFinite(Number(limit)) && !isNaN(Number(limit)) ? Number(limit) : 10;

      const { usuarios, total } = await UsuarioModel.findAllPaginated(
        pageNum,
        limitNum,
        typeof search === 'string' ? search : ''
      );

      res.json({
        success: true,
        data: {
          usuarios,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Obtener usuario por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.findById(id);
      
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Crear nuevo usuario
  static async create(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }
      
      const usuarioId = await UsuarioModel.create(req.body);
      const nuevoUsuario = await UsuarioModel.findById(usuarioId);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: nuevoUsuario
      });
    } catch (error) {
      console.error('Error creando usuario:', error);
      
      // Manejar errores específicos de MySQL
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        res.status(409).json({
          success: false,
          message: 'El email o documento ya está registrado'
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Actualizar usuario
  static async update(req: Request, res: Response): Promise<void> {
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
      
      const { id } = req.params;
      const updated = await UsuarioModel.update(id, req.body);
      
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      const usuarioActualizado = await UsuarioModel.findById(id);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Eliminar usuario (soft delete)
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await UsuarioModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Cambiar estado del usuario
  static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!['activo', 'inactivo', 'suspendido'].includes(estado)) {
        res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
        return;
      }
      
      const updated = await UsuarioModel.updateStatus(id, estado);
      
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      const usuario = await UsuarioModel.findById(id);
      
      res.json({
        success: true,
        message: `Usuario ${estado} exitosamente`,
        data: usuario
      });
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Buscar usuarios
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const criteria = req.query as Record<string, string>;
      const cleanCriteria: Record<string, string> = {};
      
      // Limpiar y validar criterios
      Object.entries(criteria).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim()) {
          cleanCriteria[key] = value.trim();
        }
      });
      
      const usuarios = await UsuarioModel.search(cleanCriteria);
      
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Obtener usuarios por departamento
  static async getByDepartamento(req: Request, res: Response): Promise<void> {
    try {
      const { departamento } = req.params;
      const usuarios = await UsuarioModel.findByDepartamento(departamento);
      
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      console.error('Error obteniendo usuarios por departamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Resetear contraseña
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tempPassword = await UsuarioModel.resetPassword(id);
      
      if (!tempPassword) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Contraseña reseteada exitosamente',
        data: { tempPassword }
      });
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
