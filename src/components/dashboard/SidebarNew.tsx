import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 🧭 BARRA LATERAL PREMIUM
 * Navegación lateral con logo y menú de OXITRANS
 */
const SidebarNew: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: '🏠', label: 'Dashboard', href: '/' },
    { icon: '👥', label: 'Empleados', href: '/empleados' },
    { icon: '🔑', label: 'Control de Acceso', href: '/acceso' },
    { icon: '👤', label: 'Visitantes', href: '/visitantes' },
    { icon: '📊', label: 'Reportes', href: '/reportes' },
    { icon: '📋', label: 'Logs de Actividad', href: '/logs' },
    { icon: '⚠️', label: 'Alertas', href: '/alertas' },
    { icon: '⚙️', label: 'Configuración', href: '/configuracion' },
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
          transform: 'translateX(0)', // Siempre visible
          transition: 'transform 0.3s ease-in-out',
          zIndex: 50,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="lg:translate-x-0" // Siempre visible en desktop
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
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0
          }}>
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              
              return (
                <li key={item.href} style={{ margin: '0.25rem 0' }}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      borderRadius: '0',
                      transition: 'all 0.2s ease',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                      color: isActive ? '#1e40af' : '#6b7280',
                      fontWeight: isActive ? '600' : '400'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: '1.125rem',
                      width: '1.5rem',
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
