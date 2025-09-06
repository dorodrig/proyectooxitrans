
import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import StatCardNew from '../components/dashboard/StatCardNew';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import SalesMetricNew from '../components/dashboard/SalesMetricNew';
import RecentActivityNew from '../components/dashboard/RecentActivityNew';
import AccessChart from '../components/dashboard/AccessChart';
import { useEstadisticasAcceso, useEmpleadosPresentes } from '../hooks/useDashboardData';

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hooks para datos reales
  const { data: estadisticas, isLoading: loadingStats } = useEstadisticasAcceso();
  const { data: empleadosPresentes, isLoading: loadingPresentes } = useEmpleadosPresentes();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <SidebarNew isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content con margen para el sidebar */}
      <div style={{ 
        marginLeft: '16rem', // Espacio para sidebar fijo
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0 
      }}>
        {/* Header */}
        <HeaderNew onToggleSidebar={toggleSidebar} />
          
          {/* Dashboard Content */}
          <div style={{ 
            padding: '1.5rem',
            minHeight: 'calc(100vh - 70px)',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ width: '100%', maxWidth: 'none' }}>
              {/* Dashboard Title */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontSize: '1.875rem', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  margin: '0 0 0.5rem 0'
                }}>
                  Dashboard OXITRANS
                </h1>
                <p style={{ 
                  color: '#6b7280', 
                  margin: 0 
                }}>
                  Sistema de Control de Acceso - Monitoreo en Tiempo Real
                </p>
              </div>

            {/* Stats Cards */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}
            >
              <StatCardNew
                title="Accesos Hoy"
                value={loadingStats ? "..." : (estadisticas?.registrosHoy || 0)}
                change="+12.5%"
                changeType="positive"
                icon="🔑"
                color="primary"
              />
              <StatCardNew
                title="Personal Activo"
                value={loadingStats ? "..." : (estadisticas?.empleadosActivos || 0)}
                change="-2.1%"
                changeType="negative"
                icon="👥"
                color="success"
              />
              <StatCardNew
                title="Presentes Ahora"
                value={loadingPresentes ? "..." : (empleadosPresentes?.length || 0)}
                change="+18.2%"
                changeType="positive"
                icon="🏢"
                color="info"
              />
              <StatCardNew
                title="Tardanzas Hoy"
                value={loadingStats ? "..." : (estadisticas?.tardanzasHoy || 0)}
                change="-25.0%"
                changeType="negative"
                icon="⚠️"
                color="danger"
              />
            </div>

            {/* Main Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Chart Section */}
              <OverviewCardNew
                title="Patrón de Accesos"
                subtitle="Análisis de tráfico por horas del día"
              >
                <AccessChart />
              </OverviewCardNew>

              {/* Quick Stats */}
              <OverviewCardNew
                title="Resumen por Área"
                subtitle="Distribución de accesos por zona"
              >
                <div style={{ marginTop: '1rem' }}>
                  <SalesMetricNew
                    category="Oficinas Administrativas"
                    amount="342 accesos"
                    percentage={78}
                    color="bg-blue-500"
                  />
                  <SalesMetricNew
                    category="Área de Producción"
                    amount="289 accesos"
                    percentage={65}
                    color="bg-green-500"
                  />
                  <SalesMetricNew
                    category="Almacén"
                    amount="156 accesos"
                    percentage={35}
                    color="bg-yellow-500"
                  />
                  <SalesMetricNew
                    category="Estacionamiento"
                    amount="124 accesos"
                    percentage={28}
                    color="bg-purple-500"
                  />
                  <SalesMetricNew
                    category="Área Restringida"
                    amount="23 accesos"
                    percentage={5}
                    color="bg-red-500"
                  />
                </div>
              </OverviewCardNew>
            </div>

            {/* Bottom Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              {/* Recent Activity */}
              <RecentActivityNew />

              {/* System Status */}
              <OverviewCardNew
                title="Estado del Sistema"
                subtitle="Monitoreo de dispositivos y servicios"
              >
                <div style={{ marginTop: '1rem' }}>
                  {/* System Status Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981'
                        }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#065f46' }}>
                          Servidores Principales
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#059669' }}>Operativo</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981'
                        }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#065f46' }}>
                          Lectores de Tarjetas
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#059669' }}>12/12 Activos</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#fffbeb',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b'
                        }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e' }}>
                          Cámaras de Seguridad
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#d97706' }}>7/8 Activas</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981'
                        }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#065f46' }}>
                          Base de Datos
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#059669' }}>Conectada</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.75rem'
                    }}>
                      Acciones Rápidas
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#3b82f6',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #dbeafe',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}>
                        🔄 Reiniciar Sistema
                      </button>
                      <button style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#059669',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}>
                        📊 Ver Reportes
                      </button>
                    </div>
                  </div>
                </div>
              </OverviewCardNew>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
