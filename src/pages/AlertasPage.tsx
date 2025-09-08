import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import NavigationBar from '../components/common/NavigationBar';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import { useAuthStore } from '../stores/authStore';
import { AlertTriangle, Bell, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

const AlertasPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todas');
  
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

  // Datos mock de alertas
  const alertas = [
    {
      id: 1,
      tipo: 'seguridad',
      titulo: 'Intento de acceso no autorizado',
      descripcion: 'Se detectó un intento de acceso con credenciales incorrectas desde IP 192.168.1.67',
      fecha: '2025-01-07 09:45:00',
      estado: 'pendiente',
      prioridad: 'alta',
      modulo: 'Autenticación'
    },
    {
      id: 2,
      tipo: 'sistema',
      titulo: 'Lector de tarjetas desconectado',
      descripcion: 'El lector de la puerta principal ha perdido conexión',
      fecha: '2025-01-07 08:30:00',
      estado: 'resuelto',
      prioridad: 'media',
      modulo: 'Hardware'
    },
    {
      id: 3,
      tipo: 'acceso',
      titulo: 'Empleado sin salida registrada',
      descripcion: 'Juan Pérez tiene entrada pero no salida del día anterior',
      fecha: '2025-01-07 07:00:00',
      estado: 'pendiente',
      prioridad: 'baja',
      modulo: 'Control Acceso'
    },
    {
      id: 4,
      tipo: 'sistema',
      titulo: 'Respaldo automático completado',
      descripcion: 'El respaldo programado de la base de datos se ejecutó correctamente',
      fecha: '2025-01-07 02:00:00',
      estado: 'resuelto',
      prioridad: 'info',
      modulo: 'Sistema'
    },
    {
      id: 5,
      tipo: 'seguridad',
      titulo: 'Múltiples intentos de login fallidos',
      descripcion: 'Usuario maria.gonzalez ha fallado 5 intentos consecutivos',
      fecha: '2025-01-06 16:45:00',
      estado: 'en_progreso',
      prioridad: 'alta',
      modulo: 'Autenticación'
    }
  ];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'seguridad':
        return { icon: '🔐', color: '#ef4444' };
      case 'sistema':
        return { icon: '⚙️', color: '#6b7280' };
      case 'acceso':
        return { icon: '🚪', color: '#3b82f6' };
      default:
        return { icon: '📋', color: '#6b7280' };
    }
  };

  const getPrioridadStyle = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Alta' };
      case 'media':
        return { bg: '#fef3c7', color: '#92400e', label: 'Media' };
      case 'baja':
        return { bg: '#dcfce7', color: '#166534', label: 'Baja' };
      case 'info':
        return { bg: '#dbeafe', color: '#1e40af', label: 'Info' };
      default:
        return { bg: '#f3f4f6', color: '#374151', label: 'Normal' };
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { bg: '#fef3c7', color: '#92400e', icon: Clock, label: 'Pendiente' };
      case 'en_progreso':
        return { bg: '#dbeafe', color: '#1e40af', icon: AlertTriangle, label: 'En Progreso' };
      case 'resuelto':
        return { bg: '#dcfce7', color: '#166534', icon: CheckCircle, label: 'Resuelto' };
      case 'descartado':
        return { bg: '#fee2e2', color: '#991b1b', icon: XCircle, label: 'Descartado' };
      default:
        return { bg: '#f3f4f6', color: '#374151', icon: Bell, label: 'Nueva' };
    }
  };

  const filteredAlertas = alertas.filter(alerta => {
    const matchesSearch = alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todas' || alerta.tipo === filterTipo;
    const matchesEstado = filterEstado === 'todas' || alerta.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleResolverAlerta = (id: number) => {
    console.log(`Resolviendo alerta ${id}`);
  };

  const handleDescartarAlerta = (id: number) => {
    console.log(`Descartando alerta ${id}`);
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
          <NavigationBar title="Centro de Alertas" />

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
                <AlertTriangle style={{ color: '#ef4444', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Alertas Críticas</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>2</p>
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
                <Clock style={{ color: '#f59e0b', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Pendientes</p>
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
                <CheckCircle style={{ color: '#10b981', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Resueltas Hoy</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>8</p>
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
                <Bell style={{ color: '#8b5cf6', width: '24px', height: '24px' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Activas</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <OverviewCardNew
            title="Alertas del Sistema"
            subtitle="Lista de alertas de seguridad y notificaciones importantes"
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
                  placeholder="Buscar alertas..."
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
                  <option value="todas">Todos los tipos</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="sistema">Sistema</option>
                  <option value="acceso">Acceso</option>
                </select>
              </div>

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
                <option value="todas">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="en_progreso">En Progreso</option>
                <option value="resuelto">Resueltas</option>
              </select>
            </div>

            {/* Lista de Alertas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredAlertas.map((alerta) => {
                const tipoStyle = getTipoIcon(alerta.tipo);
                const prioridadStyle = getPrioridadStyle(alerta.prioridad);
                const estadoStyle = getEstadoStyle(alerta.estado);
                const IconoEstado = estadoStyle.icon;

                return (
                  <div
                    key={alerta.id}
                    style={{
                      backgroundColor: 'white',
                      border: `2px solid ${alerta.prioridad === 'alta' ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>{tipoStyle.icon}</span>
                          <h3 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600', 
                            color: '#1f2937', 
                            margin: 0 
                          }}>
                            {alerta.titulo}
                          </h3>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: prioridadStyle.bg,
                            color: prioridadStyle.color
                          }}>
                            {prioridadStyle.label}
                          </span>
                        </div>
                        
                        <p style={{ 
                          color: '#6b7280', 
                          margin: '0 0 0.75rem 0',
                          lineHeight: '1.5'
                        }}>
                          {alerta.descripcion}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          <span>📅 {new Date(alerta.fecha).toLocaleString()}</span>
                          <span>📂 {alerta.modulo}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: estadoStyle.bg,
                          color: estadoStyle.color,
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          <IconoEstado style={{ width: '16px', height: '16px' }} />
                          {estadoStyle.label}
                        </div>

                        {alerta.estado === 'pendiente' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleResolverAlerta(alerta.id)}
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              Resolver
                            </button>
                            <button
                              onClick={() => handleDescartarAlerta(alerta.id)}
                              style={{
                                backgroundColor: '#6b7280',
                                color: 'white',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              Descartar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAlertas.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <CheckCircle style={{ width: '48px', height: '48px', margin: '0 auto 1rem', color: '#10b981' }} />
                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500' }}>
                  No hay alertas que coincidan con los filtros
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  El sistema está funcionando correctamente
                </p>
              </div>
            )}
          </OverviewCardNew>
        </div>
      </div>
    </div>
  );
};

export default AlertasPage;
