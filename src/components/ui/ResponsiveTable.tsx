import React, { type ReactNode } from 'react';
import '../../styles/components/_tables.scss';

interface ResponsiveTableProps {
  children: ReactNode;
  variant?: 'default' | 'card' | 'expandable';
  loading?: boolean;
  className?: string;
  searchable?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

/**
 * 📊 TABLA RESPONSIVE WRAPPER
 * Componente que envuelve cualquier tabla para hacerla responsive
 */
const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  variant = 'default',
  loading = false,
  className = '',
  searchable = false,
  stats
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const getWrapperClass = () => {
    const baseClass = 'table-responsive-oxitrans';
    const variantClass = variant === 'card' ? 'table-card-responsive' : '';
    const expandableClass = variant === 'expandable' ? 'table-expandable' : '';
    const loadingClass = loading ? 'table-loading' : '';
    
    return `${baseClass} ${variantClass} ${expandableClass} ${loadingClass} ${className}`.trim();
  };

  return (
    <div className="responsive-table-container">
      {/* Estadísticas opcionales */}
      {stats && stats.length > 0 && (
        <div className="table-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <span className="stat-number">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Búsqueda opcional */}
      {searchable && (
        <div className="table-search-container">
          <div className="search-input">
            <input
              type="text"
              placeholder="Buscar en la tabla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      )}

      {/* Tabla responsive */}
      <div className={getWrapperClass()}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveTable;