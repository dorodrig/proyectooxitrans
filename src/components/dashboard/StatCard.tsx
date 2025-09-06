import React from 'react';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  trend: 'up' | 'down';
  color: 'primary' | 'danger' | 'info' | 'success';
  className?: string;
}

/**
 * 📊 TARJETA DE ESTADÍSTICAS PREMIUM
 * Componente basado en el diseño del dashboard Zayn
 */
const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  value, 
  label, 
  trend, 
  color,
  className = '' 
}) => {
  const colorClasses = {
    primary: 'border-blue-500 bg-blue-50 text-blue-600',
    danger: 'border-red-500 bg-red-50 text-red-600',
    info: 'border-cyan-500 bg-cyan-50 text-cyan-600',
    success: 'border-green-500 bg-green-50 text-green-600'
  };

  const trendIcon = trend === 'up' ? 'icon-trending-up' : 'icon-trending-down';
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`card mb-4 border-2 ${colorClasses[color]} ${className}`}>
      <div className="card-body">
        <div className="d-flex align-items-center text-center">
          <div className="p-3">
            <i className={`${icon} text-4xl leading-none`}></i>
          </div>
          <div className="py-3">
            <h1 className="text-3xl font-bold mb-1">{value}</h1>
            <h6 className="text-sm font-medium opacity-75">{label}</h6>
          </div>
          <span className={`badge border position-absolute top-0 right-0 m-3 ${colorClasses[color]}`}>
            <i className={`${trendIcon} ${trendColor}`}></i>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
