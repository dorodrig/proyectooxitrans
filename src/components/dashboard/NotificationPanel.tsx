import React from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  unread?: boolean;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

/**
 * 🔔 PANEL DE NOTIFICACIONES PREMIUM
 * Sistema de notificaciones en tiempo real para el dashboard
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="notification-panel bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="panel-header p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Notificaciones
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </h3>
          {notifications.some(n => n.unread) && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="notifications-list max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="empty-state p-8 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <h4 className="text-gray-600 font-medium mb-2">No hay notificaciones</h4>
            <p className="text-gray-500 text-sm">Todas las notificaciones aparecerán aquí</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item p-4 border-l-4 ${getTypeColor(notification.type)} 
                ${notification.unread ? 'bg-opacity-80' : 'bg-opacity-40'} 
                border-b border-gray-100 hover:bg-opacity-100 transition-colors cursor-pointer`}
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="notification-icon text-xl">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="notification-content flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                      {notification.unread && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                      )}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${notification.unread ? 'text-gray-700' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="panel-footer p-3 border-t border-gray-200 bg-gray-50">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
