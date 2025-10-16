// ====================================
// 🗺️ MAPA GOOGLE SIMPLIFICADO
// Versión robusta y simplificada para ubicaciones GPS
// ====================================

import React, { useEffect, useRef, useState } from 'react';

interface UbicacionGPS {
  id: string;
  jornada_id: number;
  fecha: string;
  hora: string;
  tipo: 'entrada' | 'salida';
  latitud: number;
  longitud: number;
}

interface MapaGoogleSimpleProps {
  ubicaciones: UbicacionGPS[];
  height?: string;
  loading?: boolean;
}

const MapaGoogleSimple: React.FC<MapaGoogleSimpleProps> = ({
  ubicaciones,
  height = '500px',
  loading = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Verificar si Google Maps está disponible
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        console.log('✅ Google Maps API disponible');
        setIsGoogleMapsLoaded(true);
      } else {
        console.log('⏳ Esperando Google Maps API...');
        // Reintentar después de un momento
        setTimeout(checkGoogleMaps, 1000);
      }
    };

    checkGoogleMaps();
  }, []);

  // Crear el mapa cuando Google Maps esté disponible
  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !mapInstance && ubicaciones.length > 0) {
      try {
        console.log('🗺️ Creando mapa con ubicaciones:', ubicaciones.length);
        console.log('🔍 Datos de ubicaciones:', ubicaciones.slice(0, 2)); // Debug

        // Validar y convertir coordenadas a números
        const ubicacionesValidas = ubicaciones.filter(u => {
          const lat = parseFloat(String(u.latitud));
          const lng = parseFloat(String(u.longitud));
          return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        });

        console.log('✅ Ubicaciones válidas:', ubicacionesValidas.length);

        if (ubicacionesValidas.length === 0) {
          throw new Error('No hay ubicaciones válidas para mostrar');
        }

        // Calcular centro basado en las ubicaciones válidas
        const lats = ubicacionesValidas.map(u => parseFloat(String(u.latitud)));
        const lngs = ubicacionesValidas.map(u => parseFloat(String(u.longitud)));
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

        console.log('📍 Centro calculado:', { lat: centerLat, lng: centerLng });

        if (isNaN(centerLat) || isNaN(centerLng)) {
          throw new Error('No se pudo calcular el centro del mapa');
        }

        // Crear el mapa
        const map = new google.maps.Map(mapRef.current, {
          zoom: 13,
          center: { lat: centerLat, lng: centerLng },
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        setMapInstance(map);

        // Agrupar ubicaciones por coordenadas para manejar entrada/salida en mismo lugar
        const ubicacionesAgrupadas = new Map();
        
        ubicacionesValidas.forEach(ubicacion => {
          const lat = parseFloat(String(ubicacion.latitud));
          const lng = parseFloat(String(ubicacion.longitud));
          const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
          
          if (!ubicacionesAgrupadas.has(key)) {
            ubicacionesAgrupadas.set(key, []);
          }
          ubicacionesAgrupadas.get(key)?.push(ubicacion);
        });

        // Crear marcadores con offset para ubicaciones superpuestas
        ubicacionesAgrupadas.forEach((ubicacionesEnPunto, coordKey) => {
          const [lat, lng] = coordKey.split(',').map(Number);
          
          ubicacionesEnPunto.forEach((ubicacion: any, index: number) => {
            // Aplicar offset pequeño si hay múltiples ubicaciones en el mismo punto
            const offsetDistance = 0.0001; // ~10 metros
            const angle = (index * 120) * (Math.PI / 180); // Separar en círculo
            
            const finalLat = lat + (index > 0 ? offsetDistance * Math.cos(angle) : 0);
            const finalLng = lng + (index > 0 ? offsetDistance * Math.sin(angle) : 0);
            
            const marker = new google.maps.Marker({
              position: { lat: finalLat, lng: finalLng },
              map: map,
              title: `${ubicacion.tipo.toUpperCase()} - ${ubicacion.hora}`,
              icon: {
                url: ubicacion.tipo === 'entrada' 
                  ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="12" fill="#22c55e" stroke="#fff" stroke-width="3"/>
                      <text x="14" y="18" text-anchor="middle" fill="white" font-weight="bold" font-size="10">E</text>
                    </svg>
                  `)
                  : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="12" fill="#ef4444" stroke="#fff" stroke-width="3"/>
                      <text x="14" y="18" text-anchor="middle" fill="white" font-weight="bold" font-size="10">S</text>
                    </svg>
                  `),
                scaledSize: new google.maps.Size(28, 28),
                anchor: new google.maps.Point(14, 14)
              }
            });

            // Info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 10px; font-family: Arial, sans-serif;">
                  <strong>${ubicacion.tipo.toUpperCase()}</strong><br/>
                  📅 ${ubicacion.fecha}<br/>
                  🕐 ${ubicacion.hora}<br/>
                  📍 ${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}<br/>
                  ${ubicacionesEnPunto.length > 1 ? `<small>📍 ${ubicacionesEnPunto.length} registros en esta ubicación</small>` : ''}
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          });
        });

        console.log('✅ Mapa creado exitosamente con', ubicacionesValidas.length, 'marcadores');

      } catch (error) {
        console.error('❌ Error creando mapa:', error);
        setLoadingError('Error al crear el mapa');
      }
    }
  }, [isGoogleMapsLoaded, mapInstance, ubicaciones]);

  if (loading) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '8px',
        color: '#6c757d'
      }}>
        🔄 Cargando mapa...
      </div>
    );
  }

  if (loadingError) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        color: '#856404',
        padding: '20px'
      }}>
        ⚠️ {loadingError}
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '10px',
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

  if (!isGoogleMapsLoaded) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: '8px',
        color: '#1565c0'
      }}>
        ⏳ Cargando Google Maps API...
      </div>
    );
  }

  return (
    <div style={{
      height,
      width: '100%',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapaGoogleSimple;