import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  user?: {
    name: string;
    role: string;
    initials: string;
  };
}

/**
 * 🎯 HEADER PREMIUM
 * Barra superior del dashboard con navegación y acciones
 */
const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  user = { name: 'Usuario OXITRANS', role: 'Admin', initials: 'UO' } 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0.75rem 1rem',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem' 
      }}>
        
        {/* Menu Toggle con Icono Hamburguesa */}
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle menu"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* Icono hamburguesa manual */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            width: '20px',
            height: '16px'
          }}>
            <div style={{
              width: '100%',
              height: '2px',
              backgroundColor: '#374151',
              borderRadius: '1px'
            }}></div>
            <div style={{
              width: '100%',
              height: '2px',
              backgroundColor: '#374151',
              borderRadius: '1px'
            }}></div>
            <div style={{
              width: '100%',
              height: '2px',
              backgroundColor: '#374151',
              borderRadius: '1px'
            }}></div>
          </div>
        </button>

        {/* Search Bar */}
        {/* <div style={{ 
          position: 'relative',
          width: '300px',
          maxWidth: '300px'
        }}>
          <input
            type="text"
            placeholder="Buscar empleados, reportes..."
            style={{
              width: '100%',
              padding: '0.5rem 2.5rem 0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
              backgroundColor: '#f9fafb',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '1rem'
          }}>
            🔍
          </div>
        </div> */}
      </div>

      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem' 
      }}>
        
        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* <div style={{ fontSize: '1.25rem' }}>🔔</div>
          <span style={{
            position: 'absolute',
            top: '-0.25rem',
            right: '-0.25rem',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '50%',
            width: '1.25rem',
            height: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            5
          </span> */}
        </button>

        {/* Messages */}
        <button
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* <div style={{ fontSize: '1.25rem' }}>💬</div>
          <span style={{
            position: 'absolute',
            top: '-0.25rem',
            right: '-0.25rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '50%',
            width: '1.25rem',
            height: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            9
          </span> */}
        </button>

        {/* User Profile con Dropdown */}
        <div ref={dropdownRef} style={{ marginLeft: '0.75rem', position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '2.25rem',
              height: '2.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              {user.initials}
            </div>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column', 
              textAlign: 'left',
              minWidth: '120px'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#1f2937',
                lineHeight: '1.25'
              }}>
                {user.name}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                lineHeight: '1.25'
              }}>
                {user.role}
              </span>
            </div>
            <div style={{ 
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginLeft: '0.25rem'
            }}>
              {showDropdown ? '▲' : '▼'}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              minWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{ padding: '0.5rem' }}>
                {/* Profile Option */}
                {/* <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '1rem' }}>👤</span>
                  Mi Perfil
                </button> */}

                {/* Settings Option */}
                {/* <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '1rem' }}>⚙️</span>
                  Configuración
                </button> */}

                {/* Divider */}
                <div style={{
                  height: '1px',
                  backgroundColor: '#e5e7eb',
                  margin: '0.5rem 0'
                }} />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '1rem' }}>🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
