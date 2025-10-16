import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, ChevronRight, RefreshCw, Download } from 'lucide-react';
import { promptPWAInstall, isAppInstalled, isPWASupported } from '../../utils/pwaUtils';
import { useResponsive } from '../../hooks/useResponsive';

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
  const { isMobile, isTablet } = useResponsive();

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
    '/configuracion': 'Configuración',
    '/jornada-laboral': 'Jornada Laboral',
    '/asignar-jornada-laboral': 'Asignar Jornada Laboral',
    '/consultas-colaboradores': 'Consultas Colaboradores'
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

  // Estilos adaptativos basados en el tamaño de pantalla
  const getButtonStyles = (baseColor: string, textColor = 'white') => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '0.25rem' : '0.5rem',
    padding: isMobile ? '0.5rem 0.75rem' : (isTablet ? '0.5rem 0.875rem' : '0.5rem 1rem'),
    backgroundColor: baseColor,
    border: `1px solid ${baseColor}`,
    borderRadius: '8px',
    color: textColor,
    fontSize: isMobile ? '0.75rem' : '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: isMobile ? '44px' : 'auto', // Botones táctiles accesibles
    flex: isMobile ? '1' : 'none' // En móvil se distribuyen equitativamente
  });

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: isMobile ? '0.75rem' : (isTablet ? '1rem' : '1rem 1.5rem'),
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Contenedor principal responsive */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: isMobile ? 'center' : 'space-between',
        gap: isMobile ? '0.75rem' : '1rem'
      }}>
        
        {/* Botones de navegación */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '0.5rem' : '0.75rem',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: isMobile ? 'space-between' : 'flex-start',
          order: isMobile ? 2 : 1
        }}>
          {showBackButton && (
            <button
              onClick={handleBack}
              style={getButtonStyles('#f3f4f6', '#374151')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.color = '#1f2937';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              {!isMobile && 'Volver'}
            </button>
          )}

          {showHomeButton && (
            <button
              onClick={handleHome}
              style={getButtonStyles('#3b82f6')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Home style={{ width: '16px', height: '16px' }} />
              {!isMobile && 'Dashboard'}
            </button>
          )}

          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              style={getButtonStyles('#10b981')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              {!isMobile && 'Actualizar'}
            </button>
          )}

          {/* Botón de instalación PWA */}
          {isPWASupported() && !isAppInstalled() && (
            <button
              onClick={promptPWAInstall}
              style={getButtonStyles('#006445')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#005537';
                  e.currentTarget.style.borderColor = '#005537';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = '#006445';
                  e.currentTarget.style.borderColor = '#006445';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              {!isMobile && 'Instalar App'}
            </button>
          )}
        </div>

        {/* Título de la página */}
        <h1 style={{
          fontSize: isMobile ? '1.25rem' : (isTablet ? '1.375rem' : '1.5rem'),
          fontWeight: '700',
          color: '#1f2937',
          margin: 0,
          textAlign: isMobile ? 'center' : 'center',
          order: isMobile ? 1 : 2,
          flex: isMobile ? 'none' : '1'
        }}>
          {currentPageTitle}
        </h1>

        {/* Spacer para mantener el diseño en desktop */}
        {!isMobile && (
          <div style={{ width: '200px', order: 3 }}></div>
        )}
      </div>

      {/* Breadcrumbs */}
      {showBreadcrumb && breadcrumbs.length > 1 && !isMobile && (
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          flexWrap: 'wrap',
          marginTop: '0.5rem'
        }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && (
                <ChevronRight style={{ 
                  width: '14px', 
                  height: '14px', 
                  color: '#9ca3af',
                  flexShrink: 0
                }} />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span style={{ 
                  color: '#1f2937', 
                  fontWeight: '500',
                  padding: isMobile ? '0.25rem' : '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: isTablet ? '0.75rem' : '0.875rem'
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
                    fontSize: isTablet ? '0.75rem' : '0.875rem',
                    padding: isMobile ? '0.25rem' : '0.25rem 0.5rem',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.color = '#3b82f6';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
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
        padding: isMobile ? '0.5rem' : '0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        fontSize: isMobile ? '0.75rem' : '0.875rem',
        color: '#6b7280',
        borderLeft: '3px solid #3b82f6',
        display: isMobile ? 'none' : 'block' // Ocultamos el tip en móvil para ahorrar espacio
      }}>
        💡 <strong>Tip:</strong> Usa "Volver" para navegar a la página anterior o "Dashboard" para ir al inicio. 
        El botón "Actualizar" recarga los datos de esta página.
      </div>
    </div>
  );
};

export default NavigationBar;
