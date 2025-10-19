import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import NavigationBar from '../components/common/NavigationBar';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import ReportePorFechasComponent from '../components/reportes/ReportePorFechas';
import { useAuthStore } from '../stores/authStore';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import '../styles/components/reportes/ReportePorFechas.scss';

const ReportesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Obtener datos del usuario autenticado
  const { usuario } = useAuthStore();
  
  // Preparar datos del usuario para el header
  const userForHeader = usuario ? {
    name: `${usuario.nombre} ${usuario.apellido}`,
    role: usuario.cargo || 'Usuario',
    initials: `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()
  } : {
    name: 'Usuario OXITRANS',
    role: 'Admin',
    initials: 'UO'
  };



  // Datos mock para reportes
  const reportData = {
    asistencia: [
      { empleado: 'Juan Pérez', departamento: 'Administración', entrada: '08:15', salida: '17:30', horas: '9:15' },
      { empleado: 'María González', departamento: 'Operaciones', entrada: '08:05', salida: '17:20', horas: '9:15' },
      { empleado: 'Carlos Rodriguez', departamento: 'Logística', entrada: '08:25', salida: '17:45', horas: '9:20' }
    ]
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };



  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <SidebarNew isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div style={{ 
        marginLeft: '16rem',
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0 
      }}>
        {/* Header */}
        <HeaderNew onToggleSidebar={toggleSidebar} user={userForHeader} />
          
        {/* Page Content */}
        <div style={{ 
          padding: '1.5rem',
          minHeight: 'calc(100vh - 70px)',
          backgroundColor: '#f8fafc'
        }}>
          {/* Navigation Bar */}
          <NavigationBar title="Reportes y Análisis" />

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText style={{ color: '#3b82f6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Reportes Generados</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>156</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp style={{ color: '#10b981', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Promedio Asistencia</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>94%</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users style={{ color: '#f59e0b', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Empleados Activos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>142</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart3 style={{ color: '#8b5cf6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Departamentos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>8</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Generator */}
          <OverviewCardNew
            title="🎯 Generador de Reportes General"
            subtitle="Genera reportes consolidados de todos los colaboradores por rango de fechas"
          >
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #0ea5e9',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    background: '#0ea5e9',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '1.2rem'
                  }}>
                    📊
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#0c4a6e', fontSize: '1.1rem', fontWeight: '600' }}>
                      Reporte Completo por Fechas
                    </h3>
                    <p style={{ margin: 0, color: '#075985', fontSize: '0.9rem' }}>
                      Incluye: Jornadas, horas trabajadas, horas extras, novedades y ubicaciones GPS
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Componente de reporte integrado */}
              <ReportePorFechasComponent />
            </div>
          </OverviewCardNew>

          {/* Sample Report Data */}
          <OverviewCardNew
            title="Muestra de Datos"
            subtitle="Vista previa del reporte de asistencia"
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Empleado
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Departamento
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Entrada
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Salida
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Total Horas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.asistencia.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem', color: '#1f2937', fontWeight: '500' }}>
                        {row.empleado}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {row.departamento}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {row.entrada}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {row.salida}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {row.horas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </OverviewCardNew>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
