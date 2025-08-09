export type Rol = 'admin' | 'empleado' | 'supervisor';
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

export interface EstadisticasAcceso {
  totalEmpleados: number;
  empleadosActivos: number;
  registrosHoy: number;
  tardanzasHoy: number;
  promedioHorasSemanales: number;
  empleadosPresentes: number;
}
