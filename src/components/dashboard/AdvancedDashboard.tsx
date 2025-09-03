import React from 'react';
import DepartamentosChart from './DepartamentosChart';
import CargosChart from './CargosChart';
import NovedadesChart from './NovedadesChart';

const AdvancedDashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__main">
        {/* Header Profesional */}
        <div className="dashboard-header">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="header-content">
                  <h2>Dashboard Avanzado OXITRANS</h2>
                  <p>
                    <i className="icon-bar-chart me-2"></i>
                    Análisis detallado del sistema de control de acceso empresarial
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="header-actions justify-content-end d-flex">
                  <button className="btn btn-outline-light">
                    <i className="icon-download me-1"></i>
                    Exportar
                  </button>
                  <button className="btn btn-light">
                    <i className="icon-refresh-cw me-1"></i>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          {/* Stats Cards Premium */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card stats-card--primary">
                <div className="stat-icon stat-icon--primary">
                  <i className="icon-users"></i>
                </div>
                <div className="stat-value">12</div>
                <div className="stat-label">Total Empleados</div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card stats-card--success">
                <div className="stat-icon stat-icon--success">
                  <i className="icon-map-pin"></i>
                </div>
                <div className="stat-value">8</div>
                <div className="stat-label">Regionales Activas</div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card stats-card--warning">
                <div className="stat-icon stat-icon--warning">
                  <i className="icon-briefcase"></i>
                </div>
                <div className="stat-value">8</div>
                <div className="stat-label">Tipos de Cargo</div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card stats-card--info">
                <div className="stat-icon stat-icon--info">
                  <i className="icon-bell"></i>
                </div>
                <div className="stat-value">3</div>
                <div className="stat-label">Tipos de Novedad</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row mb-4">
            {/* Departamentos Chart */}
            <div className="col-lg-6 mb-4">
              <div className="chart-card">
                <DepartamentosChart />
              </div>
            </div>
            
            {/* Cargos Chart */}
            <div className="col-lg-6 mb-4">
              <div className="chart-card">
                <CargosChart />
              </div>
            </div>
          </div>

          {/* Novedades Chart Row */}
          <div className="row mb-4">
            <div className="col-lg-8 mb-4">
              <div className="chart-card">
                <NovedadesChart />
              </div>
            </div>
            
            {/* Advanced Activity Panel */}
            <div className="col-lg-4 mb-4">
              <div className="chart-card">
                <div className="card-header bg-gradient-dark text-white border-0">
                  <h5 className="mb-0">
                    <i className="icon-activity"></i>
                    Actividad del Sistema
                  </h5>
                </div>
                <div className="card-body">
                  <div className="activity-panel">
                    <div className="activity-item">
                      <div className="activity-indicator bg-success"></div>
                      <div className="activity-content">
                        <div className="fw-medium">Sistema Operativo</div>
                        <div className="text-muted">Todos los servicios funcionando correctamente</div>
                      </div>
                    </div>
                    
                    <div className="activity-item">
                      <div className="activity-indicator bg-primary"></div>
                      <div className="activity-content">
                        <div className="fw-medium">Dashboard Actualizado</div>
                        <div className="text-muted">Gráficos profesionales implementados</div>
                      </div>
                    </div>
                    
                    <div className="activity-item">
                      <div className="activity-indicator bg-warning"></div>
                      <div className="activity-content">
                        <div className="fw-medium">Análisis Completado</div>
                        <div className="text-muted">Estadísticas de empleados procesadas</div>
                      </div>
                    </div>
                    
                    <div className="activity-item">
                      <div className="activity-indicator bg-info"></div>
                      <div className="activity-content">
                        <div className="fw-medium">Optimización Activa</div>
                        <div className="text-muted">Rendimiento del sistema monitoreado</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Premium */}
          <div className="row">
            <div className="col-12">
              <div className="chart-card">
                <div className="card-header bg-gradient-secondary text-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="icon-trending-up"></i>
                      Métricas de Rendimiento Empresarial
                    </h5>
                    <small className="opacity-75">
                      <i className="icon-clock me-1"></i>
                      Actualizado hace 2 minutos
                    </small>
                  </div>
                </div>
                <div className="card-body">
                  <div className="performance-metrics">
                    <div className="row g-4">
                      <div className="col-lg-3 col-md-6">
                        <div className="metric-item">
                          <div className="metric-value text-success">99.8%</div>
                          <div className="metric-label">Tiempo Activo</div>
                          <div className="progress">
                            <div className="progress-bar bg-success" style={{ width: '99.8%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-lg-3 col-md-6">
                        <div className="metric-item">
                          <div className="metric-value text-primary">1.2s</div>
                          <div className="metric-label">Tiempo de Respuesta</div>
                          <div className="progress">
                            <div className="progress-bar bg-primary" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-lg-3 col-md-6">
                        <div className="metric-item">
                          <div className="metric-value text-warning">95%</div>
                          <div className="metric-label">Precisión de Datos</div>
                          <div className="progress">
                            <div className="progress-bar bg-warning" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-lg-3 col-md-6">
                        <div className="metric-item">
                          <div className="metric-value text-info">24/7</div>
                          <div className="metric-label">Monitoreo Continuo</div>
                          <div className="progress">
                            <div className="progress-bar bg-info" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
