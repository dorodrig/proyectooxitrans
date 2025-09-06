import React from 'react';

interface MetricItemProps {
  icon: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  changePercent: string;
}

/**
 * 📊 ITEM DE MÉTRICA PREMIUM
 * Componente para mostrar métricas detalladas en el overview
 */
const MetricItem: React.FC<MetricItemProps> = ({
  icon,
  label,
  value,
  change,
  trend,
  changePercent
}) => {
  const trendIcon = trend === 'up' ? 'icon-arrow-up-right' : 'icon-arrow-down-left';
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <li className="list-group-item border-0 p-0">
      <div className="d-flex align-items-center gap-3">
        <div className="icons-box bg-blue-50 rounded-lg p-3">
          <i className={`${icon} text-blue-600 text-xl`}></i>
        </div>
        <div className="d-flex justify-content-between w-100">
          <div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <h5 className="text-lg font-semibold text-gray-800 mb-0">{value}</h5>
          </div>
          <div className="text-right">
            <h5 className="text-lg font-semibold mb-1">{change}</h5>
            <p className={`text-sm font-medium mb-0 ${trendColor} flex items-center justify-end gap-1`}>
              <i className={trendIcon}></i>
              {changePercent}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default MetricItem;
