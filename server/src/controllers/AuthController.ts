import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/UsuarioModel';

// Extender Request para incluir usuario autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    rol: string;
  };
}

export class AuthController {
  
  // Login de usuario
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Validar datos requeridos
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }
      
      // Buscar usuario
      const user = await UsuarioModel.findByEmailWithPassword(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      
      // Verificar contraseña
      const isValidPassword = await UsuarioModel.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      
      // Generar JWT
      const jwtSecret = process.env.JWT_SECRET || 'secret';
      
      const payload = { 
        userId: user.id, 
        email: user.email, 
        rol: user.rol 
      };
      
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
      
      // Remover password del usuario y destructurar correctamente
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Verificar token
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
        return;
      }
      
      interface JwtPayload {
        userId: string;
        email: string;
        rol: string;
        iat?: number;
        exp?: number;
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
      const user = await UsuarioModel.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.json({
        success: true,
        data: { user }
      });
      
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido : ' + error
      });
    }
  }
  
  // Cambiar contraseña
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva son requeridas'
        });
        return;
      }
      
      if (!req.user?.email) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const user = await UsuarioModel.findByEmailWithPassword(req.user.email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      const isValidPassword = await UsuarioModel.verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
        return;
      }
      
      // Actualizar contraseña
      const updated = await UsuarioModel.updatePassword(user.id, newPassword);
      
      if (!updated) {
        res.status(500).json({
          success: false,
          message: 'Error al actualizar la contraseña'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
