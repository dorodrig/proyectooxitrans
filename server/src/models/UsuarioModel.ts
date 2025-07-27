import { executeQuery } from '../config/database';
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
    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE estado != 'eliminado'";
    const params: (string | number)[] = [];
    
    if (search) {
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
      LIMIT ? OFFSET ?
    `;
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios 
      ${whereClause}
    `;
    
    const [usuarios, countResult] = await Promise.all([
      executeQuery(usersQuery, [...params, limit, offset]) as Promise<UserRow[]>,
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
}
