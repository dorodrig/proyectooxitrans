import React from 'react';

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
        <div style={{ 
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
        </div>
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
          <div style={{ fontSize: '1.25rem' }}>🔔</div>
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
          </span>
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
          <div style={{ fontSize: '1.25rem' }}>💬</div>
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
          </span>
        </button>

        {/* User Profile Mejorado */}
        <div style={{ marginLeft: '0.75rem' }}>
          <button
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
              ▼
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
