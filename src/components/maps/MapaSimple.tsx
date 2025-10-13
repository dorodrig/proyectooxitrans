// ====================================
// 🗺️ MAPA SIMPLIFICADO PARA DEBUGGING
// Versión simple para identificar problemas
// ====================================

import React from 'react';

interface MapaSimpleProps {
  ubicaciones: any[];
  loading?: boolean;
  height?: string;
}

const MapaSimple: React.FC<MapaSimpleProps> = ({ 
  ubicaciones, 
  loading = false, 
  height = '500px' 
}) => {
  console.log('🗺️ MapaSimple renderizado con:', {
    ubicaciones: ubicaciones?.length || 0,
    loading,
    height,
    ubicacionesData: ubicaciones?.slice(0, 2) // Primeras 2 para debug
  });

  if (loading) {
    return (
      <div style={{ 
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        🔄 Cargando ubicaciones...
      </div>
    );
  }

  return (
    <div style={{ 
      height,
      background: '#e8f4fd',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '20px',
      overflow: 'auto'
    }}>
      <h3>🗺️ Mapa Simple (Modo Debug)</h3>
      
      <div style={{ marginBottom: '20px', fontSize: '14px' }}>
        <strong>Estado:</strong> {ubicaciones.length > 0 ? '✅ Con datos' : '❌ Sin datos'}<br />
        <strong>Total ubicaciones:</strong> {ubicaciones.length}<br />
        <strong>Loading:</strong> {loading ? 'Sí' : 'No'}<br />
        <strong>Datos recibidos:</strong> {JSON.stringify(ubicaciones?.slice(0, 2) || [], null, 2)}
      </div>

      {ubicaciones.length > 0 ? (
        <div>
          <h4>📍 Ubicaciones encontradas:</h4>
          {ubicaciones.map((ubicacion, index) => (
            <div key={index} style={{
              background: 'white',
              margin: '10px 0',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <strong>{ubicacion.tipo?.toUpperCase() || 'DESCONOCIDO'}</strong><br />
              📅 {ubicacion.fecha}<br />
              🕐 {ubicacion.hora}<br />
              📍 {ubicacion.latitud}, {ubicacion.longitud}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#666',
          padding: '40px'
        }}>
          📭 No hay ubicaciones GPS disponibles
        </div>
      )}
    </div>
  );
};

export default MapaSimple;