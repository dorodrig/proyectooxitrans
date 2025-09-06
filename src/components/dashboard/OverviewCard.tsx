import React const OverviewCard: React.FC<OverviewCardProps> = ({ 
  title, 
  subtitle,
  children, 
  className = '' 
}) => {
  return (
    <div className={`overview-card ${className}`}>
      <div className="card-header border-b border-gray-200 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-0">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};
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
  children, 
  className = '' 
}) => {
  return (
    <div className={`card mb-4 ${className}`}>
      <div className="card-header bg-white border-b">
        <h5 className="card-title text-lg font-semibold text-gray-800 mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default OverviewCard;
