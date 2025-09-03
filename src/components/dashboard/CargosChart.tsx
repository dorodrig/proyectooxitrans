import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { Bar } from 'react-chartjs-2';
import type { 
  ChartData, 
  ChartOptions, 
  ScriptableContext,
  ChartArea 
} from 'chart.js';

const CargosChart: React.FC = () => {
  const { data: cargos, isLoading, error } = useQuery({
    queryKey: ['usuarios-por-cargo'],
    queryFn: dashboardService.getUsuariosPorCargo,
  });

  if (error) {
    console.error('Error en CargosChart:', error);
    return (
      <div className="alert alert-danger">
        Error al cargar datos de cargos: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!cargos?.cargos?.length) {
    return (
      <div className="text-center text-muted py-4">
        <i className="icon-bar-chart-2 fs-1 mb-3"></i>
        <p>No hay datos de cargos disponibles</p>
      </div>
    );
  }

  // Gradiente de colores para las barras
  const generateGradient = (ctx: CanvasRenderingContext2D, chartArea: ChartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, '#28a745');
    gradient.addColorStop(1, '#20c997');
    return gradient;
  };

  const chartData: ChartData<'bar', number[], string> = {
    labels: cargos.cargos,
    datasets: [{
      label: 'Cantidad de Empleados',
      data: cargos.cantidades,
      backgroundColor: function(context: ScriptableContext<'bar'>) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return '#28a745';
        return generateGradient(ctx, chartArea);
      },
      borderColor: '#198754',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#198754',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.x} empleado${context.parsed.x !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutCubic' as const
    }
  };

  return (
    <div className="h-100">
      <div className="card-header bg-gradient-success text-white border-0">
        <h5 className="mb-0">
          <i className="icon-briefcase"></i>
          Distribución por Cargos
        </h5>
      </div>
      <div className="card-body">
        <div style={{ height: '350px', position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-3 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="icon-info-circle me-1"></i>
            Total de cargos: {cargos.cargos.length}
          </small>
          <div className="badge bg-success">
            <i className="icon-briefcase me-1"></i>
            {cargos.cantidades.reduce((sum: number, count: number) => sum + count, 0)} empleados
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargosChart;
