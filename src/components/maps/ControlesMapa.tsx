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
  onActualizarMapa?: (fecha: string) => void;  // Nueva función para actualizar mapa manualmente
  onCentrarMapa?: () => void;
  onExportarUbicaciones?: () => void;
  loading?: boolean;
  totalUbicaciones: number;
}

const ControlesMapa: React.FC<ControlesMapaProps> = ({
  fechas,
  fechaSeleccionada,
  onFechaChange,
  onActualizarMapa,
  onCentrarMapa,
  onExportarUbicaciones,
  loading = false,
  totalUbicaciones
}) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [fechaPendiente, setFechaPendiente] = useState<string>('');

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
      setFechaPendiente('');
      // "Todas las fechas" se actualiza automáticamente
      onFechaChange('');
    } else {
      setMostrarTodos(false);
      setFechaPendiente(valor);
      // Para fechas específicas, solo guardamos la fecha pero no actualizamos automáticamente
    }
  };

  // Manejar actualización manual del mapa
  const handleActualizarMapa = () => {
    if (fechaPendiente && onActualizarMapa) {
      onActualizarMapa(fechaPendiente);
      onFechaChange(fechaPendiente); // Actualizar la fecha seleccionada
    }
  };

  // Verificar si hay una fecha pendiente de aplicar
  const hayFechaPendiente = fechaPendiente && fechaPendiente !== fechaSeleccionada;

  // Obtener estadísticas de ubicaciones
  const getEstadisticas = () => {
    if (fechaSeleccionada) {
      return `Mostrando ubicaciones del ${formatearFecha(fechaSeleccionada)} (${totalUbicaciones} registros)`;
    }
    if (mostrarTodos) {
      return `Mostrando todas las ubicaciones (${totalUbicaciones} registros)`;
    }
    if (fechaPendiente) {
      return `Fecha ${formatearFecha(fechaPendiente)} seleccionada - Presiona "Actualizar Mapa"`;
    }
    return 'Selecciona una fecha para ver ubicaciones';
  };

  return (
    <div className="mapa-controles">
      <div className="mapa-controles__seccion">
        <div className="mapa-controles__filtro">
          <label htmlFor="fecha-filtro">📅 Filtrar por fecha:</label>
          <select
            id="fecha-filtro"
            value={fechaSeleccionada || fechaPendiente || (mostrarTodos ? 'todas' : '')}
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
          {hayFechaPendiente && (
            <div className="fecha-pendiente">
              <span className="pendiente-icon">⚠️</span>
              <span className="pendiente-text">Fecha seleccionada, presiona "Actualizar Mapa"</span>
            </div>
          )}
        </div>
      </div>

      <div className="mapa-controles__acciones">
        {/* Botón Actualizar Mapa - Solo visible cuando hay fecha pendiente */}
        {hayFechaPendiente && (
          <button
            type="button"
            onClick={handleActualizarMapa}
            disabled={loading}
            className="mapa-controles__boton primario"
            title="Actualizar el mapa con la fecha seleccionada"
          >
            🗺️ Actualizar Mapa
          </button>
        )}
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