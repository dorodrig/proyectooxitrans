// ====================================
// 🎛️ CONTROLES DEL MAPA DE UBICACIONES
// Filtros y opciones para el mapa de GPS
// ====================================

import React, { useState } from 'react';
import { formatearFechaCorta, formatearDiaSemana } from '../../utils/formatoFechas';

interface ControlesMapaProps {
  fechas: string[];
  fechaSeleccionada?: string;
  onFechaChange: (fecha: string) => void;
  onCentrarMapa?: () => void;
  onExportarUbicaciones?: () => void;
  loading?: boolean;
  totalUbicaciones: number;
}

const ControlesMapa: React.FC<ControlesMapaProps> = ({
  fechas,
  fechaSeleccionada,
  onFechaChange,
  onCentrarMapa,
  onExportarUbicaciones,
  loading = false,
  totalUbicaciones
}) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Formatear fechas para mostrar usando utilidades robustas
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha inválida';
    
    try {
      // Asegurar que la fecha esté en formato correcto
      const fechaLimpia = fecha.includes('T') ? fecha.split('T')[0] : fecha;
      return `${formatearDiaSemana(fechaLimpia)} ${formatearFechaCorta(fechaLimpia)}`;
    } catch (error) {
      console.error('Error formateando fecha en ControlesMapa:', error, 'fecha:', fecha);
      return fecha || 'Error';
    }
  };

  // Manejar cambio de filtro de fecha
  const handleFechaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    if (valor === 'todas') {
      setMostrarTodos(true);
      onFechaChange('');
    } else {
      setMostrarTodos(false);
      onFechaChange(valor);
    }
  };

  // Obtener estadísticas de ubicaciones
  const getEstadisticas = () => {
    if (fechaSeleccionada) {
      return `Mostrando ubicaciones del ${formatearFecha(fechaSeleccionada)}`;
    }
    return mostrarTodos 
      ? `Mostrando todas las ubicaciones (${totalUbicaciones})` 
      : 'Selecciona una fecha para ver ubicaciones';
  };

  return (
    <div className="mapa-controles">
      <div className="mapa-controles__seccion">
        <div className="mapa-controles__filtro">
          <label htmlFor="fecha-filtro">📅 Filtrar por fecha:</label>
          <select
            id="fecha-filtro"
            value={fechaSeleccionada || (mostrarTodos ? 'todas' : '')}
            onChange={handleFechaChange}
            disabled={loading}
          >
            <option value="">Seleccionar fecha...</option>
            <option value="todas">📊 Todas las fechas</option>
            <optgroup label="📅 Fechas disponibles">
              {fechas.map(fecha => (
                <option key={fecha} value={fecha}>
                  {formatearFecha(fecha)}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="mapa-controles__info">
          <span className="estadisticas">
            {loading ? '⏳ Cargando...' : getEstadisticas()}
          </span>
        </div>
      </div>

      <div className="mapa-controles__acciones">
        {onCentrarMapa && (
          <button
            type="button"
            onClick={onCentrarMapa}
            disabled={loading || totalUbicaciones === 0}
            className="mapa-controles__boton secundario"
            title="Centrar vista del mapa"
          >
            🎯 Centrar
          </button>
        )}

        {onExportarUbicaciones && (
          <button
            type="button"
            onClick={onExportarUbicaciones}
            disabled={loading || totalUbicaciones === 0}
            className="mapa-controles__boton"
            title="Exportar ubicaciones a CSV"
          >
            📥 Exportar
          </button>
        )}
      </div>

      {/* Información adicional */}
      {fechas.length === 0 && !loading && (
        <div className="mapa-controles__advertencia">
          <span className="advertencia-icon">⚠️</span>
          <span>No hay registros GPS disponibles para este colaborador</span>
        </div>
      )}

      {fechas.length > 0 && (
        <div className="mapa-controles__resumen">
          <div className="resumen-item">
            <strong>Período:</strong> 
            {fechas.length > 1 
              ? `${formatearFecha(fechas[fechas.length - 1])} - ${formatearFecha(fechas[0])}`
              : formatearFecha(fechas[0])
            }
          </div>
          <div className="resumen-item">
            <strong>Días con registros:</strong> {fechas.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlesMapa;