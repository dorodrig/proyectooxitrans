import { create } from 'zustand';

export type TipoNotificacion = 'success' | 'warning' | 'error' | 'info';

export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: TipoNotificacion;
  duracion: number; // en milisegundos
  timestamp: number;
}

interface NotificacionesState {
  notificaciones: Notificacion[];
  mostrarNotificacion: (mensaje: string, tipo: TipoNotificacion, duracion?: number) => void;
  eliminarNotificacion: (id: string) => void;
  limpiarNotificaciones: () => void;
}

// Store para manejar las notificaciones
export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  notificaciones: [],
  mostrarNotificacion: (mensaje, tipo, duracion = 5000) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const nuevaNotificacion: Notificacion = {
      id,
      mensaje,
      tipo,
      duracion,
      timestamp: Date.now()
    };
    
    set((state) => ({
      notificaciones: [...state.notificaciones, nuevaNotificacion]
    }));
    
    // Eliminar automáticamente después del tiempo de duración
    if (duracion > 0) {
      setTimeout(() => {
        set((state) => ({
          notificaciones: state.notificaciones.filter(n => n.id !== id)
        }));
      }, duracion);
    }
    
    return id;
  },
  eliminarNotificacion: (id) => {
    set((state) => ({
      notificaciones: state.notificaciones.filter(n => n.id !== id)
    }));
  },
  limpiarNotificaciones: () => {
    set({ notificaciones: [] });
  }
}));

// Este es un servicio, el componente se creará por separado para evitar errores

// Función directa para mostrar notificaciones desde cualquier lugar
export const mostrarNotificacion = (
  mensaje: string, 
  tipo: TipoNotificacion = 'info', 
  duracion: number = 5000
) => {
  return useNotificacionesStore.getState().mostrarNotificacion(mensaje, tipo, duracion);
};

export const notificacionesService = {
  mostrar: mostrarNotificacion,
  eliminar: (id: string) => useNotificacionesStore.getState().eliminarNotificacion(id),
  limpiarTodas: () => useNotificacionesStore.getState().limpiarNotificaciones()
};

// Añadir estilos para animaciones
const agregarEstilos = () => {
  if (document.getElementById('notificaciones-estilos')) return;
  
  const estilos = document.createElement('style');
  estilos.id = 'notificaciones-estilos';
  estilos.innerHTML = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease-out forwards;
    }
  `;
  
  document.head.appendChild(estilos);
};

// Agregar estilos automáticamente cuando se importa el servicio
agregarEstilos();

export default notificacionesService;