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

export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  logoUrl?: string;
  configuracion: {
    horaInicioJornada: string;
    horaFinJornada: string;
    toleranciaMinutos: number;
    requiereUbicacion: boolean;
    diasLaborales: number[];
  };
}

export interface Notificacion {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  usuarioId?: string;
  leida: boolean;
  timestamp: Date;
}

// Tipos para respuestas de la base de datos
export interface DatabaseResult {
  insertId?: number;
  affectedRows?: number;
  changedRows?: number;
}

// Tipos para criterios de búsqueda
export interface SearchCriteria {
  nombre?: string;
  departamento?: string;
  cargo?: string;
  rol?: string;
  estado?: string;
}

// Tipos para respuestas de la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
