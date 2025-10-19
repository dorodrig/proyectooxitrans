// ====================================
// 📊 REPORTE POR RANGO DE FECHAS - COMPONENTE
// Generador de reportes generales por período
// ====================================

import React, { useState, useEffect } from 'react';
import { ReportesPorFechaService, type FiltrosReporte } from '../../services/reportesPorFechaService';
import { useNotifications } from '../notifications/NotificationProvider';
import '../../styles/components/reportes/ReportePorFechas.scss';

interface ReportePorFechasProps {
  colaboradorId?: number;
  colaboradorNombre?: string;
}

const ReportePorFechasComponent: React.FC<ReportePorFechasProps> = ({ 
  colaboradorId, 
  colaboradorNombre 
}) => {
  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotifications();

  // Estados del componente
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: '',
    fechaFin: '',
    formato: 'xlsx',
    colaboradorId: colaboradorId // Agregar filtro por colaborador
  });

  const [descargandoReporte, setDescargandoReporte] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  // Establecer fechas por defecto (última semana)
  useEffect(() => {
    const hoy = new Date();
    const haceSemana = new Date();
    haceSemana.setDate(hoy.getDate() - 7);

    setFiltros(prev => ({
      ...prev,
      fechaInicio: ReportesPorFechaService.formatearFechaAPI(haceSemana),
      fechaFin: ReportesPorFechaService.formatearFechaAPI(hoy),
      colaboradorId: colaboradorId // Incluir colaboradorId al inicializar
    }));
  }, [colaboradorId]);

  // Validar filtros cuando cambien
  useEffect(() => {
    if (filtros.fechaInicio && filtros.fechaFin) {
      const validacion = ReportesPorFechaService.validarRangoFechas(
        filtros.fechaInicio, 
        filtros.fechaFin
      );

      if (!validacion.esValido) {
        setErrores(prev => ({ ...prev, rango: validacion.mensaje }));
      } else {
        setErrores(prev => {
          const { rango, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);

  // Manejar cambio en fechas
  const manejarCambioFecha = (campo: 'fechaInicio' | 'fechaFin', valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar rango sugerido
  const aplicarRangoSugerido = (fechaInicio: string, fechaFin: string) => {
    setFiltros(prev => ({
      ...prev,
      fechaInicio,
      fechaFin
    }));
  };

  // Descargar reporte completo
  const descargarReporte = async () => {
    if (!filtros.fechaInicio || !filtros.fechaFin || errores.rango) {
      mostrarAdvertencia('Validación', 'Complete las fechas correctamente para descargar el reporte');
      return;
    }

    setDescargandoReporte(true);
    try {
      mostrarInfo('Generando reporte...', 'Esto puede tomar unos momentos');
      
      await ReportesPorFechaService.descargarReporte(filtros);
      
      mostrarExito(
        'Reporte descargado',
        'El archivo Excel ha sido descargado exitosamente'
      );
    } catch (error: any) {
      console.error('Error descargando reporte:', error);
      mostrarError('Error al descargar', error.message);
    } finally {
      setDescargandoReporte(false);
    }
  };

  const rangosSugeridos = ReportesPorFechaService.obtenerRangosSugeridos();

  return (
    <div className="reporte-por-fechas">
      
      {/* ENCABEZADO */}
      <div className="reporte-por-fechas__header">
        <div className="header-content">
          <div className="header-icon">📊</div>
          <div className="header-text">
            <h2 className="header-title">
              {colaboradorId ? 
                `Reporte de ${colaboradorNombre}` : 
                'Reporte General por Fechas'
              }
            </h2>
            <p className="header-subtitle">
              {colaboradorId ? 
                `Reporte específico de jornadas laborales para ${colaboradorNombre}` :
                'Genere reportes completos de jornadas laborales por rango de fechas'
              }
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="reporte-por-fechas__filtros">
        <div className="filtros-card">
          <h3 className="filtros-title">
            📅 Seleccionar Período
          </h3>

          {/* Rangos sugeridos */}
          <div className="rangos-sugeridos">
            <label className="rangos-label">Períodos sugeridos:</label>
            <div className="rangos-buttons">
              {rangosSugeridos.map((rango, index) => (
                <button
                  key={index}
                  type="button"
                  className="rango-btn"
                  onClick={() => aplicarRangoSugerido(rango.fechaInicio, rango.fechaFin)}
                >
                  {rango.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas personalizadas */}
          <div className="fechas-personalizadas">
            <div className="fecha-grupo">
              <label htmlFor="fechaInicio" className="fecha-label">
                Fecha inicio:
              </label>
              <input
                id="fechaInicio"
                type="date"
                className={`fecha-input ${errores.rango ? 'error' : ''}`}
                value={filtros.fechaInicio}
                onChange={(e) => manejarCambioFecha('fechaInicio', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="fecha-separador">
              <span>hasta</span>
            </div>

            <div className="fecha-grupo">
              <label htmlFor="fechaFin" className="fecha-label">
                Fecha fin:
              </label>
              <input
                id="fechaFin"
                type="date"
                className={`fecha-input ${errores.rango ? 'error' : ''}`}
                value={filtros.fechaFin}
                onChange={(e) => manejarCambioFecha('fechaFin', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={filtros.fechaInicio}
              />
            </div>
          </div>

          {/* Mensaje de validación */}
          {errores.rango && (
            <div className="error-mensaje">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{errores.rango}</span>
            </div>
          )}

          {/* Información del período */}
          {filtros.fechaInicio && filtros.fechaFin && !errores.rango && (
            <div className="periodo-info">
              <div className="info-item">
                <span className="info-label">Período seleccionado:</span>
                <span className="info-value">
                  {ReportesPorFechaService.formatearFechaDisplay(filtros.fechaInicio)} - {ReportesPorFechaService.formatearFechaDisplay(filtros.fechaFin)}
                </span>
              </div>
              {(() => {
                const inicio = new Date(filtros.fechaInicio);
                const fin = new Date(filtros.fechaFin);
                const diffTime = Math.abs(fin.getTime() - inicio.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div className="info-item">
                    <span className="info-label">Duración:</span>
                    <span className="info-value">{diffDays} día{diffDays > 1 ? 's' : ''}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Botones de acción */}
          <div className="filtros-actions">
            <button
              type="button"
              className="btn-download"
              onClick={descargarReporte}
              disabled={!filtros.fechaInicio || !filtros.fechaFin || !!errores.rango || descargandoReporte}
            >
              {descargandoReporte ? (
                <>
                  <span className="btn-spinner">📥</span>
                  <span>Descargando...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">📊</span>
                  <span>Descargar Excel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportePorFechasComponent;