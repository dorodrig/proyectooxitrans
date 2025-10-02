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
  regional_id: number | null;
  tipo_usuario: 'planta' | 'visita' | 'temporal' | null;
  regionalNombre?: string | null;
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
  regional_id: number | null;
  tipo_usuario: 'planta' | 'visita' | 'temporal' | null;
  regionalNombre?: string | null;
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
      regional_id: row.regional_id ?? null,
      tipo_usuario: row.tipo_usuario ?? null,
      regionalNombre: row.regionalNombre ?? null,
      created_at: typeof row.created_at === 'string' ? row.created_at : String(row.created_at),
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : String(row.updated_at)
    };
  }

  static async findById(id: string | number): Promise<Usuario | null> {
    console.log('[UsuarioModel.findById] Entrada - id:', id, 'tipo:', typeof id);
    const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log('[UsuarioModel.findById] ID convertido:', idNum, 'tipo:', typeof idNum);
    
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, created_at, updated_at
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
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, created_at, updated_at
      FROM usuarios
      WHERE email = ? AND estado != 'eliminado'
    `;
    const results = await executeQuery(query, [email]) as UserRow[];
    if (results.length === 0) return null;
    return this.formatUser(results[0]);
  }

  static async findByDocument(documento: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, created_at, updated_at
      FROM usuarios
      WHERE documento = ? AND estado != 'eliminado'
    `;
    const results = await executeQuery(query, [documento]) as UserRow[];
    if (results.length === 0) return null;
    return this.formatUser(results[0]);
  }

  static async findByEmailWithPassword(email: string): Promise<(Usuario & { passwordHash: string }) | null> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, password_hash, created_at, updated_at
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
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, password_hash, created_at, updated_at
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
    
    // Generar código de acceso manualmente para evitar problemas con triggers
    const codigoAcceso = userData.codigo_acceso || `OX${new Date().getFullYear()}${userData.documento.slice(-4).padStart(4, '0')}${Date.now().toString().slice(-3)}`;
    
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
      codigoAcceso,
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
      INSERT INTO password_reset_tokens (usuario_id, token, expires_at, created_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW()
    `;
    await executeQuery(query, [userId, token, expiresAt]);
    return token;
  }

  static async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: number }> {
    const query = `
      SELECT usuario_id, expires_at
      FROM password_reset_tokens
      WHERE token = ? AND expires_at > NOW() AND usado = 0
    `;
    const results = await executeQuery(query, [token]) as { usuario_id: number; expires_at: string }[];
    
    if (results.length === 0) {
      return { valid: false };
    }
    
    return { valid: true, userId: results[0].usuario_id };
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
      UPDATE password_reset_tokens SET usado = 1 WHERE token = ?
    `;
    await executeQuery(markTokenUsedQuery, [token]);
    
    return true;
  }

  // Métodos para estadísticas
  static async countAll(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM usuarios WHERE estado != 'eliminado'`;
    const results = await executeQuery(query) as { total: number }[];
    return results[0].total;
  }

  static async countByEstado(estado: string): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM usuarios WHERE estado = '${estado}' AND estado != 'eliminado'`;
    const results = await executeQuery(query) as { total: number }[];
    return results[0].total;
  }

  static async countByRol(rol: string): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM usuarios WHERE rol = '${rol}' AND estado != 'eliminado'`;
    const results = await executeQuery(query) as { total: number }[];
    return results[0].total;
  }

  static async countGroupByRol(): Promise<{ rol: string; total: number }[]> {
    const query = `
      SELECT rol, COUNT(*) as total 
      FROM usuarios 
      WHERE estado != 'eliminado' 
      GROUP BY rol
    `;
    const results = await executeQuery(query) as { rol: string; total: number }[];
    return results;
  }

  static async countGroupByDepartamento(): Promise<{ departamento: string; total: number }[]> {
    const query = `
      SELECT departamento, COUNT(*) as total 
      FROM usuarios 
      WHERE estado != 'eliminado' AND departamento IS NOT NULL AND departamento != ''
      GROUP BY departamento
      ORDER BY total DESC
    `;
    const results = await executeQuery(query) as { departamento: string; total: number }[];
    return results;
  }

  static async countGroupByCargo(): Promise<{ cargo: string; total: number }[]> {
    const query = `
      SELECT cargo, COUNT(*) as total 
      FROM usuarios 
      WHERE estado != 'eliminado' AND cargo IS NOT NULL AND cargo != ''
      GROUP BY cargo
      ORDER BY total DESC
    `;
    const results = await executeQuery(query) as { cargo: string; total: number }[];
    return results;
  }

  static async getNovedadesStats(): Promise<{
    totalNovedades: number;
    novedadesPorTipo: { tipo: string; total: number }[];
    novedadesPorMes: { mes: string; total: number }[];
  }> {
    // Total de novedades
    const totalQuery = `SELECT COUNT(*) as total FROM novedades`;
    const totalResult = await executeQuery(totalQuery) as { total: number }[];
    
    // Novedades por tipo
    const tipoQuery = `
      SELECT tipo, COUNT(*) as total 
      FROM novedades 
      GROUP BY tipo
      ORDER BY total DESC
    `;
    const tipoResults = await executeQuery(tipoQuery) as { tipo: string; total: number }[];
    
    // Novedades por mes (últimos 6 meses)
    const mesQuery = `
      SELECT 
        DATE_FORMAT(fechaInicio, '%Y-%m') as mes,
        COUNT(*) as total
      FROM novedades 
      WHERE fechaInicio >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fechaInicio, '%Y-%m')
      ORDER BY mes ASC
    `;
    const mesResults = await executeQuery(mesQuery) as { mes: string; total: number }[];
    
    return {
      totalNovedades: totalResult[0].total,
      novedadesPorTipo: tipoResults,
      novedadesPorMes: mesResults
    };
  }

  // Métodos de gestión de usuarios
  static async asignarRegionalYTipo(id: string, regionalId: string, tipoUsuario: string): Promise<boolean> {
    const query = `
      UPDATE usuarios 
      SET regional_id = ?, tipo_usuario = ?, updated_at = NOW() 
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
      SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.documento, u.tipo_documento, u.rol, u.estado, u.fecha_ingreso, u.departamento, u.cargo, u.codigo_acceso, u.foto_url, u.regional_id, u.tipo_usuario, u.created_at, u.updated_at,
             r.nombre as regionalNombre
      FROM usuarios u
      LEFT JOIN regionales r ON u.regional_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC 
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
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, created_at, updated_at
      FROM usuarios 
      ${whereClause}
      ORDER BY nombre, apellido
    `;
    const results = await executeQuery(query, params) as UserRow[];
    return results.map(row => this.formatUser(row));
  }

  static async findByDepartamento(departamento: string): Promise<Usuario[]> {
    const query = `
      SELECT id, nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, regional_id, tipo_usuario, created_at, updated_at
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