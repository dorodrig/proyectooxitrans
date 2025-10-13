import React from 'react';
import { useNotificacionesStore } from '../../services/notificacionesService';

/**
 * Componente para mostrar notificaciones en la interfaz
 * Se debe colocar este componente en el layout principal de la aplicación
 */
export const NotificacionesContainer: React.FC = () => {
  const { notificaciones, eliminarNotificacion } = useNotificacionesStore();
  
  if (notificaciones.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notificaciones.map((notif: any) => (
        <div 
          key={notif.id}
          className={`
            rounded-lg p-3 shadow-lg flex justify-between items-center
            animate-fade-in-up
            ${notif.tipo === 'success' ? 'bg-green-500 text-white' : ''}
            ${notif.tipo === 'warning' ? 'bg-yellow-500 text-white' : ''}
            ${notif.tipo === 'error' ? 'bg-red-500 text-white' : ''}
            ${notif.tipo === 'info' ? 'bg-blue-500 text-white' : ''}
          `}
        >
          <span>{notif.mensaje}</span>
          <button 
            onClick={() => eliminarNotificacion(notif.id)}
            className="ml-3 text-white hover:text-gray-200"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificacionesContainer;