import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { Pie } from 'react-chartjs-2';
import type { 
  ChartData, 
  ChartOptions
} from 'chart.js';

const NovedadesChart: React.FC = () => {
  const { data: novedades, isLoading, error } = useQuery({
    queryKey: ['novedades-stats'],
    queryFn: dashboardService.getNovedadesStats,
  });

  if (error) {
    console.error('Error en NovedadesChart:', error);
    return (
      <div className="alert alert-danger">
        Error al cargar estadísticas de novedades: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!novedades?.tipos?.length) {
    return (
      <div className="text-center text-muted py-4">
        <i className="icon-bell fs-1 mb-3"></i>
        <p>No hay datos de novedades disponibles</p>
      </div>
    );
  }

  // Colores vibrantes para cada tipo de novedad
  const colors = [
    '#ff6b6b', // Rojo coral
    '#feca57', // Amarillo dorado
    '#48cae4', // Azul cielo
    '#95e1d3', // Verde menta
    '#a8e6cf', // Verde claro
  ];

  const chartData: ChartData<'pie', number[], string> = {
    labels: novedades.tipos,
    datasets: [{
      label: 'Novedades',
      data: novedades.cantidades,
      backgroundColor: colors,
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 15,
      hoverBorderWidth: 4,
    }]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#feca57',
        borderWidth: 2,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutCubic' as const
    },
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  // Calcular el total para mostrar estadísticas adicionales
  const total = novedades.cantidades.reduce((sum: number, count: number) => sum + count, 0);
  const masComun = novedades.tipos[novedades.cantidades.indexOf(Math.max(...novedades.cantidades))];

  return (
    <div className="h-100">
      <div className="card-header bg-gradient-warning text-dark border-0">
        <h5 className="mb-0">
          <i className="icon-bell"></i>
          Distribución de Novedades
        </h5>
      </div>
      <div className="card-body">
        <div style={{ height: '320px', position: 'relative' }}>
          <Pie data={chartData} options={options} />
        </div>
        
        {/* Estadísticas adicionales mejoradas */}
        <div className="mt-4 row g-3">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <div className="stat-icon stat-icon--primary me-2" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <i className="icon-hash text-white" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <div>
                <div className="text-muted small">Total</div>
                <div className="fw-bold">{total}</div>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <div className="stat-icon stat-icon--success me-2" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
                <i className="icon-trending-up text-white" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <div>
                <div className="text-muted small">Más común</div>
                <div className="fw-bold text-truncate" title={masComun}>{masComun}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovedadesChart;
