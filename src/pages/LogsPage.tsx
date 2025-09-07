import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import { useAuthStore } from '../stores/authStore';
import { Activity, Search, Filter, Download, RefreshCw, AlertTriangle } from 'lucide-react';

const LogsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('todos');
  const [filterDate, setFilterDate] = useState('hoy');
  
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

  // Datos mock de logs de actividad
  const logs = [
    {
      id: 1,
      timestamp: '2025-01-07 09:15:23',
      usuario: 'Juan Pérez',
      accion: 'Login exitoso',
      ip: '192.168.1.45',
      nivel: 'info',
      modulo: 'Autenticación',
      detalles: 'Usuario inició sesión correctamente'
    },
    {
      id: 2,
      timestamp: '2025-01-07 09:12:45',
      usuario: 'Sistema',
      accion: 'Intento de login fallido',
      ip: '192.168.1.67',
      nivel: 'warning',
      modulo: 'Autenticación',
      detalles: 'Credenciales incorrectas para usuario: maria.gonzalez'
    },
    {
      id: 3,
      timestamp: '2025-01-07 09:10:12',
      usuario: 'Carlos Rodriguez',
      accion: 'Registro de acceso',
      ip: '192.168.1.23',
      nivel: 'info',
      modulo: 'Control Acceso',
      detalles: 'Entrada registrada - Puerta Principal'
    },
    {
      id: 4,
      timestamp: '2025-01-07 09:05:33',
      usuario: 'Admin',
      accion: 'Usuario creado',
      ip: '192.168.1.10',
      nivel: 'info',
      modulo: 'Administración',
      detalles: 'Nuevo empleado registrado: Ana Silva'
    },
    {
      id: 5,
      timestamp: '2025-01-07 08:45:22',
      usuario: 'Sistema',
      accion: 'Error de conexión BD',
      ip: '192.168.1.1',
      nivel: 'error',
      modulo: 'Sistema',
      detalles: 'Timeout en conexión a base de datos'
    }
  ];

  const getLevelColor = (nivel: string) => {
    switch (nivel) {
      case 'error':
        return { bg: '#fee2e2', color: '#991b1b', icon: '🔴' };
      case 'warning':
        return { bg: '#fef3c7', color: '#92400e', icon: '🟡' };
      case 'info':
        return { bg: '#dbeafe', color: '#1e40af', icon: '🔵' };
      default:
        return { bg: '#f3f4f6', color: '#374151', icon: '⚪' };
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.modulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'todos' || log.nivel === filterLevel;
    return matchesSearch && matchesLevel;
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
          {/* Page Title */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              Logs de Actividad
            </h1>
            <p style={{ 
              color: '#6b7280', 
              margin: 0 
            }}>
              Registro detallado de todas las actividades del sistema
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
                <Activity style={{ color: '#3b82f6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Eventos Hoy</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>245</p>
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
                <AlertTriangle style={{ color: '#ef4444', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Errores</p>
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
                <RefreshCw style={{ color: '#f59e0b', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Advertencias</p>
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
                <Download style={{ color: '#10b981', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Eventos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>12.5K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <OverviewCardNew
            title="Registro de Actividades"
            subtitle="Historial detallado de eventos del sistema"
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
                  placeholder="Buscar por usuario, acción o módulo..."
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
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="info">Información</option>
                  <option value="warning">Advertencias</option>
                  <option value="error">Errores</option>
                </select>
              </div>

              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="hoy">Hoy</option>
                <option value="ayer">Ayer</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
              </select>

              <button style={{
                backgroundColor: '#10b981',
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
                <Download style={{ width: '16px', height: '16px' }} />
                Exportar
              </button>
            </div>

            {/* Tabla de Logs */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Timestamp
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Usuario
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Acción
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Módulo
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Nivel
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      IP
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const levelStyle = getLevelColor(log.nivel);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                          {log.timestamp}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#1f2937', fontWeight: '500' }}>
                          {log.usuario}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                          {log.accion}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                          {log.modulo}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: levelStyle.bg,
                            color: levelStyle.color
                          }}>
                            {levelStyle.icon} {log.nivel.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {log.ip}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280', maxWidth: '200px' }}>
                          <div style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={log.detalles}>
                            {log.detalles}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                No se encontraron logs que coincidan con los filtros.
              </div>
            )}
          </OverviewCardNew>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
