// ====================================
// 🔔 SISTEMA DE NOTIFICACIONES TOAST
// Notificaciones no intrusivas para feedback
// ====================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje?: string;
  duracion?: number;
  accion?: {
    texto: string;
    callback: () => void;
  };
  timestamp: number;
}

interface NotificationContextType {
  toasts: Toast[];
  mostrarToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  mostrarExito: (titulo: string, mensaje?: string) => void;
  mostrarError: (titulo: string, mensaje?: string) => void;
  mostrarAdvertencia: (titulo: string, mensaje?: string) => void;
  mostrarInfo: (titulo: string, mensaje?: string) => void;
  ocultarToast: (id: string) => void;
  limpiarTodos: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrarToast = useCallback((toastData: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      ...toastData,
      id,
      timestamp: Date.now(),
      duracion: toastData.duracion || 5000
    };

    setToasts(prev => {
      // Limitar a máximo 5 toasts visibles
      const nuevosToasts = [...prev, toast];
      return nuevosToasts.slice(-5);
    });

    // Auto-ocultar después de la duración especificada
    if (toast.duracion && toast.duracion > 0) {
      setTimeout(() => {
        ocultarToast(id);
      }, toast.duracion);
    }
  }, []);

  const mostrarExito = useCallback((titulo: string, mensaje?: string) => {
    mostrarToast({
      tipo: 'success',
      titulo,
      mensaje,
      duracion: 4000
    });
  }, [mostrarToast]);

  const mostrarError = useCallback((titulo: string, mensaje?: string) => {
    mostrarToast({
      tipo: 'error',
      titulo,
      mensaje,
      duracion: 7000
    });
  }, [mostrarToast]);

  const mostrarAdvertencia = useCallback((titulo: string, mensaje?: string) => {
    mostrarToast({
      tipo: 'warning',
      titulo,
      mensaje,
      duracion: 6000
    });
  }, [mostrarToast]);

  const mostrarInfo = useCallback((titulo: string, mensaje?: string) => {
    mostrarToast({
      tipo: 'info',
      titulo,
      mensaje,
      duracion: 5000
    });
  }, [mostrarToast]);

  const ocultarToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const limpiarTodos = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        mostrarToast,
        mostrarExito,
        mostrarError,
        mostrarAdvertencia,
        mostrarInfo,
        ocultarToast,
        limpiarTodos
      }}
    >
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, ocultarToast } = useNotifications();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={() => ocultarToast(toast.id)}
        />
      ))}
    </div>
  );
};

interface ToastNotificationProps {
  toast: Toast;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Duración de la animación de salida
  };

  const getToastIcon = () => {
    switch (toast.tipo) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getProgressColor = () => {
    switch (toast.tipo) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      className={`toast toast-${toast.tipo} ${isVisible ? 'toast-visible' : ''} ${isExiting ? 'toast-exiting' : ''}`}
      onClick={toast.accion ? toast.accion.callback : undefined}
      style={{ cursor: toast.accion ? 'pointer' : 'default' }}
    >
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon()}
        </div>
        
        <div className="toast-body">
          <div className="toast-titulo">
            {toast.titulo}
          </div>
          {toast.mensaje && (
            <div className="toast-mensaje">
              {toast.mensaje}
            </div>
          )}
          {toast.accion && (
            <button className="toast-action-btn">
              {toast.accion.texto}
            </button>
          )}
        </div>
      </div>

      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>

      {toast.duracion && toast.duracion > 0 && (
        <div
          className="toast-progress"
          style={{
            backgroundColor: getProgressColor(),
            animation: `toast-progress ${toast.duracion}ms linear`
          }}
        />
      )}
    </div>
  );
};

export default NotificationProvider;