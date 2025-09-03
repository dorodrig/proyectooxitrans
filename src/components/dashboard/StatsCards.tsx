import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

const icons = [
  'icon-pie-chart',
  'icon-shopping-bag',
  'icon-shopping-cart',
  'icon-bar-chart-2',
];

const labels = [
  'Usuarios activos',
  'Usuarios inactivos',
  'Total usuarios',
  'Supervisores',
];

const StatsCards: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['usuarios-stats'],
    queryFn: dashboardService.getUsuariosStats,
  });

  // Mostrar error si hay problemas
  if (error) {
    console.error('Error en StatsCards:', error);
    return (
      <div className="row">
        <div className="col-12">
          <div className="alert alert-danger">
            Error al cargar estadísticas: {error.message}
          </div>
        </div>
      </div>
    );
  }

  // Simulación de datos si el backend aún no responde con todos los valores
  const values = [
    stats?.activos || 0,
    stats?.inactivos || 0,
    stats?.total || 0,
    stats?.supervisores || 0,
  ];

  return (
    <div className="row">
      {labels.map((label, idx) => (
        <div className="col-xxl-3 col-sm-6 col-12" key={label}>
          <div className="card mb-4 border border-primary bg-primary-subtle">
            <div className="card-body text-primary">
              <div className="d-flex justify-content-center text-center">
                <div className="position-absolute top-0 start-0 p-3">
                  <i className={`${icons[idx]} fs-1 lh-1`}></i>
                </div>
                <div className="py-3">
                  <h1>{isLoading ? '...' : values[idx]}</h1>
                  <h6>{label}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
