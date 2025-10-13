// ====================================
// 🗺️ GOOGLE MAPS LOADER
// Wrapper optimizado para cargar Google Maps API
// ====================================

import React, { useCallback, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ status: Status }>;
}

/**
 * Componente de carga para Google Maps con optimización
 */
const DefaultFallback: React.FC<{ status: Status }> = ({ status }) => {
  const renderStatus = () => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="maps-loading">
            <div className="maps-loading__spinner">
              <div className="spinner"></div>
            </div>
            <p className="maps-loading__text">Cargando Google Maps...</p>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="maps-error">
            <div className="maps-error__icon">⚠️</div>
            <h3 className="maps-error__title">Error al cargar el mapa</h3>
            <p className="maps-error__message">
              No se pudo conectar con Google Maps. Verifica tu conexión a internet.
            </p>
            <details className="maps-error__details">
              <summary>Información técnica</summary>
              <p>Status: {status}</p>
              <p>Posibles causas:</p>
              <ul>
                <li>API key inválida o expirada</li>
                <li>Límites de cuota excedidos</li>
                <li>Problemas de conectividad</li>
              </ul>
            </details>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="maps-fallback">
      {renderStatus()}
    </div>
  );
};

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({
  children,
  fallback: Fallback = DefaultFallback,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [isKeyValid, setIsKeyValid] = useState(true);

  useEffect(() => {
    // Validar que la API key esté configurada
    if (!apiKey || apiKey === 'AIzaSyDEVELOPMENT_KEY_CHANGE_IN_PRODUCTION') {
      console.warn('⚠️ Google Maps API key no configurada correctamente');
      setIsKeyValid(false);
    }
  }, [apiKey]);

  const render = useCallback((status: Status) => {
    return <Fallback status={status} />;
  }, [Fallback]);

  // Si no hay API key válida, mostrar mensaje
  if (!isKeyValid) {
    return (
      <div className="maps-config-warning">
        <div className="maps-config-warning__content">
          <div className="maps-config-warning__icon">🔧</div>
          <h3 className="maps-config-warning__title">Configuración requerida</h3>
          <p className="maps-config-warning__message">
            Para mostrar los mapas, es necesario configurar una API key válida de Google Maps.
          </p>
          <div className="maps-config-warning__instructions">
            <h4>Pasos para configurar:</h4>
            <ol>
              <li>Obtén una API key en <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Habilita la Maps JavaScript API</li>
              <li>Actualiza la variable <code>VITE_GOOGLE_MAPS_API_KEY</code> en el archivo .env</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Wrapper 
      apiKey={apiKey} 
      render={render}
      libraries={['marker']}
      version="beta"
    >
      {children}
    </Wrapper>
  );
};

export default GoogleMapsLoader;