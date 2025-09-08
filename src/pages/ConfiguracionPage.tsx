import React, { useState } from 'react';
import HeaderNew from '../components/dashboard/HeaderNew';
import SidebarNew from '../components/dashboard/SidebarNew';
import NavigationBar from '../components/common/NavigationBar';
import OverviewCardNew from '../components/dashboard/OverviewCardNew';
import { useAuthStore } from '../stores/authStore';
import { Settings, Shield, Database, Bell, Users, Building2, Save, RefreshCw } from 'lucide-react';

const ConfiguracionPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estados para configuraciones
  const [configGeneral, setConfigGeneral] = useState({
    nombreEmpresa: 'OXITRANS S.A.S',
    nit: '900.123.456-7',
    direccion: 'Calle 123 #45-67, Bogotá',
    telefono: '+57 1 234 5678',
    email: 'info@oxitrans.com.co',
    sitioWeb: 'www.oxitrans.com.co'
  });

  const [configSistema, setConfigSistema] = useState({
    timezone: 'America/Bogota',
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    idioma: 'es',
    sesionTimeout: '30',
    backupAutomatico: true,
    logsRetencion: '90'
  });

  const [configSeguridad, setConfigSeguridad] = useState({
    intentosLogin: '3',
    bloqueoTiempo: '15',
    passwordMinLength: '6',
    passwordRequireSymbols: true,
    twoFactorAuth: false,
    sessionDuration: '8',
    ipWhitelist: '192.168.1.0/24'
  });

  const [configNotificaciones, setConfigNotificaciones] = useState({
    emailNotifications: true,
    smsNotifications: false,
    alertasSeguridad: true,
    reportesAutomaticos: true,
    notificacionesAcceso: false,
    emailReportes: 'admin@oxitrans.com.co'
  });
  
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

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'base-datos', label: 'Base de Datos', icon: Database }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSaveConfig = () => {
    console.log('Guardando configuración...');
  };

  const handleTestConnection = () => {
    console.log('Probando conexión...');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={configGeneral.nombreEmpresa}
                onChange={(e) => setConfigGeneral({...configGeneral, nombreEmpresa: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                NIT
              </label>
              <input
                type="text"
                value={configGeneral.nit}
                onChange={(e) => setConfigGeneral({...configGeneral, nit: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Dirección
              </label>
              <input
                type="text"
                value={configGeneral.direccion}
                onChange={(e) => setConfigGeneral({...configGeneral, direccion: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Teléfono
              </label>
              <input
                type="text"
                value={configGeneral.telefono}
                onChange={(e) => setConfigGeneral({...configGeneral, telefono: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email"
                value={configGeneral.email}
                onChange={(e) => setConfigGeneral({...configGeneral, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Sitio Web
              </label>
              <input
                type="text"
                value={configGeneral.sitioWeb}
                onChange={(e) => setConfigGeneral({...configGeneral, sitioWeb: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        );

      case 'sistema':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Zona Horaria
              </label>
              <select
                value={configSistema.timezone}
                onChange={(e) => setConfigSistema({...configSistema, timezone: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="America/Bogota">América/Bogotá</option>
                <option value="America/Mexico_City">América/México</option>
                <option value="America/New_York">América/Nueva York</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Formato de Fecha
              </label>
              <select
                value={configSistema.formatoFecha}
                onChange={(e) => setConfigSistema({...configSistema, formatoFecha: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Timeout de Sesión (minutos)
              </label>
              <input
                type="number"
                value={configSistema.sesionTimeout}
                onChange={(e) => setConfigSistema({...configSistema, sesionTimeout: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Retención de Logs (días)
              </label>
              <input
                type="number"
                value={configSistema.logsRetencion}
                onChange={(e) => setConfigSistema({...configSistema, logsRetencion: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configSistema.backupAutomatico}
                  onChange={(e) => setConfigSistema({...configSistema, backupAutomatico: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                Habilitar respaldo automático diario
              </label>
            </div>
          </div>
        );

      case 'seguridad':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Intentos de Login Máximos
              </label>
              <input
                type="number"
                value={configSeguridad.intentosLogin}
                onChange={(e) => setConfigSeguridad({...configSeguridad, intentosLogin: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Tiempo de Bloqueo (minutos)
              </label>
              <input
                type="number"
                value={configSeguridad.bloqueoTiempo}
                onChange={(e) => setConfigSeguridad({...configSeguridad, bloqueoTiempo: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Longitud Mínima de Contraseña
              </label>
              <input
                type="number"
                value={configSeguridad.passwordMinLength}
                onChange={(e) => setConfigSeguridad({...configSeguridad, passwordMinLength: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Duración de Sesión (horas)
              </label>
              <input
                type="number"
                value={configSeguridad.sessionDuration}
                onChange={(e) => setConfigSeguridad({...configSeguridad, sessionDuration: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Lista Blanca de IPs
              </label>
              <input
                type="text"
                value={configSeguridad.ipWhitelist}
                onChange={(e) => setConfigSeguridad({...configSeguridad, ipWhitelist: e.target.value})}
                placeholder="192.168.1.0/24, 10.0.0.0/8"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configSeguridad.passwordRequireSymbols}
                  onChange={(e) => setConfigSeguridad({...configSeguridad, passwordRequireSymbols: e.target.checked})}
                />
                Requerir símbolos en contraseñas
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configSeguridad.twoFactorAuth}
                  onChange={(e) => setConfigSeguridad({...configSeguridad, twoFactorAuth: e.target.checked})}
                />
                Habilitar autenticación de dos factores
              </label>
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Email para Reportes
                </label>
                <input
                  type="email"
                  value={configNotificaciones.emailReportes}
                  onChange={(e) => setConfigNotificaciones({...configNotificaciones, emailReportes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Tipos de Notificaciones
              </h3>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configNotificaciones.emailNotifications}
                  onChange={(e) => setConfigNotificaciones({...configNotificaciones, emailNotifications: e.target.checked})}
                />
                Notificaciones por Email
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configNotificaciones.smsNotifications}
                  onChange={(e) => setConfigNotificaciones({...configNotificaciones, smsNotifications: e.target.checked})}
                />
                Notificaciones por SMS
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configNotificaciones.alertasSeguridad}
                  onChange={(e) => setConfigNotificaciones({...configNotificaciones, alertasSeguridad: e.target.checked})}
                />
                Alertas de Seguridad
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configNotificaciones.reportesAutomaticos}
                  onChange={(e) => setConfigNotificaciones({...configNotificaciones, reportesAutomaticos: e.target.checked})}
                />
                Reportes Automáticos
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={configNotificaciones.notificacionesAcceso}
                  onChange={(e) => setConfigNotificaciones({...configNotificaciones, notificacionesAcceso: e.target.checked})}
                />
                Notificaciones de Acceso en Tiempo Real
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <Settings style={{ width: '48px', height: '48px', margin: '0 auto 1rem', color: '#9ca3af' }} />
            <p>Esta sección está en desarrollo</p>
          </div>
        );
    }
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
          <NavigationBar title="Configuración del Sistema" />

          {/* Configuration Tabs */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Sidebar Tabs */}
            <div style={{ width: '250px', flexShrink: 0 }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: 'none',
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        color: isActive ? '#1e40af' : '#6b7280',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <IconComponent style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1 }}>
              <OverviewCardNew
                title={tabs.find(t => t.id === activeTab)?.label || 'Configuración'}
                subtitle="Ajusta las configuraciones según las necesidades de tu organización"
              >
                {renderTabContent()}

                {/* Save Button */}
                <div style={{ 
                  marginTop: '2rem', 
                  paddingTop: '1.5rem', 
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end'
                }}>
                  {activeTab === 'base-datos' && (
                    <button
                      onClick={handleTestConnection}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <RefreshCw style={{ width: '16px', height: '16px' }} />
                      Probar Conexión
                    </button>
                  )}
                  
                  <button
                    onClick={handleSaveConfig}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save style={{ width: '16px', height: '16px' }} />
                    Guardar Cambios
                  </button>
                </div>
              </OverviewCardNew>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
