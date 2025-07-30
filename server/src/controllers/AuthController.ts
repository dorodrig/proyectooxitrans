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
      const { documento, password } = req.body;
      
      // Validar datos requeridos
      if (!documento || !password) {
        res.status(400).json({
          success: false,
          message: 'Documento y contraseña son requeridos'
        });
        return;
      }
      
      // Buscar usuario
      const user = await UsuarioModel.findByDocumentWithPassword(documento);
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
        documento: user.documento, 
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
        documento: string;
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
        fecha_ingreso
      } = req.body;

      // Validar datos requeridos
      const requiredFields = {
        nombre,
        apellido,
        email,
        documento,
        tipo_documento,
        departamento,
        cargo,
        password
      };

      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
          res.status(400).json({
            success: false,
            message: `El campo ${field} es requerido`
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

      // Verificar si ya existe un usuario con el mismo email o documento
      const existingUser = await UsuarioModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        });
        return;
      }

      const existingDocument = await UsuarioModel.findByDocument(documento);
      if (existingDocument) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este documento'
        });
        return;
      }

      // Crear nuevo usuario con estado "inactivo"
      const userData = {
        nombre,
        apellido,
        email,
        telefono: telefono || undefined,
        documento,
        tipoDocumento: tipo_documento,
        rol: 'empleado' as const,
        estado: 'inactivo' as const, // IMPORTANTE: El usuario se crea inactivo
        fechaIngreso: new Date(fecha_ingreso || new Date().toISOString().split('T')[0]),
        departamento,
        cargo,
        codigoAcceso: undefined,
        fotoUrl: undefined
      };

      const userId = await UsuarioModel.createWithPassword(userData, password);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Su cuenta será revisada por un administrador.',
        data: {
          id: userId,
          email: email,
          estado: 'inactivo'
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de base de datos
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          res.status(400).json({
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

  // Solicitar restablecimiento de contraseña (simplificado por documento)
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { documento } = req.body;

      if (!documento) {
        res.status(400).json({
          success: false,
          message: 'El número de documento es requerido'
        });
        return;
      }

      // Verificar si el usuario existe
      const usuario = await UsuarioModel.findByDocument(documento);
      
      if (!usuario) {
        // Por seguridad, respondemos con el mismo mensaje aunque no exista
        res.status(200).json({
          success: true,
          message: 'Si el documento existe, podrás restablecer tu contraseña',
          documentExists: false
        });
        return;
      }

      // Si el usuario existe, generamos un token temporal
      const resetToken = await UsuarioModel.createPasswordResetToken(Number(usuario.id));
      
      res.status(200).json({
        success: true,
        message: 'Documento verificado correctamente',
        documentExists: true,
        resetToken,
        usuario: {
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          documento: usuario.documento
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

      if (!token) {
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
        message: 'Token válido'
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
