import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel, CreateUserData } from '../models/UsuarioModel';
import { Usuario } from '../types';

interface AuthRequest extends Request {
  user?: Usuario;
}

interface JwtPayload {
  userId: string;
  documento: string;
  rol: string;
  iat?: number;
  exp?: number;
}

export class AuthController {
  
  // Login de usuario
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { documento, password } = req.body;
      
      // Validar datos requeridos
      if (!documento || !password) {
        res.status(400).json({
          success: false,
          message: 'Documento y contraseña son requeridos'
        });
        return;
      }
      
      // Buscar usuario por documento con contraseña
      const user = await UsuarioModel.findByDocumentWithPassword(documento);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      
      // Verificar que el usuario esté activo
      if (user.estado !== 'activo') {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo o suspendido. Contacte al administrador.'
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
      const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

      const payload = {
        userId: user.id,
        documento: user.documento,
        rol: user.rol
      };

      // Usar la forma más explícita para evitar conflictos de tipos
      const token = jwt.sign(
        payload,
        jwtSecret,
        { 
          expiresIn: expiresIn
        } as jwt.SignOptions
      );
      
      // Remover password del usuario  
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
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
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
        return;
      }
      
      const jwtSecret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      // Buscar usuario actual en la base de datos
      const user = await UsuarioModel.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      // Verificar que el usuario sigue activo
      if (user.estado !== 'activo') {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo o suspendido'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Token válido',
        data: { user }
      });
      
    } catch (error) {
      console.error('Error verificando token:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
        return;
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Cambiar contraseña
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      // Validar datos requeridos
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual, nueva contraseña y confirmación son requeridas'
        });
        return;
      }
      
      // Validar que las contraseñas nuevas coincidan
      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña y la confirmación no coinciden'
        });
        return;
      }
      
      // Validar longitud de la nueva contraseña
      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
        return;
      }
      
      // Verificar que el usuario esté autenticado
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      // Buscar usuario con contraseña
      const user = await UsuarioModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      // Obtener usuario con contraseña para verificación
      const userWithPassword = await UsuarioModel.findByDocumentWithPassword(user.documento);
      if (!userWithPassword) {
        res.status(404).json({
          success: false,
          message: 'Error al verificar credenciales'
        });
        return;
      }
      
      // Verificar contraseña actual
      const isValidPassword = await UsuarioModel.verifyPassword(currentPassword, userWithPassword.passwordHash);
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
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

  // Registro de empleados
  static async registro(req: Request, res: Response): Promise<void> {
    try {
      const {
        nombre,
        apellido,
        email,
        documento,
        tipo_documento,
        telefono,
        departamento,
        cargo,
        password,
        confirmPassword,
        fecha_ingreso
      } = req.body;

      // Validar datos requeridos
      const requiredFields = {
        nombre: 'Nombre',
        apellido: 'Apellido',
        email: 'Email',
        documento: 'Documento',
        tipo_documento: 'Tipo de documento',
        departamento: 'Departamento',
        cargo: 'Cargo',
        password: 'Contraseña',
        confirmPassword: 'Confirmación de contraseña'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        const value = req.body[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          res.status(400).json({
            success: false,
            message: `El campo ${label} es requerido`
          });
          return;
        }
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Por favor ingrese un email válido'
        });
        return;
      }

      // Validar tipo de documento
      if (!['CC', 'CE', 'PA'].includes(tipo_documento)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido'
        });
        return;
      }

      // Validar contraseñas
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden'
        });
        return;
      }

      // Verificar si ya existe un usuario con el mismo email
      const existingUser = await UsuarioModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un usuario registrado con este email'
        });
        return;
      }

      // Verificar si ya existe un usuario con el mismo documento
      const existingDocument = await UsuarioModel.findByDocument(documento);
      if (existingDocument) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un usuario registrado con este documento'
        });
        return;
      }

      // Crear datos del usuario
      const userData: CreateUserData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        documento: documento.trim(),
        tipo_documento,
        rol: 'empleado' as const,
        estado: 'inactivo' as const, // Los registros necesitan aprobación
        fecha_ingreso: fecha_ingreso || new Date().toISOString().split('T')[0],
        departamento: departamento.trim(),
        cargo: cargo.trim(),
        codigo_acceso: null,
        foto_url: null
      };

      // Crear usuario con contraseña
      const userId = await UsuarioModel.createWithPassword(userData, password);

      res.status(201).json({
        success: true,
        message: 'Registro exitoso. Su cuenta será revisada por un administrador antes de ser activada.',
        data: {
          id: userId,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          estado: userData.estado
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de base de datos
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          res.status(409).json({
            success: false,
            message: 'El email o documento ya están registrados'
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ====================================
  // RESTABLECIMIENTO DE CONTRASEÑA
  // ====================================

  // Solicitar restablecimiento de contraseña
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { documento } = req.body;

      if (!documento || typeof documento !== 'string' || documento.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El número de documento es requerido'
        });
        return;
      }

      // Verificar si el usuario existe
      const usuario = await UsuarioModel.findByDocument(documento.trim());
      
      if (!usuario) {
        // Por seguridad, respondemos exitosamente aunque no exista
        res.status(200).json({
          success: true,
          message: 'Si el documento está registrado, podrás restablecer tu contraseña',
          documentExists: false
        });
        return;
      }

      // Verificar que el usuario esté activo
      if (usuario.estado !== 'activo') {
        res.status(400).json({
          success: false,
          message: 'La cuenta no está activa. Contacte al administrador.'
        });
        return;
      }

      // Generar token de restablecimiento
      const resetToken = await UsuarioModel.createPasswordResetToken(Number(usuario.id));
      
      res.status(200).json({
        success: true,
        message: 'Token de restablecimiento generado correctamente',
        data: {
          documentExists: true,
          resetToken,
          usuario: {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            documento: usuario.documento
          }
        }
      });

    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar token de restablecimiento
  static async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Token requerido'
        });
        return;
      }

      const verification = await UsuarioModel.verifyPasswordResetToken(token);

      if (!verification.valid) {
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          valid: true,
          userId: verification.userId
        }
      });

    } catch (error) {
      console.error('Error en verificación de token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Restablecer contraseña
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password, confirmPassword } = req.body;

      // Validar datos requeridos
      if (!token || !password || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Token, contraseña y confirmación son requeridos'
        });
        return;
      }

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden'
        });
        return;
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      // Restablecer contraseña
      const success = await UsuarioModel.resetPasswordWithToken(token, password);

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });

    } catch (error) {
      console.error('Error en restablecimiento de contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}