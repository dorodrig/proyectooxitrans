// ====================================
// 📊 CALCULADORA DE HORAS EXTRAS - COMPONENTE
// Interface visual para cálculos según legislación colombiana
// ====================================

import React, { useState, useEffect } from 'react';
import { CalculadoraHorasExtras } from '../../services/calculadoraHorasExtras';
import { formatearFechaCorta, formatearDiaSemana, formatearSoloHora } from '../../utils/formatoFechas';
import type { CalculoDetallado, ResumenPeriodo, JornadaDiaria } from '../../services/calculadoraHorasExtras';
import type { JornadaLaboral } from '../../services/colaboradoresService';

interface CalculadoraHorasExtrasProps {
  jornadas: JornadaLaboral[];
  loading?: boolean;
}

const CalculadoraHorasExtrasComponent: React.FC<CalculadoraHorasExtrasProps> = ({
  jornadas,
  loading = false
}) => {
  const [calculos, setCalculos] = useState<CalculoDetallado[]>([]);
  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
  const [valorHoraOrdinaria, setValorHoraOrdinaria] = useState<number>(4200); // Salario mínimo 2025 / 240 horas
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState<string>('');

  useEffect(() => {
    if (jornadas.length > 0) {
      calcularHorasExtras();
    }
  }, [jornadas, valorHoraOrdinaria]);

  const calcularHorasExtras = () => {
    // Convertir jornadas a formato requerido
    const jornadasParaCalculo: JornadaDiaria[] = jornadas.map(jornada => ({
      fecha: jornada.fecha,
      entrada: jornada.entrada || '08:00',
      salida: jornada.salida || '17:00',
      descanso_minutos: jornada.duracion_almuerzo ? parseInt(jornada.duracion_almuerzo) || 60 : 60,
      observaciones: jornada.observaciones_entrada || jornada.observaciones_salida
    }));

    const resultado = CalculadoraHorasExtras.calcularPeriodo(jornadasParaCalculo, valorHoraOrdinaria);
    setCalculos(resultado.calculos);
    setResumen(resultado.resumen);
  };

  const calculosFiltrados = filtroFecha 
    ? calculos.filter(c => c.fecha === filtroFecha)
    : calculos;

  const fechasDisponibles = [...new Set(calculos.map(c => c.fecha))].sort().reverse();

  if (loading) {
    return (
      <div className="calculadora-horas-extras__loading">
        <div className="loading-spinner"></div>
        <p>Calculando horas extras...</p>
      </div>
    );
  }

  if (jornadas.length === 0) {
    return (
      <div className="calculadora-horas-extras__sin-datos">
        <div className="sin-datos-icon">📊</div>
        <h3>Sin datos para calcular</h3>
        <p>No hay jornadas registradas para este colaborador.</p>
      </div>
    );
  }

  return (
    <div className="calculadora-horas-extras">
      {/* Controles */}
      <div className="calculadora-horas-extras__controles">
        <div className="control-grupo">
          <label htmlFor="valor-hora">💰 Valor hora ordinaria:</label>
          <div className="input-moneda">
            <span className="moneda-signo">$</span>
            <input
              id="valor-hora"
              type="number"
              value={valorHoraOrdinaria}
              onChange={(e) => setValorHoraOrdinaria(Number(e.target.value))}
              min="0"
              step="100"
            />
          </div>
        </div>

        <div className="control-grupo">
          <label htmlFor="filtro-fecha">📅 Filtrar por fecha:</label>
          <select
            id="filtro-fecha"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          >
            <option value="">📊 Todas las fechas</option>
            {fechasDisponibles.map(fecha => (
              <option key={fecha} value={fecha}>
                {formatearDiaSemana(fecha)} {formatearFechaCorta(fecha)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setMostrarDetalles(!mostrarDetalles)}
          className="btn-toggle-detalles"
        >
          {mostrarDetalles ? '📊 Vista Resumen' : '🔍 Ver Detalles'}
        </button>
      </div>

      {/* Resumen ejecutivo */}
      {resumen && (
        <div className="calculadora-horas-extras__resumen">
          <h3>📈 Resumen del Período</h3>
          <div className="resumen-grid">
            <div className="resumen-item">
              <div className="resumen-valor">{resumen.total_dias_laborados}</div>
              <div className="resumen-label">Días laborados</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-valor">
                {CalculadoraHorasExtras.formatearHoras(resumen.total_horas_ordinarias)}
              </div>
              <div className="resumen-label">Horas ordinarias</div>
            </div>
            <div className="resumen-item destacado">
              <div className="resumen-valor">
                {CalculadoraHorasExtras.formatearHoras(resumen.total_horas_extras)}
              </div>
              <div className="resumen-label">Horas extras</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-valor">{resumen.promedio_horas_dia}h</div>
              <div className="resumen-label">Promedio/día</div>
            </div>
            {resumen.valor_total_periodo && (
              <div className="resumen-item monetario">
                <div className="resumen-valor">
                  {CalculadoraHorasExtras.formatearValor(resumen.valor_total_periodo)}
                </div>
                <div className="resumen-label">Total período</div>
              </div>
            )}
          </div>

          {/* Desglose de horas extras */}
          {resumen.total_horas_extras > 0 && (
            <div className="resumen-extras">
              <h4>🕐 Desglose Horas Extras</h4>
              <div className="extras-breakdown">
                <div className="extras-item diurnas">
                  <span className="extras-icono">☀️</span>
                  <span className="extras-tipo">Diurnas (25%)</span>
                  <span className="extras-cantidad">
                    {CalculadoraHorasExtras.formatearHoras(resumen.total_horas_extras_diurnas)}
                  </span>
                  {resumen.valor_total_extras && valorHoraOrdinaria && (
                    <span className="extras-valor">
                      {CalculadoraHorasExtras.formatearValor(
                        resumen.total_horas_extras_diurnas * valorHoraOrdinaria * 1.25
                      )}
                    </span>
                  )}
                </div>
                <div className="extras-item nocturnas">
                  <span className="extras-icono">🌙</span>
                  <span className="extras-tipo">Nocturnas (75%)</span>
                  <span className="extras-cantidad">
                    {CalculadoraHorasExtras.formatearHoras(resumen.total_horas_extras_nocturnas)}
                  </span>
                  {resumen.valor_total_extras && valorHoraOrdinaria && (
                    <span className="extras-valor">
                      {CalculadoraHorasExtras.formatearValor(
                        resumen.total_horas_extras_nocturnas * valorHoraOrdinaria * 1.75
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabla detallada */}
      <div className="calculadora-horas-extras__tabla">
        <div className="tabla-header">
          <h3>📋 Detalle por Día</h3>
          <span className="tabla-contador">
            {calculosFiltrados.length} {calculosFiltrados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="tabla-container">
          <table className="tabla-calculos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>H. Trabajadas</th>
                <th>H. Ordinarias</th>
                <th>H. Extras</th>
                {mostrarDetalles && <th>Desglose</th>}
                <th>Valor Día</th>
              </tr>
            </thead>
            <tbody>
              {calculosFiltrados.map((calculo, index) => {
                const totalExtras = calculo.horas_extras_diurnas + calculo.horas_extras_nocturnas;
                
                return (
                  <tr key={index} className={totalExtras > 0 ? 'con-extras' : ''}>
                    <td className="fecha-cell">
                      <div className="fecha-principal">
                        {formatearFechaCorta(calculo.fecha)}
                      </div>
                      <div className="fecha-dia">
                        {formatearDiaSemana(calculo.fecha)}
                      </div>
                    </td>
                    <td>{formatearSoloHora(calculo.entrada)}</td>
                    <td>{formatearSoloHora(calculo.salida)}</td>
                    <td className="horas-cell">
                      <span className="horas-valor">
                        {CalculadoraHorasExtras.formatearHoras(calculo.horas_trabajadas)}
                      </span>
                    </td>
                    <td className="horas-cell ordinarias">
                      {CalculadoraHorasExtras.formatearHoras(calculo.horas_ordinarias)}
                    </td>
                    <td className="horas-cell extras">
                      {totalExtras > 0 ? (
                        <div className="extras-breakdown-cell">
                          <span className="extras-total">
                            {CalculadoraHorasExtras.formatearHoras(totalExtras)}
                          </span>
                          {(calculo.horas_extras_diurnas > 0 || calculo.horas_extras_nocturnas > 0) && (
                            <div className="extras-detalle">
                              {calculo.horas_extras_diurnas > 0 && (
                                <span className="diurna">☀️ {CalculadoraHorasExtras.formatearHoras(calculo.horas_extras_diurnas)}</span>
                              )}
                              {calculo.horas_extras_nocturnas > 0 && (
                                <span className="nocturna">🌙 {CalculadoraHorasExtras.formatearHoras(calculo.horas_extras_nocturnas)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="sin-extras">-</span>
                      )}
                    </td>
                    {mostrarDetalles && (
                      <td className="desglose-cell">
                        <div className="desglose-detallado">
                          <div className="desglose-linea">
                            <span>Ord. Diurnas:</span>
                            <span>{CalculadoraHorasExtras.formatearHoras(calculo.desglose.ordinarias_diurnas)}</span>
                          </div>
                          <div className="desglose-linea">
                            <span>Ord. Nocturnas:</span>
                            <span>{CalculadoraHorasExtras.formatearHoras(calculo.desglose.ordinarias_nocturnas)}</span>
                          </div>
                          <div className="desglose-linea">
                            <span>Ext. Diurnas:</span>
                            <span>{CalculadoraHorasExtras.formatearHoras(calculo.desglose.extras_diurnas)}</span>
                          </div>
                          <div className="desglose-linea">
                            <span>Ext. Nocturnas:</span>
                            <span>{CalculadoraHorasExtras.formatearHoras(calculo.desglose.extras_nocturnas)}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="valor-cell">
                      {calculo.total_dia ? (
                        <div className="valor-breakdown">
                          <span className="valor-total">
                            {CalculadoraHorasExtras.formatearValor(calculo.total_dia)}
                          </span>
                          {(calculo.valor_extras_diurnas || calculo.valor_extras_nocturnas) && (
                            <span className="valor-extras">
                              +{CalculadoraHorasExtras.formatearValor(
                                (calculo.valor_extras_diurnas || 0) + (calculo.valor_extras_nocturnas || 0)
                              )} extras
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="sin-valor">No configurado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas legales */}
      {resumen && resumen.dias_con_extras > resumen.total_dias_laborados * 0.6 && (
        <div className="calculadora-horas-extras__alerta">
          <div className="alerta-icono">⚠️</div>
          <div className="alerta-contenido">
            <h4>Alerta de Cumplimiento Legal</h4>
            <p>
              El colaborador ha trabajado horas extras en <strong>{resumen.dias_con_extras}</strong> de {resumen.total_dias_laborados} días.
              Revisar cumplimiento del límite de horas extras según Código Sustantivo del Trabajo.
            </p>
          </div>
        </div>
      )}

      {/* Información legal */}
      <div className="calculadora-horas-extras__info-legal">
        <details>
          <summary>📋 Marco Legal - Código Sustantivo del Trabajo</summary>
          <div className="info-legal-content">
            <h4>Artículos 159-164: Trabajo Suplementario</h4>
            <ul>
              <li><strong>Jornada ordinaria:</strong> Máximo 8 horas diarias, 48 semanales</li>
              <li><strong>Horario diurno:</strong> 6:00 AM a 10:00 PM</li>
              <li><strong>Horario nocturno:</strong> 10:00 PM a 6:00 AM</li>
              <li><strong>Recargo horas extras diurnas:</strong> 25% sobre valor hora ordinaria</li>
              <li><strong>Recargo horas extras nocturnas:</strong> 75% sobre valor hora ordinaria</li>
              <li><strong>Límite horas extras:</strong> 2 horas diarias, 12 semanales</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CalculadoraHorasExtrasComponent;