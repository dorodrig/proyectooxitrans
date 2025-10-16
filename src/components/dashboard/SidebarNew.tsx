import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 🧭 BARRA LATERAL PREMIUM
 * Navegación lateral con logo y menú de OXITRANS
 */
const SidebarNew: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isDesktop } = useResponsive();
  const location = useLocation();
  
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { icon: '🏠', label: 'Dashboard', href: '/' },
        { icon: '📰', label: 'Novedades', href: '/novedades' },
      ]
    },
    {
      title: 'Jornada Laboral',
      items: [
        { icon: '⏰', label: 'Mi Jornada', href: '/jornada-laboral' },
      ]
    },
    {
      title: 'Administración',
      items: [
        { icon: '👥', label: 'Gestión de Usuarios', href: '/admin/usuarios' },
        { icon: '🔍', label: 'Consultas Colaboradores', href: '/consultas-colaboradores' },
        { icon: '🔧', label: 'Control Maestro', href: '/control-maestro' },
        { icon: '🔑', label: 'Asignar Roles', href: '/admin/asignar-roles' },
        { icon: '🏢', label: 'Regionales', href: '/admin/regionales' },
        { icon: '📍', label: 'Asignar Regional', href: '/admin/asignar-regional' },
        { icon: '💼', label: 'Cargos', href: '/admin/cargos' },
      ]
    },
    {
      title: 'Control de Acceso',
      items: [
        { icon: '🚪', label: 'Control de Acceso', href: '/acceso' },
        { icon: '👤', label: 'Visitantes', href: '/visitantes' },
        { icon: '📊', label: 'Reportes', href: '/reportes' },
        { icon: '📋', label: 'Logs de Actividad', href: '/logs' },
      ]
    },
    {
      // title: 'Sistema',
      items: [
        // { icon: '⚠️', label: 'Alertas', href: '/alertas' },
        // { icon: '⚙️', label: 'Configuración', href: '/configuracion' },
      ]
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <nav 
        style={{
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '16rem',
          transform: isDesktop ? 'translateX(0)' : (isOpen ? 'translateX(0)' : 'translateX(-100%)'),
          transition: 'transform 0.3s ease-in-out',
          zIndex: 50,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '1.5rem 1rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {/* Logo OXITRANS */}
            <div style={{
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              OX
            </div>
            <div>
              <h1 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                lineHeight: '1.25'
              }}>
                OXITRANS
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.25'
              }}>
                Control de Acceso
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{
          flex: 1,
          padding: '1rem 0',
          overflowY: 'auto'
        }}>
          {menuSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '1.5rem' }}>
              {/* Section Title */}
              <div style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {section.title}
              </div>
              
              {/* Section Items */}
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}>
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  
                  return (
                    <li key={item.href} style={{ margin: '0.125rem 0' }}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          marginLeft: '0.5rem',
                          marginRight: '0.5rem',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          backgroundColor: isActive ? '#eff6ff' : 'transparent',
                          border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                          color: isActive ? '#1e40af' : '#6b7280',
                          fontWeight: isActive ? '600' : '400'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.color = '#374151';
                            e.currentTarget.style.border = '1px solid #e5e7eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                            e.currentTarget.style.border = '1px solid transparent';
                          }
                        }}
                      >
                        <span style={{ 
                          fontSize: '1rem',
                          width: '1.25rem',
                          textAlign: 'center'
                        }}>
                          {item.icon}
                        </span>
                        <span style={{ fontSize: '0.875rem' }}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '1rem' }}>🔒</div>
            <div>
              <div style={{ fontWeight: '500' }}>Sistema Seguro</div>
              <div>v2.1.0</div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SidebarNew;
