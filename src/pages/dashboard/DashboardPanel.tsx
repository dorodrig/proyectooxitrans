

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { Bar, Pie } from 'react-chartjs-2';
import StatsCards from '../../components/dashboard/StatsCards';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Registrar los elementos y escalas necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPanel: React.FC = () => {
  // Consulta de estadísticas de usuarios
  const { data: stats, isLoading: loadingStats, error: errorStats } = useQuery({
    queryKey: ['usuarios-stats'],
    queryFn: dashboardService.getUsuariosStats,
  });

  // Consulta de usuarios por rol
  const { data: porRol, isLoading: loadingPorRol, error: errorPorRol } = useQuery({
    queryKey: ['usuarios-por-rol'],
    queryFn: dashboardService.getUsuariosPorRol,
  });

  // Log de errores para debugging
  if (errorStats) console.error('Error Stats:', errorStats);
  if (errorPorRol) console.error('Error PorRol:', errorPorRol);

  return (
    <div className="dashboard">
      <div className="dashboard__main">
        <h2 className="header-title mb-6">Dashboard de Usuarios</h2>
        {/* Cards de estadísticas */}
        <div className="dashboard__stats">
          <StatsCards />
        </div>
        {/* Gráficos */}
        <div className="dashboard__charts grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Gráfico de barras: Usuarios por rol */}
          <div className="dashboard__stat-card">
            <div className="card-body">
              <h3 className="stat-label mb-4">Usuarios por Rol</h3>
              {errorPorRol ? (
                <div className="alert alert-danger">
                  Error al cargar datos: {errorPorRol.message}
                </div>
              ) : loadingPorRol ? (
                <p>Cargando...</p>
              ) : (
                (porRol?.roles?.length && porRol?.cantidades?.length) ? (
                  <Bar
                    data={{
                      labels: porRol.roles,
                      datasets: [{
                        label: 'Cantidad',
                        data: porRol.cantidades,
                        backgroundColor: '#1976d2',
                      }],
                    }}
                    options={{ responsive: true }}
                  />
                ) : <p>No hay datos disponibles.</p>
              )}
            </div>
          </div>
          {/* Gráfico de torta: Usuarios activos/inactivos */}
          <div className="dashboard__stat-card">
            <div className="card-body">
              <h3 className="stat-label mb-4">Usuarios Activos vs Inactivos</h3>
              {errorStats ? (
                <div className="alert alert-danger">
                  Error al cargar datos: {errorStats.message}
                </div>
              ) : loadingStats ? (
                <p>Cargando...</p>
              ) : (
                (typeof stats?.activos === 'number' && typeof stats?.inactivos === 'number') ? (
                  <Pie
                    data={{
                      labels: ['Activos', 'Inactivos'],
                      datasets: [{
                        data: [stats.activos, stats.inactivos],
                        backgroundColor: ['#43a047', '#e53935'],
                      }],
                    }}
                    options={{ responsive: true }}
                  />
                ) : <p>No hay datos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
