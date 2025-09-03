import { executeQuery } from '../config/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  documento: string;
  tipoDocumento: 'CC' | 'CE' | 'PA';
  rol: 'admin' | 'empleado' | 'supervisor';
  estado: 'activo' | 'inactivo' | 'suspendido';
  fechaIngreso: string;
  departamento: string;
  cargo: string;
  codigoAcceso: string | null;
  fotoUrl: string | null;
  created_at: string;
  updated_at: string;
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

export interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  documento: string;
  tipo_documento: 'CC' | 'CE' | 'PA';
  rol: 'admin' | 'empleado' | 'supervisor';
  estado?: 'activo' | 'inactivo' | 'suspendido';
  fecha_ingreso: string;
  departamento: string;
  cargo: string;
  codigo_acceso?: string | null;
  foto_url?: string | null;
}

interface DatabaseResult {
  insertId?: number;
  affectedRows?: number;
}

export class UsuarioModel {
  static formatUser(row: UserRow): Usuario {
    return {
      id: row.id.toString(),
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      telefono: row.telefono ?? null,
      documento: row.documento,
      tipoDocumento: row.tipo_documento,
      rol: row.rol,
      estado: row.estado,
      fechaIngreso: row.fecha_ingreso,
      departamento: row.departamento,
      cargo: row.cargo,
      codigoAcceso: row.codigo_acceso ?? null,
      fotoUrl: row.foto_url ?? null,
      created_at: typeof row.created_at === 'string' ? row.created_at : String(row.created_at),
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : String(row.updated_at)
    };
  }

  static async findById(id: string | number): Promise<Usuario | null> {
    console.log('[UsuarioModel.findById] Entrada - id:', id, 'tipo:', typeof id);
    const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log('[UsuarioModel.findById] ID convertido:', idNum, 'tipo:', typeof idNum);
    
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios
      WHERE id = ? AND estado != 'eliminado'
    `;
    
    console.log('[UsuarioModel.findById] Ejecutando query con parámetros:', [idNum]);
    const results = await executeQuery(query, [idNum]) as UserRow[];
    console.log('[UsuarioModel.findById] Resultados query:', results);
    
    if (results.length === 0) return null;
    return this.formatUser(results[0]);
  }

  static async findByEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios
      WHERE email = ? AND estado != 'eliminado'
    `;
    const results = await executeQuery(query, [email]) as UserRow[];
    if (results.length === 0) return null;
    return this.formatUser(results[0]);
  }

  static async findByDocument(documento: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios
      WHERE documento = ? AND estado != 'eliminado'
    `;
    const results = await executeQuery(query, [documento]) as UserRow[];
    if (results.length === 0) return null;
    return this.formatUser(results[0]);
  }

  static async findByEmailWithPassword(email: string): Promise<(Usuario & { passwordHash: string }) | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, password_hash, created_at, updated_at
      FROM usuarios
      WHERE email = ? AND estado = 'activo'
    `;
    const results = await executeQuery(query, [email]) as (UserRow & { password_hash: string })[];
    if (results.length === 0) return null;
    const user = this.formatUser(results[0]);
    return { ...user, passwordHash: results[0].password_hash };
  }

  static async findByDocumentWithPassword(documento: string): Promise<(Usuario & { passwordHash: string }) | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, password_hash, created_at, updated_at
      FROM usuarios
      WHERE documento = ? AND estado = 'activo'
    `;
    const results = await executeQuery(query, [documento]) as (UserRow & { password_hash: string })[];
    if (results.length === 0) return null;
    const user = this.formatUser(results[0]);
    return { ...user, passwordHash: results[0].password_hash };
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [hashedPassword, id]) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  static async createWithPassword(userData: CreateUserData, password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      userData.nombre,
      userData.apellido,
      userData.email,
      userData.telefono || null,
      userData.documento,
      userData.tipo_documento,
      userData.rol,
      userData.estado || 'activo',
      userData.fecha_ingreso,
      userData.departamento,
      userData.cargo,
      userData.codigo_acceso || null,
      userData.foto_url || null,
      hashedPassword
    ];
    
    const result = await executeQuery(query, values) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result[0]?.insertId?.toString() || '0';
    }
    return result.insertId?.toString() || '0';
  }

  static async createPasswordResetToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);
    
    const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW()
    `;
    await executeQuery(query, [userId, token, expiresAt]);
    return token;
  }

  static async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: number }> {
    const query = `
      SELECT user_id, expires_at
      FROM password_reset_tokens
      WHERE token = ? AND expires_at > NOW() AND used = 0
    `;
    const results = await executeQuery(query, [token]) as { user_id: number; expires_at: string }[];
    
    if (results.length === 0) {
      return { valid: false };
    }
    
    return { valid: true, userId: results[0].user_id };
  }

  static async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const verification = await this.verifyPasswordResetToken(token);
    if (!verification.valid || !verification.userId) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatePasswordQuery = `
      UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ?
    `;
    await executeQuery(updatePasswordQuery, [hashedPassword, verification.userId]);
    
    const markTokenUsedQuery = `
      UPDATE password_reset_tokens SET used = 1 WHERE token = ?
    `;
    await executeQuery(markTokenUsedQuery, [token]);
    
    return true;
  }

  // Métodos para estadísticas
  static async countAll(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM usuarios WHERE estado != 'eliminado'`;
    const results = await executeQuery(query, []) as { total: number }[];
    return results[0].total;
  }

  static async countByEstado(estado: string): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM usuarios WHERE estado = ? AND estado != 'eliminado'`;
    const results = await executeQuery(query, [estado]) as { total: number }[];
    return results[0].total;
  }

  static async countByRol(rol: string): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM usuarios WHERE rol = ? AND estado != 'eliminado'`;
    const results = await executeQuery(query, [rol]) as { total: number }[];
    return results[0].total;
  }

  static async countGroupByRol(): Promise<{ rol: string; total: number }[]> {
    const query = `
      SELECT rol, COUNT(*) as total 
      FROM usuarios 
      WHERE estado != 'eliminado' 
      GROUP BY rol
    `;
    const results = await executeQuery(query, []) as { rol: string; total: number }[];
    return results;
  }

  // Métodos de gestión de usuarios
  static async asignarRegionalYTipo(id: string, regionalId: string, tipoUsuario: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET departamento = ?, cargo = ?, updated_at = NOW() 
      WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [regionalId, tipoUsuario, id]) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  static async asignarCargo(id: string, cargo: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET cargo = ?, updated_at = NOW() 
      WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [cargo, id]) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  static async asignarRol(id: string, rol: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET rol = ?, updated_at = NOW() 
      WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [rol, id]) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  // Métodos de paginación y búsqueda
  static async findAllPaginated(page: number, limit: number, search?: string): Promise<{ usuarios: Usuario[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE estado != 'eliminado'";
    
    if (search && search.trim()) {
      // Escapar el término de búsqueda para evitar inyección SQL
      const searchTerm = search.trim().replace(/'/g, "''");
      whereClause += ` AND (nombre LIKE '%${searchTerm}%' OR apellido LIKE '%${searchTerm}%' OR documento LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%')`;
    }

    const countQuery = `SELECT COUNT(*) as total FROM usuarios ${whereClause}`;
    const countResults = await executeQuery(countQuery) as { total: number }[];
    const total = countResults[0].total;

    const dataQuery = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    const dataResults = await executeQuery(dataQuery) as UserRow[];
    const usuarios = dataResults.map(row => this.formatUser(row));

    return { usuarios, total };
  }

  static async create(userData: CreateUserData): Promise<string> {
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      userData.nombre,
      userData.apellido,
      userData.email,
      userData.telefono || null,
      userData.documento,
      userData.tipo_documento,
      userData.rol,
      userData.estado || 'activo',
      userData.fecha_ingreso,
      userData.departamento,
      userData.cargo,
      userData.codigo_acceso || null,
      userData.foto_url || null
    ];
    
    const result = await executeQuery(query, values) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result[0]?.insertId?.toString() || '0';
    }
    return result.insertId?.toString() || '0';
  }

  static async update(id: string, userData: Partial<CreateUserData>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ? AND estado != 'eliminado'`;
    const result = await executeQuery(query, values) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const query = `UPDATE usuarios SET estado = 'eliminado', updated_at = NOW() WHERE id = ?`;
    const result = await executeQuery(query, [id]) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  static async updateStatus(id: string, estado: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET estado = ?, updated_at = NOW() 
      WHERE id = ? AND estado != 'eliminado'
    `;
    const result = await executeQuery(query, [estado, id]) as DatabaseResult | DatabaseResult[];
    
    if (Array.isArray(result)) {
      return result.length > 0 && (result[0]?.affectedRows || 0) > 0;
    }
    return (result.affectedRows || 0) > 0;
  }

  static async search(criteria: Record<string, string>): Promise<Usuario[]> {
    let whereClause = "WHERE estado != 'eliminado'";
    const params: string[] = [];

    if (criteria.nombre) {
      whereClause += " AND (nombre LIKE ? OR apellido LIKE ?)";
      params.push(`%${criteria.nombre}%`, `%${criteria.nombre}%`);
    }
    if (criteria.email) {
      whereClause += " AND email LIKE ?";
      params.push(`%${criteria.email}%`);
    }
    if (criteria.documento) {
      whereClause += " AND documento LIKE ?";
      params.push(`%${criteria.documento}%`);
    }
    if (criteria.rol) {
      whereClause += " AND rol = ?";
      params.push(criteria.rol);
    }
    if (criteria.estado) {
      whereClause += " AND estado = ?";
      params.push(criteria.estado);
    }
    if (criteria.departamento) {
      whereClause += " AND departamento = ?";
      params.push(criteria.departamento);
    }

    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY nombre, apellido
    `;
    const results = await executeQuery(query, params) as UserRow[];
    return results.map(row => this.formatUser(row));
  }

  static async findByDepartamento(departamento: string): Promise<Usuario[]> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, created_at, updated_at
      FROM usuarios 
      WHERE departamento = ? AND estado != 'eliminado'
      ORDER BY nombre, apellido
    `;
    const results = await executeQuery(query, [departamento]) as UserRow[];
    return results.map(row => this.formatUser(row));
  }

  static async resetPassword(id: string): Promise<string> {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const query = `
      UPDATE usuarios 
      SET password_hash = ?, updated_at = NOW() 
      WHERE id = ? AND estado != 'eliminado'
    `;
    await executeQuery(query, [hashedPassword, id]);
    return tempPassword;
  }
}