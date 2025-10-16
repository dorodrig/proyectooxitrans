import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import NavigationBar from '../components/common/NavigationBar';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import { useAuthStore } from '../stores/authStore';
import { Clock, LogIn, LogOut, Users, Search, Filter } from 'lucide-react';
import { useResponsive, getResponsiveLayoutStyles } from '../hooks/useResponsive';

const AccesoPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const { isMobile } = useResponsive();
  
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

  // Datos mock de registros de acceso
  const registrosAcceso = [
    {
      id: 1,
      empleado: 'Juan Pérez',
      documento: '12345678',
      tipo: 'entrada',
      fecha: '2025-01-07',
      hora: '08:15:23',
      puerta: 'Principal',
      departamento: 'Administración'
    },
    {
      id: 2,
      empleado: 'María González',
      documento: '87654321',
      tipo: 'salida',
      fecha: '2025-01-07',
      hora: '12:30:45',
      puerta: 'Principal',
      departamento: 'Operaciones'
    },
    {
      id: 3,
      empleado: 'Carlos Rodriguez',
      documento: '11223344',
      tipo: 'entrada',
      fecha: '2025-01-07',
      hora: '14:00:12',
      puerta: 'Almacén',
      departamento: 'Logística'
    }
  ];

  const filteredRegistros = registrosAcceso.filter(registro => {
    const matchesSearch = registro.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registro.documento.includes(searchTerm);
    const matchesFilter = filterTipo === 'todos' || registro.tipo === filterTipo;
    return matchesSearch && matchesFilter;
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const layoutStyles = getResponsiveLayoutStyles(isMobile);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <SidebarNew isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div style={layoutStyles.mainContent}>
        {/* Header */}
        <HeaderNew onToggleSidebar={toggleSidebar} user={userForHeader} />
          
        {/* Page Content */}
        <div style={layoutStyles.pageContent}>
          {/* Navigation Bar */}
          <NavigationBar title="Control de Acceso" />

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
                <LogIn style={{ color: '#10b981', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Entradas Hoy</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>89</p>
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
                <LogOut style={{ color: '#f59e0b', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Salidas Hoy</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>67</p>
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
                <Users style={{ color: '#3b82f6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Presentes</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>22</p>
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
                <Clock style={{ color: '#ef4444', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Tardanzas</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registros de Acceso */}
          <OverviewCardNew
            title="Registros de Acceso"
            subtitle="Historial de entradas y salidas en tiempo real"
          >
            {/* Filtros y Búsqueda */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                <Search style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="entrada">Entradas</option>
                  <option value="salida">Salidas</option>
                </select>
              </div>
            </div>

            {/* Tabla de Registros */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Empleado
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Documento
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Tipo
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Hora
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Puerta
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Departamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistros.map((registro) => (
                    <tr key={registro.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem', color: '#1f2937' }}>
                        {registro.empleado}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {registro.documento}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: registro.tipo === 'entrada' ? '#dcfce7' : '#fef3c7',
                          color: registro.tipo === 'entrada' ? '#166534' : '#92400e'
                        }}>
                          {registro.tipo === 'entrada' ? '🔓 Entrada' : '🔒 Salida'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {registro.fecha}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {registro.hora}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {registro.puerta}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {registro.departamento}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRegistros.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                No se encontraron registros que coincidan con los filtros.
              </div>
            )}
          </OverviewCardNew>
        </div>
      </div>
    </div>
  );
};

export default AccesoPage;
