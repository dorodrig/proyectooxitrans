// ====================================
// INTERFACES DE USUARIO
// ====================================

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  documento: string;
  tipoDocumento: 'CC' | 'CE' | 'PA';
  rol: 'admin' | 'empleado' | 'supervisor';
  estado: 'activo' | 'inactivo' | 'suspendido';
  fechaIngreso: Date;
  departamento: string;
  cargo: string;
  codigoAcceso?: string;
  fotoUrl?: string;
  created_at: Date;
  updated_at: Date;
}

// Extender la interfaz Request de Express con module augmentation
declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

// ====================================
// INTERFACES DE REGISTROS
// ====================================

export interface RegistroAcceso {
  id: string;
  usuarioId: string;
  usuario?: Usuario;
  tipo: 'entrada' | 'salida';
  timestamp: Date;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
  dispositivo?: string;
  notas?: string;
  created_at: Date;
}

// ====================================
// INTERFACES DE EMPRESA
// ====================================

export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: string;
  created_at: Date;
  updated_at: Date;
}

// ====================================
// INTERFACES DE REGIONALES
// ====================================

export interface Regional {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono?: string;
  email?: string;
  responsable?: string;
  estado: 'activo' | 'inactivo';
  created_at: Date;
  updated_at: Date;
}

// ====================================
// INTERFACES DE CARGOS
// ====================================

export interface Cargo {
  id: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
  salario?: number;
  estado: 'activo' | 'inactivo';
  created_at: Date;
  updated_at: Date;
}

// ====================================
// INTERFACES DE NOVEDADES
// ====================================

export interface Novedad {
  id: string;
  usuarioId: string;
  usuario?: Usuario;
  tipo: 'permiso' | 'incapacidad' | 'vacaciones' | 'suspension' | 'otro';
  fechaInicio: Date;
  fechaFin: Date;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  aprobadoPor?: string;
  comentarios?: string;
  documentos?: string[];
  created_at: Date;
  updated_at: Date;
}

// ====================================
// INTERFACES DE API RESPONSES
// ====================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ====================================
// INTERFACES DE AUTENTICACIÓN
// ====================================

export interface LoginRequest {
  documento: string;
  password: string;
}

export interface LoginResponse {
  user: Usuario;
  token: string;
}

export interface JWTPayload {
  userId: string;
  documento: string;
  rol: 'admin' | 'empleado' | 'supervisor';
  iat?: number;
  exp?: number;
}

// ====================================
// INTERFACES DE VALIDACIÓN
// ====================================

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ====================================
// INTERFACES DE BASE DE DATOS
// ====================================

export interface DatabaseResult {
  insertId?: number;
  affectedRows?: number;
  changedRows?: number;
  fieldCount?: number;
  serverStatus?: number;
  warningCount?: number;
  message?: string;
}

// ====================================
// INTERFACES DE FILTROS Y BÚSQUEDA
// ====================================

export interface SearchCriteria {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'ASC' | 'DESC';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// ====================================
// TIPOS UTILITARIOS
// ====================================

export type UserRole = 'admin' | 'empleado' | 'supervisor';
export type UserStatus = 'activo' | 'inactivo' | 'suspendido';
export type DocumentType = 'CC' | 'CE' | 'PA';
export type AccessType = 'entrada' | 'salida';
export type NoveltyType = 'permiso' | 'incapacidad' | 'vacaciones' | 'suspension' | 'otro';
export type NoveltyStatus = 'pendiente' | 'aprobado' | 'rechazado';

// ====================================
// INTERFACES DE CONFIGURACIÓN
// ====================================

export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
  };
  upload: {
    path: string;
    maxSize: number;
  };
}