import React from 'react';

interface SalesMetricProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
}

/**
 * 💰 MÉTRICA DE VENTAS PREMIUM
 * Componente para mostrar métricas de ventas con tendencias
 */
const SalesMetric: React.FC<SalesMetricProps> = ({ title, value, trend }) => {
  const trendIcon = trend === 'up' ? 'icon-trending-up' : 'icon-trending-down';
  const trendColor = trend === 'up' ? 'text-blue-600' : 'text-red-600';

  return (
    <li className="list-group-item border-0 p-3">
      <div className="d-flex align-items-center">
        <div className="me-3">
          <i className="icon-play-arrow text-blue-600"></i>
        </div>
        <div>
          <h4 className="mb-1 font-bold text-xl text-gray-800 flex items-center gap-2">
            {value}
            <i className={`${trendIcon} text-lg ${trendColor}`}></i>
          </h4>
          <h6 className="mb-0 text-sm text-gray-500">{title}</h6>
        </div>
      </div>
    </li>
  );
};

export default SalesMetric;
