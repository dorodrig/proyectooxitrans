import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  LogOut
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { usuario, logout } = useAuthStore();

  const estadisticas = {
    totalEmpleados: 156,
    empleadosPresentes: 89,
    registrosHoy: 234,
    tardanzasHoy: 12,
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header">
        <div className="container">
          <div className="header-content">
            <h1 className="header-title">
              Control de Acceso - OXITRANS S.A.S
            </h1>
            <div className="header-actions">
              <span className="user-info">
                Bienvenido, {usuario?.nombre} {usuario?.apellido}
              </span>
              <button onClick={logout} className="logout-btn">
                <LogOut />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="dashboard__main">
        
        {/* Stats */}
        <div className="dashboard__stats">
          <div className="dashboard__stat-card">
            <div className="stat-content">
              <div className="stat-icon stat-icon--users">
                <Users />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Empleados</div>
                <div className="stat-value">{estadisticas.totalEmpleados}</div>
              </div>
            </div>
          </div>

          <div className="dashboard__stat-card">
            <div className="stat-content">
              <div className="stat-icon stat-icon--present">
                <CheckCircle2 />
              </div>
              <div className="stat-info">
                <div className="stat-label">Empleados Presentes</div>
                <div className="stat-value">{estadisticas.empleadosPresentes}</div>
              </div>
            </div>
          </div>

          <div className="dashboard__stat-card">
            <div className="stat-content">
              <div className="stat-icon stat-icon--records">
                <Clock />
              </div>
              <div className="stat-info">
                <div className="stat-label">Registros Hoy</div>
                <div className="stat-value">{estadisticas.registrosHoy}</div>
              </div>
            </div>
          </div>

          <div className="dashboard__stat-card">
            <div className="stat-content">
              <div className="stat-icon stat-icon--late">
                <AlertTriangle />
              </div>
              <div className="stat-info">
                <div className="stat-label">Tardanzas Hoy</div>
                <div className="stat-value">{estadisticas.tardanzasHoy}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard__quick-actions">
          <h3 className="section-title">Acciones Rápidas</h3>
          <div className="actions-grid">
            <button className="action-card">
              <Users />
              <span className="action-label">Gestionar Empleados</span>
            </button>

            <button className="action-card">
              <Calendar />
              <span className="action-label">Ver Reportes</span>
            </button>

            <button className="action-card">
              <TrendingUp />
              <span className="action-label">Analíticas</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard__recent-activity">
          <h3 className="section-title">Actividad Reciente</h3>
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-icon activity-icon--success">
                <CheckCircle2 />
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  Juan Pérez registró <span className="highlight">entrada</span>
                </p>
                <time className="activity-time">hace 5 min</time>
              </div>
            </li>
            
            <li className="activity-item">
              <div className="activity-icon activity-icon--info">
                <Clock />
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  María González registró <span className="highlight">salida</span>
                </p>
                <time className="activity-time">hace 15 min</time>
              </div>
            </li>

            <li className="activity-item">
              <div className="activity-icon activity-icon--error">
                <AlertTriangle />
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  Carlos Silva llegó <span className="highlight">tarde</span>
                </p>
                <time className="activity-time">hace 1 hora</time>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};
