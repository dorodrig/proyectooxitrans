import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import { useAuthStore } from '../stores/authStore';
import { BarChart3, Download, Calendar, Users, FileText, TrendingUp } from 'lucide-react';

const ReportesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState('asistencia');
  const [dateRange, setDateRange] = useState('ultima-semana');
  
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

  const reportTypes = [
    { id: 'asistencia', name: 'Reporte de Asistencia', icon: '👥' },
    { id: 'accesos', name: 'Reporte de Accesos', icon: '🔑' },
    { id: 'tardanzas', name: 'Reporte de Tardanzas', icon: '⏰' },
    { id: 'departamentos', name: 'Por Departamentos', icon: '🏢' },
    { id: 'visitantes', name: 'Reporte de Visitantes', icon: '👤' },
    { id: 'horas-extra', name: 'Horas Extra', icon: '⏱️' }
  ];

  const dateRanges = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'ultima-semana', label: 'Última Semana' },
    { value: 'ultimo-mes', label: 'Último Mes' },
    { value: 'personalizado', label: 'Personalizado' }
  ];

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

  const handleGenerateReport = () => {
    console.log(`Generando reporte: ${selectedReport} para periodo: ${dateRange}`);
  };

  const handleDownloadReport = (format: string) => {
    console.log(`Descargando reporte en formato: ${format}`);
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
          {/* Page Title */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              Reportes y Análisis
            </h1>
            <p style={{ 
              color: '#6b7280', 
              margin: 0 
            }}>
              Genera reportes detallados de asistencia, accesos y estadísticas
            </p>
          </div>

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
            title="Generador de Reportes"
            subtitle="Configura y genera reportes personalizados"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Configuración */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Configuración del Reporte
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Tipo de Reporte
                  </label>
                  <select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                  >
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Periodo
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                  >
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {dateRange === 'personalizado' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerateReport}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <BarChart3 style={{ width: '16px', height: '16px' }} />
                  Generar Reporte
                </button>
              </div>

              {/* Vista Previa */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Vista Previa
                </h3>
                
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Calendar style={{ width: '48px', height: '48px', margin: '0 auto 1rem', color: '#9ca3af' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Selecciona un tipo de reporte y periodo para ver la vista previa
                  </p>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Opciones de Descarga
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDownloadReport('pdf')}
                      style={{
                        flex: 1,
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        justifyContent: 'center'
                      }}
                    >
                      <Download style={{ width: '14px', height: '14px' }} />
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownloadReport('excel')}
                      style={{
                        flex: 1,
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        justifyContent: 'center'
                      }}
                    >
                      <Download style={{ width: '14px', height: '14px' }} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleDownloadReport('csv')}
                      style={{
                        flex: 1,
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        justifyContent: 'center'
                      }}
                    >
                      <Download style={{ width: '14px', height: '14px' }} />
                      CSV
                    </button>
                  </div>
                </div>
              </div>
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
