import { executeQuery, executeInsertQuery } from '../config/database';
import type { Usuario } from '../types';
import bcrypt from 'bcryptjs';

interface DbRow {
  [key: string]: unknown;
  insertId?: number;
  affectedRows?: number;
}

interface UserRow {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  documento: string;
  tipo_documento: 'CC' | 'CE' | 'PA';
  rol: 'admin' | 'empleado' | 'supervisor';
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_ingreso: string;
  departamento: string;
  cargo: string;
  codigo_acceso: string | null;
  foto_url: string | null;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}

export class UsuarioModel {
  // Asignar regional y tipo_usuario a un usuario
  static async asignarRegionalYTipo(id: string, regionalId: string, tipoUsuario: 'planta' | 'visita'): Promise<boolean> {
    const query = `
      UPDATE usuarios
      SET regional_id = ?, tipo_usuario = ?, updated_at = ?
      WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [regionalId, tipoUsuario, new Date(), id]);
    const getAffectedRows = (res: unknown): number => {
      if (Array.isArray(res)) {
        return typeof res[0]?.affectedRows === 'number' ? res[0].affectedRows : 0;
      } else if (typeof res === 'object' && res !== null && 'affectedRows' in res) {
        return typeof (res as { affectedRows?: number }).affectedRows === 'number' ? (res as { affectedRows: number }).affectedRows : 0;
      }
      return 0;
    };
    return getAffectedRows(result) > 0;
  }
  // Asignar rol a un usuario
  static async asignarRol(id: string, rol: 'admin' | 'empleado' | 'supervisor'): Promise<boolean> {
    const query = `
      UPDATE usuarios
      SET rol = ?, updated_at = ?
      WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [rol, new Date(), id]);
    // Helper para extraer affectedRows de cualquier tipo de resultado
    const getAffectedRows = (res: unknown): number => {
      if (Array.isArray(res)) {
        return typeof res[0]?.affectedRows === 'number' ? res[0].affectedRows : 0;
      } else if (typeof res === 'object' && res !== null && 'affectedRows' in res) {
        return typeof (res as { affectedRows?: number }).affectedRows === 'number' ? (res as { affectedRows: number }).affectedRows : 0;
      }
      return 0;
    };
    return getAffectedRows(result) > 0;
  }
  
  // Crear un nuevo usuario
  static async create(userData: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const hashedPassword = await bcrypt.hash(userData.documento, 10); // Usamos el documento como password inicial
    
    const query = `
      INSERT INTO usuarios (
        nombre, apellido, email, telefono, documento, tipo_documento,
        rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
        foto_url, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userData.nombre,
      userData.apellido,
      userData.email,
      userData.telefono || null,
      userData.documento,
      userData.tipoDocumento,
      userData.rol,
      userData.estado,
      userData.fechaIngreso,
      userData.departamento,
      userData.cargo,
      userData.codigoAcceso || null,
      userData.fotoUrl || null,
      hashedPassword
    ];
    
    const result = await executeQuery(query, params) as DbRow[];
    return (result[0]?.insertId as number).toString();
  }
  
  // Obtener usuario por ID
  static async findById(id: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      WHERE id = ? AND estado != 'eliminado'
    `;
    
    const results = await executeQuery(query, [id]) as UserRow[];
    if (results.length === 0) return null;
    
    return this.formatUser(results[0]);
  }
  
  // Obtener usuario por email
  static async findByEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      WHERE email = ? AND estado != 'eliminado'
    `;
    
    const results = await executeQuery(query, [email]) as UserRow[];
    if (results.length === 0) return null;
    
    return this.formatUser(results[0]);
  }
  
  // Obtener usuario por documento
  static async findByDocument(documento: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      WHERE documento = ? AND estado != 'eliminado'
    `;
    
    const results = await executeQuery(query, [documento]) as UserRow[];
    if (results.length === 0) return null;
    
    return this.formatUser(results[0]);
  }
  
  // Obtener usuario para login (incluye password)
  static async findByEmailWithPassword(email: string): Promise<(Usuario & { passwordHash: string }) | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, password_hash, created_at, updated_at
      FROM usuarios 
      WHERE email = ? AND estado = 'activo'
    `;
    
    const results = await executeQuery(query, [email]) as (UserRow & { password_hash: string })[];
    if (results.length === 0) return null;
    
    const user = this.formatUser(results[0]);
    return {
      ...user,
      passwordHash: results[0].password_hash
    };
  }

  // Obtener usuario para login por documento (incluye password)
  static async findByDocumentWithPassword(documento: string): Promise<(Usuario & { passwordHash: string }) | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, password_hash, created_at, updated_at
      FROM usuarios 
      WHERE documento = ? AND estado = 'activo'
    `;
    
    const results = await executeQuery(query, [documento]) as (UserRow & { password_hash: string })[];
    if (results.length === 0) return null;
    
    const user = this.formatUser(results[0]);
    return {
      ...user,
      passwordHash: results[0].password_hash
    };
  }
  
  // Obtener todos los usuarios con paginación
  static async findAll(page: number = 1, limit: number = 10): Promise<{ users: Usuario[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Query para obtener usuarios
    const usersQuery = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      WHERE estado != 'eliminado'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios 
      WHERE estado != 'eliminado'
    `;
    
    const [users, countResult] = await Promise.all([
      executeQuery(usersQuery, [limit, offset]) as Promise<UserRow[]>,
      executeQuery(countQuery) as Promise<Array<{ total: number }>>
    ]);
    
    return {
      users: users.map(user => this.formatUser(user)),
      total: countResult[0].total
    };
  }
  
  // Obtener usuarios con paginación
  static async findAllPaginated(page: number, limit: number, search: string = ''): Promise<{usuarios: Usuario[], total: number}> {
    const safeLimit = Number.isFinite(Number(limit)) && !isNaN(Number(limit)) ? Number(limit) : 10;
    const safePage = Number.isFinite(Number(page)) && !isNaN(Number(page)) ? Number(page) : 1;
    const offset = (safePage - 1) * safeLimit;

    let whereClause = "WHERE estado != 'eliminado'";
    const params: (string | number)[] = [];

    if (search && search.trim() !== '') {
      whereClause += " AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR documento LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    // Query para obtener usuarios
    const usersQuery = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios 
      ${whereClause}
    `;

    // Siempre pasar limit y offset como números al final del array de parámetros
    // Debug: log de query final
    console.log('[findAllPaginated] Query ejecutada:', usersQuery);
    console.log('[findAllPaginated] Params:', params);

    const [usuarios, countResult] = await Promise.all([
      executeQuery(usersQuery, params) as Promise<UserRow[]>,
      executeQuery(countQuery, params) as Promise<Array<{ total: number }>>
    ]);

    return {
      usuarios: usuarios.map((user: UserRow) => this.formatUser(user)),
      total: countResult[0].total
    };
  }
  
  // Buscar usuarios por criterios
  static async search(criteria: Record<string, string>): Promise<Usuario[]> {
    let whereClause = "WHERE estado != 'eliminado'";
    const params: string[] = [];
    
    if (criteria.nombre) {
      whereClause += " AND nombre LIKE ?";
      params.push(`%${criteria.nombre}%`);
    }
    
    if (criteria.departamento) {
      whereClause += " AND departamento = ?";
      params.push(criteria.departamento);
    }
    
    if (criteria.cargo) {
      whereClause += " AND cargo = ?";
      params.push(criteria.cargo);
    }
    
    if (criteria.rol) {
      whereClause += " AND rol = ?";
      params.push(criteria.rol);
    }
    
    if (criteria.estado) {
      whereClause += " AND estado = ?";
      params.push(criteria.estado);
    }
    
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY nombre, apellido
    `;
    
    const results = await executeQuery(query, params) as UserRow[];
    return results.map(user => this.formatUser(user));
  }
  
  // Obtener usuarios por departamento
  static async findByDepartamento(departamento: string): Promise<Usuario[]> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento,
             rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
             foto_url, created_at, updated_at
      FROM usuarios 
      WHERE departamento = ? AND estado = 'activo'
      ORDER BY nombre, apellido
    `;
    
    const results = await executeQuery(query, [departamento]) as UserRow[];
    return results.map(user => this.formatUser(user));
  }
  
  // Actualizar usuario
  static async update(id: string, userData: Partial<Omit<Usuario, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    
    // Construir query dinámicamente
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.mapFieldToDb(key);
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(new Date()); // updated_at
    values.push(id);
    
    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')}, updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, values) as DbRow[];
    return (result[0]?.affectedRows as number) > 0;
  }
  
  // Eliminar usuario (soft delete)
  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET estado = 'eliminado', updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [new Date(), id]) as DbRow[];
    return (result[0]?.affectedRows as number) > 0;
  }
  
  // Verificar password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Formatear usuario de DB a interfaz
  private static formatUser(dbUser: UserRow): Usuario {
    return {
      id: dbUser.id.toString(),
      nombre: dbUser.nombre,
      apellido: dbUser.apellido,
      email: dbUser.email,
      telefono: dbUser.telefono || undefined,
      documento: dbUser.documento,
      tipoDocumento: dbUser.tipo_documento,
      rol: dbUser.rol,
      estado: dbUser.estado,
      fechaIngreso: new Date(dbUser.fecha_ingreso),
      departamento: dbUser.departamento,
      cargo: dbUser.cargo,
      codigoAcceso: dbUser.codigo_acceso || undefined,
      fotoUrl: dbUser.foto_url || undefined,
      created_at: new Date(dbUser.created_at),
      updated_at: new Date(dbUser.updated_at)
    };
  }
  
  // Mapear campos de interfaz a DB
  private static mapFieldToDb(field: string): string {
    const fieldMap: Record<string, string> = {
      'tipoDocumento': 'tipo_documento',
      'fechaIngreso': 'fecha_ingreso',
      'codigoAcceso': 'codigo_acceso',
      'fotoUrl': 'foto_url'
    };
    
    return fieldMap[field] || field;
  }

  // Actualizar estado del usuario
  static async updateStatus(id: string, estado: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET estado = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [estado, new Date(), id]) as DbRow[];
    return (result[0]?.affectedRows as number) > 0;
  }
  
  // Resetear contraseña del usuario
  static async resetPassword(id: string): Promise<string | null> {
    // Generar nueva contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const query = `
      UPDATE usuarios 
      SET password_hash = ?, updated_at = ?
      WHERE id = ? AND estado != 'eliminado'
    `;
    
    const result = await executeQuery(query, [hashedPassword, new Date(), id]) as DbRow[];
    
    if ((result[0]?.affectedRows as number) > 0) {
      return tempPassword;
    }
    
    return null;
  }

  // Actualizar contraseña del usuario
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const query = `
      UPDATE usuarios 
      SET password_hash = ?, updated_at = ?
      WHERE id = ? AND estado != 'eliminado'
    `;
    
    const result = await executeQuery(query, [hashedPassword, new Date(), id]) as DbRow[];
    return (result[0]?.affectedRows as number) > 0;
  }

  // Crear usuario con contraseña personalizada (para registro)
  static async createWithPassword(
    userData: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>, 
    password: string
  ): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO usuarios (
        nombre, apellido, email, telefono, documento, tipo_documento,
        rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso,
        foto_url, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userData.nombre,
      userData.apellido,
      userData.email,
      userData.telefono || null,
      userData.documento,
      userData.tipoDocumento,
      userData.rol,
      userData.estado,
      userData.fechaIngreso,
      userData.departamento,
      userData.cargo,
      userData.codigoAcceso || null,
      userData.fotoUrl || null,
      hashedPassword
    ];

    const result = await executeInsertQuery(query, params);
    
    // Para INSERT, result tiene la propiedad insertId directamente
    if (result && result.insertId) {
      return result.insertId.toString();
    }
    
    throw new Error('Error al crear el usuario');
  }

  // ====================================
  // MÉTODOS PARA RESTABLECIMIENTO DE CONTRASEÑA
  // ====================================

  // Crear token de recuperación de contraseña (por ID de usuario)
  static async createPasswordResetToken(userId: number): Promise<string> {
    // Generar token único
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    // Token expira en 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const query = `
      INSERT INTO password_reset_tokens (usuario_id, token, expires_at)
      VALUES (?, ?, ?)
    `;

    await executeInsertQuery(query, [userId, token, expiresAt]);
    return token;
  }

  // Verificar token de recuperación
  static async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    const query = `
      SELECT usuario_id, expires_at, usado
      FROM password_reset_tokens
      WHERE token = ? AND usado = FALSE
    `;

    const results = await executeQuery(query, [token]) as Array<{
      usuario_id: number;
      expires_at: Date;
      usado: boolean;
    }>;

    if (results.length === 0) {
      return { valid: false };
    }

    const tokenData = results[0];
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return { valid: false };
    }

    return { valid: true, userId: tokenData.usuario_id.toString() };
  }

  // Restablecer contraseña usando token
  static async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const tokenVerification = await this.verifyPasswordResetToken(token);
    
    if (!tokenVerification.valid || !tokenVerification.userId) {
      return false;
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const updatePasswordQuery = `
      UPDATE usuarios 
      SET password_hash = ?, updated_at = NOW()
      WHERE id = ?
    `;

    // Marcar token como usado
    const markTokenUsedQuery = `
      UPDATE password_reset_tokens 
      SET usado = TRUE, used_at = NOW()
      WHERE token = ?
    `;

    try {
      await executeInsertQuery(updatePasswordQuery, [hashedPassword, tokenVerification.userId]);
      await executeInsertQuery(markTokenUsedQuery, [token]);
      return true;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      return false;
    }
  }

  // Limpiar tokens expirados (para mantenimiento)
  static async cleanExpiredTokens(): Promise<void> {
    const query = `
      DELETE FROM password_reset_tokens 
      WHERE expires_at < NOW() OR usado = TRUE
    `;
    
    await executeInsertQuery(query, []);
  }
}
