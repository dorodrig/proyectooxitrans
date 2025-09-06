import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: string;
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

/**
 * 📊 STAT CARD PREMIUM
 * Tarjeta de estadística con diseño mejorado
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  color = 'primary',
  className = ''
}) => {
  const colorClasses = {
    primary: 'text-blue-600 bg-blue-100',
    success: 'text-green-600 bg-green-100',
    danger: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-cyan-600 bg-cyan-100'
  };

  return (
    <div 
      className={`${className}`}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        marginBottom: '1rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#6b7280', 
            margin: '0 0 0.5rem 0' 
          }}>
            {title}
          </p>
          <h3 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#1f2937', 
            margin: '0.5rem 0' 
          }}>
            {value}
          </h3>
          {change && (
            <p style={{ 
              fontSize: '0.75rem', 
              fontWeight: '500',
              color: changeType === 'positive' ? '#10b981' : '#ef4444',
              margin: '0'
            }}>
              {changeType === 'positive' ? '↗️' : '↘️'} {change}
            </p>
          )}
        </div>
        <div 
          className={colorClasses[color]}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className={`${icon}`} style={{ fontSize: '1.5rem' }}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
