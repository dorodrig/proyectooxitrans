import React from 'react';

interface SalesMetricProps {
  category: string;
  amount: string;
  percentage: number;
  color: string;
}

/**
 * 📊 MÉTRICA POR ÁREA PREMIUM
 * Componente para mostrar métricas por área con barras de progreso
 */
const SalesMetricNew: React.FC<SalesMetricProps> = ({ 
  category, 
  amount, 
  percentage, 
  color 
}) => {
  const colorMap: { [key: string]: string } = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
    'bg-yellow-500': '#f59e0b',
    'bg-red-500': '#ef4444',
    'bg-purple-500': '#8b5cf6'
  };

  return (
    <div style={{ 
      marginBottom: '1rem', 
      padding: '0.75rem 0', 
      borderBottom: '1px solid #f3f4f6' 
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '0.5rem' 
      }}>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: '#374151' 
        }}>
          {category}
        </span>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '700', 
          color: '#1f2937' 
        }}>
          {amount}
        </span>
      </div>
      <div style={{
        height: '6px',
        borderRadius: '3px',
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
        marginBottom: '0.25rem'
      }}>
        <div 
          style={{ 
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: colorMap[color] || '#3b82f6',
            transition: 'width 0.5s ease',
            borderRadius: '3px'
          }}
        />
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280' 
        }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default SalesMetricNew;
