import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/UsuarioModel';
import { Usuario } from '../types';

// Interface tipada para requests autenticados
interface AuthRequest extends Request {
  user?: Usuario;
}

// Interface para el payload del JWT
interface JWTPayload {
  userId: string;
  documento: string;
  rol: 'admin' | 'empleado' | 'supervisor';
  iat: number;
  exp: number;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('[auth] Middleware activado - Path:', req.path, 'Headers authorization:', !!req.headers.authorization);
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    // Verificar y decodificar el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    console.log('[auth] decoded:', decoded);
    console.log('[auth] decoded.userId:', decoded.userId, 'tipo:', typeof decoded.userId);
    
    // Buscar el usuario en la base de datos
    const user = await UsuarioModel.findById(decoded.userId);
    console.log('[auth] resultado búsqueda usuario:', user);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Verificar que el usuario esté activo
    if (user.estado !== 'activo') {
      res.status(401).json({
        success: false,
        message: 'Usuario inactivo o suspendido'
      });
      return;
    }

    // Convertir al formato esperado por el tipo Usuario de types/index.ts
    const formattedUser: Usuario = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono || undefined,
      documento: user.documento,
      tipoDocumento: user.tipoDocumento,
      rol: user.rol,
      estado: user.estado,
      fechaIngreso: new Date(user.fechaIngreso),
      departamento: user.departamento,
      cargo: user.cargo,
      codigoAcceso: user.codigoAcceso || undefined,
      fotoUrl: user.fotoUrl || undefined,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    };

    // Asignar el usuario al request
    req.user = formattedUser;
    next();
  } catch (error) {
    console.error('[auth] Error en autenticación:', error);
    res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (...roles: Array<'admin' | 'empleado' | 'supervisor'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    if (!roles.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      return;
    }
    
    next();
  };
};

// Middleware para solo administradores
export const requireAdmin = requireRole('admin');

// Middleware para administradores y supervisores
export const requireAdminOrSupervisor = requireRole('admin', 'supervisor');

// Middleware para verificar si el usuario puede acceder a sus propios datos
export const requireOwnershipOrAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
    return;
  }

  const userId = req.params.id;
  const isOwner = req.user.id === userId;
  const isAdmin = req.user.rol === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a estos datos'
    });
    return;
  }

  next();
};

// Export del tipo AuthRequest para uso en otros archivos
export type { AuthRequest };
