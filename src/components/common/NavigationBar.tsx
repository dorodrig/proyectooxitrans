import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, ChevronRight, RefreshCw } from 'lucide-react';

interface NavigationBarProps {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showBreadcrumb?: boolean;
  showRefreshButton?: boolean;
  customBackPath?: string;
  onRefresh?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  showBackButton = true,
  showHomeButton = true,
  showBreadcrumb = true,
  showRefreshButton = true,
  customBackPath,
  onRefresh
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeo de rutas para breadcrumbs
  const routeMap: { [key: string]: string } = {
    '/': 'Dashboard',
    '/novedades': 'Novedades',
    '/admin/usuarios': 'Gestión de Usuarios',
    '/control-maestro': 'Control Maestro',
    '/admin/asignar-roles': 'Asignar Roles',
    '/admin/regionales': 'Regionales',
    '/admin/asignar-regional': 'Asignar Regional',
    '/admin/cargos': 'Cargos',
    '/acceso': 'Control de Acceso',
    '/visitantes': 'Visitantes',
    '/reportes': 'Reportes',
    '/logs': 'Logs de Actividad',
    '/alertas': 'Alertas',
    '/configuracion': 'Configuración'
  };

  // Obtener el título de la página actual
  const currentPageTitle = title || routeMap[location.pathname] || 'Página';

  // Generar breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ path: '/', label: 'Dashboard' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = routeMap[currentPath];
      if (label) {
        breadcrumbs.push({ path: currentPath, label });
      }
    });

    return breadcrumbs;
  };

  const handleBack = () => {
    if (customBackPath) {
      navigate(customBackPath);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Botones de navegación */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: showBreadcrumb ? '0.75rem' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {showBackButton && (
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.color = '#1f2937';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Volver
            </button>
          )}

          {showHomeButton && (
            <button
              onClick={handleHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Home style={{ width: '16px', height: '16px' }} />
              Dashboard
            </button>
          )}

          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.borderColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Actualizar
            </button>
          )}
        </div>

        {/* Título de la página */}
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0,
          textAlign: 'center'
        }}>
          {currentPageTitle}
        </h1>

        <div style={{ width: '200px' }}></div> {/* Spacer para centrar el título */}
      </div>

      {/* Breadcrumbs */}
      {showBreadcrumb && breadcrumbs.length > 1 && (
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && (
                <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span style={{ 
                  color: '#1f2937', 
                  fontWeight: '500',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px'
                }}>
                  {crumb.label}
                </span>
              ) : (
                <button
                  onClick={() => navigate(crumb.path)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {crumb.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Información adicional de la página */}
      <div style={{
        marginTop: '0.75rem',
        padding: '0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#6b7280',
        borderLeft: '3px solid #3b82f6'
      }}>
        💡 <strong>Tip:</strong> Usa "Volver" para navegar a la página anterior o "Dashboard" para ir al inicio. 
        El botón "Actualizar" recarga los datos de esta página.
      </div>
    </div>
  );
};

export default NavigationBar;
