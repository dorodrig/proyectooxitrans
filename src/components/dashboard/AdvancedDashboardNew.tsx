import React, { useEffect, useState } from 'react';
import DepartamentosChart from './DepartamentosChart';
import CargosChart from './CargosChart';
import NovedadesChart from './NovedadesChart';

const AdvancedDashboard: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simular carga y activar animaciones
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-premium">
      {/* 🌟 Header Premium con Efectos */}
      <div className={`dashboard-header ${isLoaded ? 'animate-fade-in-down' : ''}`}>
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="text-gradient text-shadow-glow">Dashboard Ejecutivo OXITRANS</h1>
            <p className="header-subtitle">Sistema de Control de Acceso - Vista Gerencial</p>
          </div>
          <div className="header-stats">
            <div className="stat-indicator status-indicator status-success">
              <span className="stat-value">98.5%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-indicator status-indicator status-info">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Monitoreo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Métricas Premium con Animaciones */}
      <div className="metrics-grid">
        <div className={`metric-card card-premium hover-lift ${isLoaded ? 'animate-fade-in-up animate-delay-100' : ''}`}>
          <div className="metric-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-content">
            <h3 className="metric-value">1,247</h3>
            <p className="metric-label">Empleados Activos</p>
            <span className="metric-trend trend-up">+12% este mes</span>
          </div>
          <div className="metric-sparkline"></div>
        </div>

        <div className={`metric-card card-premium hover-lift ${isLoaded ? 'animate-fade-in-up animate-delay-200' : ''}`}>
          <div className="metric-icon">
            <i className="fas fa-door-open"></i>
          </div>
          <div className="metric-content">
            <h3 className="metric-value">98.7%</h3>
            <p className="metric-label">Accesos Exitosos</p>
            <span className="metric-trend trend-up">+0.3% hoy</span>
          </div>
          <div className="metric-sparkline"></div>
        </div>

        <div className={`metric-card card-premium hover-lift ${isLoaded ? 'animate-fade-in-up animate-delay-300' : ''}`}>
          <div className="metric-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="metric-content">
            <h3 className="metric-value">100%</h3>
            <p className="metric-label">Seguridad</p>
            <span className="metric-trend trend-stable">Sin incidentes</span>
          </div>
          <div className="metric-sparkline"></div>
        </div>

        <div className={`metric-card card-premium hover-lift ${isLoaded ? 'animate-fade-in-up animate-delay-400' : ''}`}>
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3 className="metric-value">94.2%</h3>
            <p className="metric-label">Productividad</p>
            <span className="metric-trend trend-up">+2.1% esta semana</span>
          </div>
          <div className="metric-sparkline"></div>
        </div>
      </div>

      {/* 📊 Gráficos Premium con Efectos Especiales */}
      <div className="charts-grid">
        <div className={`chart-section ${isLoaded ? 'animate-fade-in-left animate-delay-500' : ''}`}>
          <div className="chart-card card-premium hover-shimmer">
            <div className="chart-header">
              <h3 className="chart-title">
                <i className="fas fa-building mr-2"></i>
                Distribución por Departamentos
              </h3>
              <div className="chart-actions">
                <button className="btn-chart-action hover-glow">
                  <i className="fas fa-expand"></i>
                </button>
                <button className="btn-chart-action hover-glow">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div className="chart-container">
              <DepartamentosChart />
            </div>
          </div>
        </div>

        <div className={`chart-section ${isLoaded ? 'animate-fade-in-up animate-delay-600' : ''}`}>
          <div className="chart-card card-premium hover-shimmer">
            <div className="chart-header">
              <h3 className="chart-title">
                <i className="fas fa-user-tie mr-2"></i>
                Distribución por Cargos
              </h3>
              <div className="chart-actions">
                <button className="btn-chart-action hover-glow">
                  <i className="fas fa-expand"></i>
                </button>
                <button className="btn-chart-action hover-glow">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div className="chart-container">
              <CargosChart />
            </div>
          </div>
        </div>

        <div className={`chart-section ${isLoaded ? 'animate-fade-in-right animate-delay-700' : ''}`}>
          <div className="chart-card card-premium hover-shimmer">
            <div className="chart-header">
              <h3 className="chart-title">
                <i className="fas fa-bell mr-2"></i>
                Novedades Recientes
              </h3>
              <div className="chart-actions">
                <button className="btn-chart-action hover-glow">
                  <i className="fas fa-expand"></i>
                </button>
                <button className="btn-chart-action hover-glow">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div className="chart-container">
              <NovedadesChart />
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Panel de Control Premium */}
      <div className={`control-panel ${isLoaded ? 'animate-fade-in-up animate-delay-800' : ''}`}>
        <div className="panel-header">
          <h3 className="panel-title">Centro de Control</h3>
          <div className="panel-status">
            <span className="status-indicator status-success"></span>
            <span>Todos los sistemas operativos</span>
          </div>
        </div>
        
        <div className="control-grid">
          <button className="control-btn btn-premium hover-lift">
            <i className="fas fa-sync-alt"></i>
            <span>Sincronizar</span>
          </button>
          
          <button className="control-btn btn-premium hover-lift">
            <i className="fas fa-file-export"></i>
            <span>Exportar</span>
          </button>
          
          <button className="control-btn btn-premium hover-lift">
            <i className="fas fa-cog"></i>
            <span>Configurar</span>
          </button>
          
          <button className="control-btn btn-premium hover-lift">
            <i className="fas fa-chart-bar"></i>
            <span>Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
