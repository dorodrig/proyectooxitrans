import { Request } from 'express';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  departamento: string;
  cargo: string;
  rol: 'admin' | 'empleado' | 'supervisor';
  activo: boolean;
  fechaCreacion: Date;
  tipo_usuario?: 'planta' | 'visita' | 'temporal' | null;
}

export interface AuthenticatedRequest extends Request {
  usuario?: Usuario;
}

export interface JWTPayload {
  usuarioId: number;
  email: string;
  rol: string;
}
