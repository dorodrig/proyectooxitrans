import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { Doughnut } from 'react-chartjs-2';

const DepartamentosChart: React.FC = () => {
  const { data: departamentos, isLoading, error } = useQuery({
    queryKey: ['usuarios-por-departamento'],
    queryFn: dashboardService.getUsuariosPorDepartamento,
  });

  if (error) {
    console.error('Error en DepartamentosChart:', error);
    return (
      <div className="alert alert-danger">
        Error al cargar datos de departamentos: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!departamentos?.departamentos?.length) {
    return (
      <div className="text-center text-muted py-4">
        <i className="icon-pie-chart fs-1 mb-3"></i>
        <p>No hay datos de departamentos disponibles</p>
      </div>
    );
  }

  // Colores elegantes para el gráfico de dona
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  const chartData = {
    labels: departamentos.departamentos,
    datasets: [{
      data: departamentos.cantidades,
      backgroundColor: colors.slice(0, departamentos.departamentos.length),
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        callbacks: {
          label: function(context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  return (
    <div className="h-100">
      <div className="card-header bg-gradient-primary text-white border-0">
        <h5 className="mb-0">
          <i className="icon-pie-chart"></i>
          Distribución por Departamentos
        </h5>
      </div>
      <div className="card-body">
        <div style={{ height: '350px', position: 'relative' }}>
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="mt-3 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="icon-info-circle me-1"></i>
            Total de departamentos: {departamentos.departamentos.length}
          </small>
          <div className="badge bg-primary">
            <i className="icon-users me-1"></i>
            {departamentos.cantidades.reduce((sum: number, count: number) => sum + count, 0)} empleados
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartamentosChart;
