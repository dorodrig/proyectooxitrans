import React from 'react';

interface OverviewCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 📈 TARJETA DE OVERVIEW PREMIUM
 * Contenedor para gráficos y estadísticas detalladas
 */
const OverviewCard: React.FC<OverviewCardProps> = ({ 
  title, 
  subtitle,
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={className}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    >
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
          {title}
        </h3>
        {subtitle && (
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280', 
            margin: 0 
          }}>
            {subtitle}
          </p>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default OverviewCard;
