// ====================================
// 🔄 CARGADOR GOOGLE MAPS SIMPLE
// Versión simplificada para cargar Google Maps API
// ====================================

import { useEffect, useState } from 'react';

interface GoogleMapsSimpleLoaderProps {
  children: React.ReactNode;
}

const GoogleMapsSimpleLoader: React.FC<GoogleMapsSimpleLoaderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps ya estaba cargado');
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Verificar si ya existe un script de Google Maps
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('✅ Script de Google Maps ya existe, esperando carga...');
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          setIsLoading(false);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Verificar API key
    if (!apiKey || apiKey === 'AIzaSyDEVELOPMENT_KEY_CHANGE_IN_PRODUCTION') {
      console.error('❌ Google Maps API key no configurada');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    console.log('🔄 Cargando Google Maps API...');

    // Crear script para cargar Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script'; // ID único para prevenir duplicados

    script.onload = () => {
      console.log('✅ Google Maps API cargada exitosamente');
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = (error) => {
      console.error('❌ Error cargando Google Maps API:', error);
      setHasError(true);
      setIsLoading(false);
    };

    // Agregar script al DOM solo si no existe
    if (!document.getElementById('google-maps-script')) {
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // No remover el script al desmontar, para reutilizarlo
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '8px',
        color: '#6c757d'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>Cargando Google Maps...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        color: '#856404',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
        <div><strong>Error al cargar Google Maps</strong></div>
        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          Verifica la configuración de la API key
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return null;
  }

  return <>{children}</>;
};

export default GoogleMapsSimpleLoader;