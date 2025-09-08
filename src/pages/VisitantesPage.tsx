import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import NavigationBar from '../components/common/NavigationBar';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import { useAuthStore } from '../stores/authStore';
import { UserPlus, Users, Clock, Search, Filter, Calendar } from 'lucide-react';

const VisitantesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  
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

  // Datos mock de visitantes
  const visitantes = [
    {
      id: 1,
      nombre: 'Ana Rodriguez',
      documento: '98765432',
      empresa: 'Proveedor XYZ',
      motivo: 'Reunión comercial',
      anfitrion: 'Juan Pérez',
      estado: 'dentro',
      horaEntrada: '09:30',
      horaSalida: null,
      fecha: '2025-01-07'
    },
    {
      id: 2,
      nombre: 'Luis González',
      documento: '55667788',
      empresa: 'Cliente ABC',
      motivo: 'Inspección técnica',
      anfitrion: 'María González',
      estado: 'fuera',
      horaEntrada: '08:15',
      horaSalida: '11:45',
      fecha: '2025-01-07'
    },
    {
      id: 3,
      nombre: 'Carmen Silva',
      documento: '44556677',
      empresa: 'Auditoría LTDA',
      motivo: 'Auditoría interna',
      anfitrion: 'Carlos Rodriguez',
      estado: 'dentro',
      horaEntrada: '14:00',
      horaSalida: null,
      fecha: '2025-01-07'
    }
  ];

  const filteredVisitantes = visitantes.filter(visitante => {
    const matchesSearch = visitante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitante.documento.includes(searchTerm) ||
                         visitante.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || visitante.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

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
          <NavigationBar title="Gestión de Visitantes" />

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
                <Users style={{ color: '#3b82f6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Visitantes Hoy</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>12</p>
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
                <Clock style={{ color: '#10b981', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Dentro</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>3</p>
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
                <UserPlus style={{ color: '#f59e0b', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Registrados</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>9</p>
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
                <Calendar style={{ color: '#8b5cf6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Esta Semana</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>45</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visitantes */}
          <OverviewCardNew
            title="Registro de Visitantes"
            subtitle="Lista de visitantes registrados en el sistema"
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
                  placeholder="Buscar por nombre, documento o empresa..."
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
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="dentro">Dentro</option>
                  <option value="fuera">Fuera</option>
                </select>
              </div>

              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <UserPlus style={{ width: '16px', height: '16px' }} />
                Registrar Visitante
              </button>
            </div>

            {/* Tabla de Visitantes */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Visitante
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Documento
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Empresa
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Motivo
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Anfitrión
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Estado
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Entrada
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Salida
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitantes.map((visitante) => (
                    <tr key={visitante.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem', color: '#1f2937', fontWeight: '500' }}>
                        {visitante.nombre}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {visitante.documento}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {visitante.empresa}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {visitante.motivo}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {visitante.anfitrion}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: visitante.estado === 'dentro' ? '#dcfce7' : '#fee2e2',
                          color: visitante.estado === 'dentro' ? '#166534' : '#991b1b'
                        }}>
                          {visitante.estado === 'dentro' ? '🟢 Dentro' : '🔴 Fuera'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {visitante.horaEntrada}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {visitante.horaSalida || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVisitantes.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                No se encontraron visitantes que coincidan con los filtros.
              </div>
            )}
          </OverviewCardNew>
        </div>
      </div>
    </div>
  );
};

export default VisitantesPage;
