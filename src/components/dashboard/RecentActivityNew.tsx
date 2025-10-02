import React from 'react';
import { useActividadReciente } from '../../hooks/useDashboardData';

// interface ActivityItem {
//   id: string;
//   empleado: string;
//   accion: string;
//   hora: string;
//   departamento: string;
//   tipo: 'entrada' | 'salida';
// }

/**
 * 📋 ACTIVIDAD RECIENTE PREMIUM
 * Lista de actividades del sistema con datos reales
 */
const RecentActivityNew: React.FC = () => {
  const { data: recentActivities = [], isLoading, error } = useActividadReciente();

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '1rem' }}>⏳</div>
        Cargando actividad reciente...
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '1rem' }}>⚠️</div>
        Error al cargar actividad reciente
      </div>
    );
  }

  // Función para obtener el icono según el tipo
  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return '🟢';
      case 'salida':
        return '🔴';
      default:
        return '🔄';
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return '#10b981'; // Verde
      case 'salida':
        return '#f59e0b'; // Amarillo
      default:
        return '#6b7280'; // Gris
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          Actividad Reciente
        </h3>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
        >
          Ver Todo
        </button>
      </div>

      {/* Activity List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            {/* Status Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${getStatusColor(activity.tipo)}`,
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.2rem' }}>
                {getActivityIcon(activity.tipo)}
              </span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {activity.empleado}
                </h4>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  flexShrink: 0,
                  marginLeft: '0.5rem'
                }}>
                  {activity.hora}
                </span>
              </div>
              
              <p style={{
                fontSize: '0.875rem',
                color: '#4b5563',
                margin: '0 0 0.5rem 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {activity.accion}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  backgroundColor: '#e5e7eb',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {activity.departamento}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: getStatusColor(activity.tipo),
                  fontWeight: '500'
                }}>
                  {activity.tipo.charAt(0).toUpperCase() + activity.tipo.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {recentActivities.length === 0 && !isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📝</div>
            <p style={{ margin: 0 }}>No hay actividad reciente disponible</p>
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.875rem',
              color: '#9ca3af'
            }}>
              Los registros aparecerán aquí cuando se generen accesos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityNew;
