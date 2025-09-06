import React from 'react';

interface ActivityItem {
  id: string;
  type: 'access' | 'check-in' | 'check-out' | 'visitor' | 'maintenance';
  user: string;
  action: string;
  time: string;
  status: 'success' | 'warning' | 'error';
  location?: string;
}

/**
 * 📋 ACTIVIDAD RECIENTE PREMIUM
 * Lista de actividades del sistema con estilos modernos
 */
const RecentActivityNew: React.FC = () => {
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'access',
      user: 'María González',
      action: 'Acceso autorizado - Puerta Principal',
      time: 'Hace 2 minutos',
      status: 'success',
      location: 'Edificio A'
    },
    {
      id: '2',
      type: 'visitor',
      user: 'Juan Pérez',
      action: 'Registro de visitante',
      time: 'Hace 5 minutos',
      status: 'warning',
      location: 'Recepción'
    },
    {
      id: '3',
      type: 'check-out',
      user: 'Ana Rodríguez',
      action: 'Salida registrada',
      time: 'Hace 8 minutos',
      status: 'success',
      location: 'Estacionamiento'
    },
    {
      id: '4',
      type: 'maintenance',
      user: 'Sistema',
      action: 'Mantenimiento programado - Cámara 03',
      time: 'Hace 15 minutos',
      status: 'warning',
      location: 'Pasillo Norte'
    },
    {
      id: '5',
      type: 'access',
      user: 'Carlos López',
      action: 'Intento de acceso denegado',
      time: 'Hace 22 minutos',
      status: 'error',
      location: 'Área Restringida'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return '🔑';
      case 'check-in': return '📥';
      case 'check-out': return '📤';
      case 'visitor': return '👤';
      case 'maintenance': return '🔧';
      default: return '📄';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        marginBottom: '1rem',
        paddingBottom: '1rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#1f2937', 
          margin: '0 0 0.25rem 0' 
        }}>
          Actividad Reciente
        </h3>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280', 
          margin: 0 
        }}>
          Últimas actividades del sistema de control de acceso
        </p>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {recentActivities.map((activity) => (
          <div 
            key={activity.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid #f3f4f6',
              transition: 'background-color 0.2s ease',
              borderRadius: '8px',
              marginBottom: '0.25rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* Icon */}
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              flexShrink: 0
            }}>
              {getTypeIcon(activity.type)}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 0.25rem 0',
                    lineHeight: '1.25'
                  }}>
                    {activity.user}
                  </p>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#4b5563',
                    margin: 0,
                    lineHeight: '1.25'
                  }}>
                    {activity.action}
                  </p>
                  {activity.location && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      background: '#f3f4f6',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '0.25rem'
                    }}>
                      📍 {activity.location}
                    </span>
                  )}
                </div>

                {/* Status and Time */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(activity.status),
                    marginLeft: 'auto',
                    marginBottom: '0.25rem'
                  }} />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '1rem',
        marginTop: '1rem',
        textAlign: 'center'
      }}>
        <button style={{
          color: '#3b82f6',
          fontSize: '0.875rem',
          fontWeight: '500',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          Ver todas las actividades →
        </button>
      </div>
    </div>
  );
};

export default RecentActivityNew;
