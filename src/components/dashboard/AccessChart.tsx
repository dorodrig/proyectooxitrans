import React from 'react';
import { useAccesosPorHora } from '../../hooks/useDashboardData';

/**
 * 📊 GRÁFICO DE ACCESOS POR HORA
 * Visualización de patrones de acceso durante el día
 */
const AccessChart: React.FC = () => {
  const { data: hourlyData = [], isLoading, error } = useAccesosPorHora();

  console.log('📊 [AccessChart] Datos del gráfico:', { hourlyData, isLoading, error });

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        padding: '2rem', 
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '1rem' }}>⏳</div>
        Cargando datos de acceso...
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        padding: '2rem', 
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '1rem' }}>⚠️</div>
        Error al cargar datos de acceso
      </div>
    );
  }

  const maxAccesses = Math.max(...hourlyData.map(d => d.accesses), 1); // Evitar división por 0

  return (
    <div style={{ width: '100%' }}>
      {/* Chart Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Accesos por Hora
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6'
              }} />
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Hoy
              </span>
            </div>
          </div>
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: 0
        }}>
          Patrón de accesos durante las últimas 24 horas
        </p>
      </div>

      {/* Chart Area */}
      <div style={{
        height: '200px',
        position: 'relative',
        padding: '0 1rem 2rem 3rem' // Añadido más padding izquierdo
      }}>
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: 0,
          width: '2.5rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'right',
          paddingRight: '0.5rem'
        }}>
          <span>{maxAccesses}</span>
          <span>{Math.floor(maxAccesses * 0.75)}</span>
          <span>{Math.floor(maxAccesses * 0.5)}</span>
          <span>{Math.floor(maxAccesses * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart bars */}
        <div style={{
          display: 'flex',
          alignItems: 'end',
          height: '100%',
          gap: '0.5rem',
          paddingLeft: '3rem' // Ajustado para dar espacio a los labels
        }}>
          {hourlyData.map((data) => {
            const heightPercentage = (data.accesses / maxAccesses) * 100;
            
            return (
              <div
                key={data.hour}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  cursor: 'pointer'
                }}
              >
                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px 4px 0 0',
                    height: `${heightPercentage}%`,
                    minHeight: '2px',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'scaleY(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'scaleY(1)';
                  }}
                  title={`${data.label}: ${data.accesses} accesos`}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          marginTop: '0.5rem',
          paddingLeft: '3rem',
          paddingRight: '1rem'
        }}>
          {hourlyData.map((data, index) => (
            <div
              key={data.hour}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}
            >
              {index % 2 === 0 ? data.label : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Chart Summary */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.25rem'
          }}>
            {hourlyData.reduce((sum, d) => sum + d.accesses, 0)}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Total Accesos
          </div>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.25rem'
          }}>
            {Math.max(...hourlyData.map(d => d.accesses))}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Pico Máximo
          </div>
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.25rem'
          }}>
            {Math.round(hourlyData.reduce((sum, d) => sum + d.accesses, 0) / hourlyData.length)}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Promedio/Hora
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessChart;
