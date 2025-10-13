// ====================================
// 📊 GENERADOR DE REPORTES - COMPONENTE
// Interface para exportar datos a PDF y Excel
// ====================================

import React, { useState } from 'react';
import { GeneradorReportes } from '../../services/generadorReportes';
import type { DatosReporte } from '../../services/generadorReportes';
import { CalculadoraHorasExtras } from '../../services/calculadoraHorasExtras';
import type { Colaborador, JornadaLaboral, UbicacionGPS } from '../../services/colaboradoresService';
import { useAuthStore } from '../../stores/authStore';

interface GeneradorReportesProps {
  colaborador: Colaborador | null;
  jornadas: JornadaLaboral[];
  ubicaciones: UbicacionGPS[];
  loading?: boolean;
}

const GeneradorReportesComponent: React.FC<GeneradorReportesProps> = ({
  colaborador,
  jornadas,
  ubicaciones,
  loading = false
}) => {
  const { usuario } = useAuthStore();
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [tipoReporte, setTipoReporte] = useState<'completo' | 'jornadas' | 'ubicaciones' | 'horas-extras'>('completo');
  const [incluirHorasExtras, setIncluirHorasExtras] = useState(true);
  const [valorHoraOrdinaria, setValorHoraOrdinaria] = useState(4200);

  const generarReportePDF = async () => {
    if (!colaborador) return;

    setGenerandoReporte(true);
    try {
      const datosReporte: DatosReporte = {
        colaborador,
        jornadas: tipoReporte === 'completo' || tipoReporte === 'jornadas' ? jornadas : [],
        ubicaciones: tipoReporte === 'completo' || tipoReporte === 'ubicaciones' ? ubicaciones : undefined,
        calculosHorasExtras: (tipoReporte === 'completo' || tipoReporte === 'horas-extras') && incluirHorasExtras && jornadas.length > 0
          ? CalculadoraHorasExtras.calcularPeriodo(
              jornadas.map(j => ({
                fecha: j.fecha,
                entrada: j.entrada || '08:00',
                salida: j.salida || '17:00',
                descanso_minutos: j.duracion_almuerzo ? parseInt(j.duracion_almuerzo) || 60 : 60
              })),
              valorHoraOrdinaria
            )
          : undefined,
        fechaGeneracion: new Date().toLocaleDateString('es-CO'),
        usuarioGenerador: usuario?.nombre || 'Usuario del sistema',
        tipoReporte
      };

      await GeneradorReportes.generarPDF(datosReporte);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF. Por favor, intenta nuevamente.');
    } finally {
      setGenerandoReporte(false);
    }
  };

  const generarReporteExcel = async () => {
    if (!colaborador) return;

    setGenerandoReporte(true);
    try {
      const datosReporte: DatosReporte = {
        colaborador,
        jornadas: tipoReporte === 'completo' || tipoReporte === 'jornadas' ? jornadas : [],
        ubicaciones: tipoReporte === 'completo' || tipoReporte === 'ubicaciones' ? ubicaciones : undefined,
        calculosHorasExtras: (tipoReporte === 'completo' || tipoReporte === 'horas-extras') && incluirHorasExtras && jornadas.length > 0
          ? CalculadoraHorasExtras.calcularPeriodo(
              jornadas.map(j => ({
                fecha: j.fecha,
                entrada: j.entrada || '08:00',
                salida: j.salida || '17:00',
                descanso_minutos: j.duracion_almuerzo ? parseInt(j.duracion_almuerzo) || 60 : 60
              })),
              valorHoraOrdinaria
            )
          : undefined,
        fechaGeneracion: new Date().toLocaleDateString('es-CO'),
        usuarioGenerador: usuario?.nombre || 'Usuario del sistema',
        tipoReporte
      };

      await GeneradorReportes.generarExcel(datosReporte);
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el reporte Excel. Por favor, intenta nuevamente.');
    } finally {
      setGenerandoReporte(false);
    }
  };

  const obtenerEstadisticasReporte = () => {
    if (!colaborador) return null;

    const totalJornadas = tipoReporte === 'completo' || tipoReporte === 'jornadas' ? jornadas.length : 0;
    const totalUbicaciones = tipoReporte === 'completo' || tipoReporte === 'ubicaciones' ? ubicaciones.length : 0;
    
    let horasExtrasInfo = null;
    if ((tipoReporte === 'completo' || tipoReporte === 'horas-extras') && incluirHorasExtras && jornadas.length > 0) {
      const calculo = CalculadoraHorasExtras.calcularPeriodo(
        jornadas.map(j => ({
          fecha: j.fecha,
          entrada: j.entrada || '08:00',
          salida: j.salida || '17:00',
          descanso_minutos: 60
        })),
        valorHoraOrdinaria
      );
      horasExtrasInfo = calculo.resumen;
    }

    return { totalJornadas, totalUbicaciones, horasExtrasInfo };
  };

  const estadisticas = obtenerEstadisticasReporte();

  if (loading) {
    return (
      <div className="generador-reportes__loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos para reportes...</p>
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="generador-reportes__sin-datos">
        <div className="sin-datos-icon">📊</div>
        <h3>Selecciona un colaborador</h3>
        <p>Para generar reportes, primero selecciona un colaborador desde la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="generador-reportes">
      {/* Información del colaborador */}
      <div className="generador-reportes__header">
        <div className="colaborador-info">
          <h3>📋 Generación de Reportes</h3>
          <div className="colaborador-datos">
            <span className="colaborador-nombre">
              {colaborador.nombre} {colaborador.apellido}
            </span>
            <span className="colaborador-documento">
              ID: {colaborador.documento}
            </span>
          </div>
        </div>
      </div>

      {/* Configuración del reporte */}
      <div className="generador-reportes__configuracion">
        <h4>🛠️ Configuración del Reporte</h4>
        
        <div className="config-grid">
          <div className="config-grupo">
            <label htmlFor="tipo-reporte">📋 Tipo de reporte:</label>
            <select
              id="tipo-reporte"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as any)}
              className="config-select"
            >
              <option value="completo">📊 Reporte Completo</option>
              <option value="jornadas">📅 Solo Jornadas Laborales</option>
              <option value="ubicaciones">🗺️ Solo Ubicaciones GPS</option>
              <option value="horas-extras">⏰ Solo Horas Extras</option>
            </select>
          </div>

          {(tipoReporte === 'completo' || tipoReporte === 'horas-extras') && (
            <>
              <div className="config-grupo">
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={incluirHorasExtras}
                    onChange={(e) => setIncluirHorasExtras(e.target.checked)}
                  />
                  <span className="checkbox-label">⏰ Incluir cálculo de horas extras</span>
                </label>
              </div>

              {incluirHorasExtras && (
                <div className="config-grupo">
                  <label htmlFor="valor-hora-reporte">💰 Valor hora ordinaria:</label>
                  <div className="input-moneda">
                    <span className="moneda-signo">$</span>
                    <input
                      id="valor-hora-reporte"
                      type="number"
                      value={valorHoraOrdinaria}
                      onChange={(e) => setValorHoraOrdinaria(Number(e.target.value))}
                      min="0"
                      step="100"
                      className="config-input-moneda"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Vista previa del contenido */}
      <div className="generador-reportes__preview">
        <h4>👁️ Vista Previa del Contenido</h4>
        
        {estadisticas && (
          <div className="preview-grid">
            <div className="preview-seccion">
              <div className="preview-titulo">👤 Información Personal</div>
              <div className="preview-items">
                <div className="preview-item">
                  <span className="preview-label">Nombre:</span>
                  <span className="preview-valor">{colaborador.nombre} {colaborador.apellido}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Documento:</span>
                  <span className="preview-valor">{colaborador.documento}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Regional:</span>
                  <span className="preview-valor">{colaborador.regional_nombre}</span>
                </div>
              </div>
            </div>

            {estadisticas.totalJornadas > 0 && (
              <div className="preview-seccion">
                <div className="preview-titulo">📅 Jornadas Laborales</div>
                <div className="preview-items">
                  <div className="preview-item">
                    <span className="preview-label">Total jornadas:</span>
                    <span className="preview-valor">{estadisticas.totalJornadas}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Período:</span>
                    <span className="preview-valor">
                      {jornadas[jornadas.length - 1]?.fecha} - {jornadas[0]?.fecha}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {estadisticas.totalUbicaciones > 0 && (
              <div className="preview-seccion">
                <div className="preview-titulo">🗺️ Ubicaciones GPS</div>
                <div className="preview-items">
                  <div className="preview-item">
                    <span className="preview-label">Total ubicaciones:</span>
                    <span className="preview-valor">{estadisticas.totalUbicaciones}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Tipos:</span>
                    <span className="preview-valor">Entrada y Salida</span>
                  </div>
                </div>
              </div>
            )}

            {estadisticas.horasExtrasInfo && (
              <div className="preview-seccion">
                <div className="preview-titulo">⏰ Horas Extras</div>
                <div className="preview-items">
                  <div className="preview-item">
                    <span className="preview-label">Total extras:</span>
                    <span className="preview-valor">
                      {CalculadoraHorasExtras.formatearHoras(estadisticas.horasExtrasInfo.total_horas_extras)}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Días con extras:</span>
                    <span className="preview-valor">{estadisticas.horasExtrasInfo.dias_con_extras}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botones de generación */}
      <div className="generador-reportes__acciones">
        <div className="acciones-grid">
          <button
            type="button"
            onClick={generarReportePDF}
            disabled={generandoReporte}
            className="btn-generar pdf"
          >
            {generandoReporte ? (
              <>
                <span className="spinner-small"></span>
                Generando...
              </>
            ) : (
              <>
                📄 Descargar PDF
              </>
            )}
          </button>

          <button
            type="button"
            onClick={generarReporteExcel}
            disabled={generandoReporte}
            className="btn-generar excel"
          >
            {generandoReporte ? (
              <>
                <span className="spinner-small"></span>
                Generando...
              </>
            ) : (
              <>
                📊 Descargar Excel
              </>
            )}
          </button>
        </div>

        <div className="acciones-info">
          <div className="info-item">
            <span className="info-icon">📋</span>
            <span className="info-text">
              Los reportes incluyen logo corporativo, metadatos de generación y formato profesional
            </span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔒</span>
            <span className="info-text">
              Generado por: <strong>{usuario?.nombre || 'Usuario del sistema'}</strong>
            </span>
          </div>
          <div className="info-item">
            <span className="info-icon">📅</span>
            <span className="info-text">
              Fecha: <strong>{new Date().toLocaleDateString('es-CO')}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Información legal */}
      <div className="generador-reportes__legal">
        <details>
          <summary>📋 Información Legal y Privacidad</summary>
          <div className="legal-content">
            <h5>Tratamiento de Datos Personales</h5>
            <ul>
              <li>Los reportes contienen información confidencial del colaborador</li>
              <li>Uso restringido para fines laborales y administrativos</li>
              <li>Cumplimiento de la Ley 1581 de 2012 (Habeas Data)</li>
              <li>Prohibida la distribución no autorizada</li>
            </ul>
            
            <h5>Precisión de la Información</h5>
            <ul>
              <li>Datos extraídos del sistema de control de acceso OXITRANS</li>
              <li>Cálculos de horas extras según Código Sustantivo del Trabajo</li>
              <li>Ubicaciones GPS registradas automáticamente</li>
              <li>Reporte generado automáticamente el {new Date().toLocaleDateString('es-CO')}</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default GeneradorReportesComponent;