// ====================================
// 🗺️ MAPA DE UBICACIONES COLABORADOR
// Componente para mostrar registros GPS con marcadores interactivos
// ====================================

import React, { useEffect, useRef, useState } from 'react';
import GoogleMapsLoader from './GoogleMapsLoader';
import type { UbicacionGPS } from '../../services/colaboradoresService';

interface MapaUbicacionesColaboradorProps {
  ubicaciones: UbicacionGPS[];
  fechaFiltro?: string;
  loading?: boolean;
  onUbicacionClick?: (ubicacion: UbicacionGPS) => void;
  height?: string;
  showControls?: boolean;
}

/**
 * Componente interno que renderiza el mapa una vez cargado Google Maps
 */
const MapaInterno: React.FC<MapaUbicacionesColaboradorProps> = ({
  ubicaciones,
  fechaFiltro,
  loading = false,
  onUbicacionClick,
  height = '400px',
  showControls = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedUbicacion, setSelectedUbicacion] = useState<UbicacionGPS | null>(null);

  // Colores para diferentes tipos de marcación
  const getTipoColor = (tipo: UbicacionGPS['tipo']) => {
    switch (tipo) {
      case 'entrada': return '#22c55e'; // Verde
      case 'salida': return '#ef4444';  // Rojo
      default: return '#6b7280'; // Gris
    }
  };

  // Crear marcador personalizado
  const createCustomMarker = (ubicacion: UbicacionGPS) => {
    const color = getTipoColor(ubicacion.tipo);
    
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div class="custom-marker" style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: ${color};
          color: white;
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 2px;
          font-weight: bold;
          white-space: nowrap;
          display: none;
        " class="marker-label">
          ${ubicacion.tipo.toUpperCase()} ${ubicacion.hora}
        </div>
      </div>
    `;

    // Mostrar label al hacer hover
    markerElement.addEventListener('mouseenter', () => {
      const label = markerElement.querySelector('.marker-label') as HTMLElement;
      if (label) label.style.display = 'block';
    });

    markerElement.addEventListener('mouseleave', () => {
      const label = markerElement.querySelector('.marker-label') as HTMLElement;
      if (label) label.style.display = 'none';
    });

    return markerElement;
  };

  // Debug logging para MapaInterno
  useEffect(() => {
    console.log('🗺️ MapaInterno montado con props:', {
      ubicaciones: ubicaciones?.length || 0,
      fechaFiltro,
      loading,
      height
    });
  }, []);

  // Inicializar mapa
  useEffect(() => {
    console.log('🗺️ Inicializando mapa, mapRef.current:', !!mapRef.current, 'map existe:', !!map);
    
    if (mapRef.current && !map) {
      console.log('🗺️ Creando nuevo mapa de Google Maps');
      
      const initialMap = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 4.6097, lng: -74.0817 }, // Bogotá por defecto
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        zoomControl: showControls,
      });

      setMap(initialMap);
    }
  }, [mapRef, map, showControls]);

  // Actualizar marcadores cuando cambian las ubicaciones
  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.map = null);

    // Filtrar ubicaciones por fecha si está especificada
    const ubicacionesFiltradas = fechaFiltro
      ? ubicaciones.filter(u => u.fecha === fechaFiltro)
      : ubicaciones;

    if (ubicacionesFiltradas.length === 0) {
      setMarkers([]);
      return;
    }

    // Crear nuevos marcadores
    const nuevosMarkers = ubicacionesFiltradas.map(ubicacion => {
      const position = {
        lat: ubicacion.latitud,
        lng: ubicacion.longitud
      };

      const markerElement = createCustomMarker(ubicacion);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        content: markerElement,
        title: `${ubicacion.tipo.toUpperCase()} - ${ubicacion.hora}`
      });

      // Evento click en marcador
      markerElement.addEventListener('click', () => {
        setSelectedUbicacion(ubicacion);
        onUbicacionClick?.(ubicacion);
        
        // Centrar mapa en el marcador
        map.panTo(position);
        map.setZoom(Math.max(map.getZoom() || 12, 16));
      });

      return marker;
    });

    setMarkers(nuevosMarkers);

    // Ajustar vista para mostrar todos los marcadores
    if (ubicacionesFiltradas.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      ubicacionesFiltradas.forEach(ubicacion => {
        bounds.extend({
          lat: ubicacion.latitud,
          lng: ubicacion.longitud
        });
      });
      map.fitBounds(bounds);
    } else if (ubicacionesFiltradas.length === 1) {
      const ubicacion = ubicacionesFiltradas[0];
      map.setCenter({
        lat: ubicacion.latitud,
        lng: ubicacion.longitud
      });
      map.setZoom(16);
    }

  }, [map, ubicaciones, fechaFiltro, markers, onUbicacionClick]);

  if (loading) {
    return (
      <div className="mapa-loading" style={{ height }}>
        <div className="mapa-loading__content">
          <div className="spinner"></div>
          <p>Cargando ubicaciones GPS...</p>
        </div>
      </div>
    );
  }

  if (ubicaciones.length === 0) {
    return (
      <div className="mapa-sin-datos" style={{ height }}>
        <div className="mapa-sin-datos__content">
          <div className="mapa-sin-datos__icon">📍</div>
          <h3>No hay ubicaciones registradas</h3>
          <p>No se encontraron datos GPS para el período seleccionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mapa-ubicaciones">
      <div 
        ref={mapRef} 
        className="mapa-ubicaciones__container"
        style={{ height, width: '100%' }}
      />
      
      {selectedUbicacion && (
        <div className="mapa-ubicaciones__info">
          <div className="ubicacion-info">
            <div className="ubicacion-info__header">
              <h4>📍 Registro de {selectedUbicacion.tipo}</h4>
              <button
                onClick={() => setSelectedUbicacion(null)}
                className="ubicacion-info__close"
              >
                ×
              </button>
            </div>
            <div className="ubicacion-info__content">
              <div className="info-item">
                <strong>Fecha:</strong> {selectedUbicacion.fecha}
              </div>
              <div className="info-item">
                <strong>Hora:</strong> {selectedUbicacion.hora}
              </div>
              <div className="info-item">
                <strong>Tipo:</strong> 
                <span className={`tipo-badge tipo-${selectedUbicacion.tipo}`}>
                  {selectedUbicacion.tipo.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <strong>Coordenadas:</strong> 
                {selectedUbicacion.latitud.toFixed(6)}, {selectedUbicacion.longitud.toFixed(6)}
              </div>
              {/* Información adicional disponible en futuras versiones
              {selectedUbicacion.direccion && (
                <div className="info-item">
                  <strong>Dirección:</strong> {selectedUbicacion.direccion}
                </div>
              )}
              {selectedUbicacion.precision && (
                <div className="info-item">
                  <strong>Precisión:</strong> ±{selectedUbicacion.precision}m
                </div>
              )}
              */}
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="mapa-ubicaciones__leyenda">
        <div className="leyenda-item">
          <div 
            className="leyenda-color" 
            style={{ backgroundColor: getTipoColor('entrada') }}
          ></div>
          <span>Entrada</span>
        </div>
        <div className="leyenda-item">
          <div 
            className="leyenda-color" 
            style={{ backgroundColor: getTipoColor('salida') }}
          ></div>
          <span>Salida</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal con wrapper de Google Maps
 */
const MapaUbicacionesColaborador: React.FC<MapaUbicacionesColaboradorProps> = (props) => {
  // Debug logging
  console.log('🗺️ MapaUbicacionesColaborador props:', {
    ubicaciones: props.ubicaciones?.length || 0,
    fechaFiltro: props.fechaFiltro,
    loading: props.loading,
    height: props.height
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('🗺️ Ubicaciones completas:', props.ubicaciones);
  }

  return (
    <GoogleMapsLoader>
      <MapaInterno {...props} />
    </GoogleMapsLoader>
  );
};

export default MapaUbicacionesColaborador;