/**
 * REPORTES CONTROLLER - SISTEMA OXITRANS
 * =====================================
 * 
 * MEJORAS IMPLEMENTADAS (5 REQUERIMIENTOS):
 * 
 * 1. ✅ REPORTE GENERAL DESDE PÁGINA PRINCIPAL
 *    - Integrado ReportePorFechasComponent en ReportesPage.tsx
 *    - Accesible desde sidebar del dashboard principal
 * 
 * 2. ✅ FILTRO POR COLABORADOR ESPECÍFICO  
 *    - Añadido parámetro 'colaboradorId' en query parameters
 *    - Implementado en ConsultasColaboradoresPage para reportes específicos
 * 
 * 3. ✅ CORRECCIÓN CÁLCULO HORAS EXTRAS
 *    - ANTES: Usaba 'no_remunerado' incorrectamente
 *    - AHORA: Usa específicamente 'horas_extra' de tabla novedades
 *    - Corrige problema de horas extras mostrando 0
 * 
 * 4. ✅ COLUMNAS HORA INICIO/FIN EN EXCEL
 *    - Agregadas columnas 'HORA INICIO' y 'HORA FINAL'
 *    - Formato TIME_FORMAT('%H:%i') para mejor legibilidad
 * 
 * 5. ✅ COMENTARIOS SOBRE CÁLCULOS AUTOMÁTICOS
 *    - Documentación extensa sobre cambios en lógica de horas extras
 *    - Separación clara entre novedades tipo 'horas_extra' y otras
 * 
 * FECHA IMPLEMENTACIÓN: Enero 2025
 * =====================================
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mysql from 'mysql2/promise';
import * as ExcelJS from 'exceljs';

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_acceso_oxitrans',
  charset: 'utf8mb4',
  timezone: 'local'
};

// Interfaces para el reporte
interface JornadaReporte {
  nombre_completo: string;
  documento: string;
  regional: string;
  fecha_inicio_turno: string;
  fecha_fin_turno: string;
  hora_inicio: string;          // Nueva columna hora inicio
  hora_final: string;           // Nueva columna hora final
  descanso_manana: string;
  almuerzo: string;
  descanso_tarde: string;
  cantidad_horas_trabajadas: string;
  cantidad_horas_extra: string;
  periodo_consulta: string;
  novedad: string;
  tiempo_novedad: string;
}

export class ReportesController {

  /**
   * Generar reporte completo de jornadas por rango de fechas
   * GET /api/reportes/jornadas-completo
   */
  static async generarReporteJornadasCompleto(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { fechaInicio, fechaFin, formato = 'xlsx', colaboradorId } = req.query as {
        fechaInicio: string;
        fechaFin: string;
        formato?: string;
        colaboradorId?: string;
      };

      console.log(`🔍 Generando reporte de jornadas - Rango: ${fechaInicio} a ${fechaFin}${colaboradorId ? ` - Colaborador: ${colaboradorId}` : ''}`);

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Construir condición WHERE para filtro por colaborador
        const colaboradorCondition = colaboradorId ? 'AND u.id = ?' : '';
        const colaboradorParams = colaboradorId ? [parseInt(colaboradorId)] : [];

        // Consulta SQL actualizada con filtro por colaborador y mejor cálculo de horas extras
        const reporteQuery = `
          SELECT 
            CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
            u.documento,
            COALESCE(r.nombre, 'Sin regional') as regional,
            DATE_FORMAT(jl.entrada, '%d/%m/%Y') as fecha_inicio_turno,
            DATE_FORMAT(jl.salida, '%d/%m/%Y') as fecha_fin_turno,
            TIME_FORMAT(jl.entrada, '%H:%i') as hora_inicio,
            TIME_FORMAT(jl.salida, '%H:%i') as hora_final,
            CASE 
              WHEN jl.descanso_manana_inicio IS NOT NULL AND jl.descanso_manana_fin IS NOT NULL 
              THEN CONCAT(TIME_FORMAT(jl.descanso_manana_inicio, '%H:%i'), ' - ', TIME_FORMAT(jl.descanso_manana_fin, '%H:%i'))
              ELSE 'No aplicó'
            END as descanso_manana,
            CASE 
              WHEN jl.almuerzo_inicio IS NOT NULL AND jl.almuerzo_fin IS NOT NULL 
              THEN CONCAT(TIME_FORMAT(jl.almuerzo_inicio, '%H:%i'), ' - ', TIME_FORMAT(jl.almuerzo_fin, '%H:%i'))
              ELSE 'No aplicó'
            END as almuerzo,
            'No aplicó' as descanso_tarde,
            CONCAT(
              FLOOR(jl.horas_trabajadas), ' horas ', 
              ROUND((jl.horas_trabajadas - FLOOR(jl.horas_trabajadas)) * 60), ' minutos'
            ) as cantidad_horas_trabajadas,
            -- ===============================================
            -- REQUERIMIENTO 3: CORRECCIÓN DE HORAS EXTRAS
            -- ===============================================
            -- ANTES: Se usaba 'no_remunerado' de forma incorrecta
            -- AHORA: Se usa específicamente 'horas_extra' de la tabla novedades
            -- Esto corrige el problema donde las horas extras aparecían como 0
            -- a pesar de estar registradas en la tabla novedades
            -- ===============================================
            COALESCE(
              (SELECT CONCAT(SUM(n2.horas), ' horas')
               FROM novedades n2 
               WHERE n2.usuarioId = u.id 
               AND n2.tipo = 'horas_extra'
               AND DATE(n2.fechaInicio) = DATE(jl.entrada)
               GROUP BY DATE(n2.fechaInicio)
              ), 
              '0 horas'
            ) as cantidad_horas_extra,
            CONCAT(
              DATE_FORMAT(?, '%d/%m/%Y'), ' hasta ', DATE_FORMAT(?, '%d/%m/%Y')
            ) as periodo_consulta,
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo != 'horas_extra' AND n.tipo IS NOT NULL
                  THEN n.tipo
                  ELSE NULL
                END
                SEPARATOR ', '
              ), 
              'Sin novedades'
            ) as novedad,
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo != 'horas_extra' AND n.horas IS NOT NULL
                  THEN CONCAT(n.horas, ' horas')
                  ELSE NULL
                END
                SEPARATOR ', '
              ), 
              'Sin tiempo adicional'
            ) as tiempo_novedad
          FROM jornadas_laborales jl
          INNER JOIN usuarios u ON jl.usuario_id = u.id
          LEFT JOIN regionales r ON u.regional_id = r.id
          LEFT JOIN novedades n ON u.id = n.usuarioId 
            AND DATE(n.fechaInicio) BETWEEN ? AND ?
            AND n.tipo != 'horas_extra'
          WHERE DATE(jl.entrada) BETWEEN ? AND ?
          ${colaboradorCondition}
          GROUP BY jl.id, u.id, jl.entrada
          ORDER BY u.nombre, u.apellido, jl.entrada
        `;

        const queryParams = [
          fechaInicio, fechaFin, // Para periodo_consulta
          fechaInicio, fechaFin, // Para filtro novedades (no horas extra)
          fechaInicio, fechaFin, // Para filtro jornadas
          ...colaboradorParams   // Para filtro por colaborador si existe
        ];

        const [rows] = await connection.execute(reporteQuery, queryParams);

        const datos = rows as JornadaReporte[];
        
        console.log(`📊 Datos obtenidos: ${datos.length} registros`);

        if (formato === 'xlsx') {
          const excelBuffer = await ReportesController.generarExcel(datos, fechaInicio, fechaFin);
          
          const nombreArchivo = `Reporte_Jornadas_${fechaInicio.replace(/-/g, '')}_${fechaFin.replace(/-/g, '')}.xlsx`;
          
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
          res.setHeader('Content-Length', excelBuffer.length);
          
          res.send(excelBuffer);
        } else {
          // Formato CSV
          res.status(501).json({ 
            success: false, 
            message: 'Formato CSV en desarrollo. Use formato xlsx.' 
          });
        }

      } finally {
        await connection.end();
      }

    } catch (error: any) {
      console.error('❌ Error generando reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al generar reporte',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vista previa del reporte (primeras 10 filas)
   * GET /api/reportes/preview-jornadas
   */
  static async previewReporteJornadas(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { fechaInicio, fechaFin, colaboradorId } = req.query as {
        fechaInicio: string;
        fechaFin: string;
        colaboradorId?: string;
      };

      console.log(`👀 Vista previa reporte - Rango: ${fechaInicio} a ${fechaFin}${colaboradorId ? ` - Colaborador: ${colaboradorId}` : ''}`);

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Construir condición WHERE para filtro por colaborador
        const colaboradorCondition = colaboradorId ? 'AND u.id = ?' : '';
        const colaboradorParams = colaboradorId ? [parseInt(colaboradorId)] : [];

        // Misma consulta pero con LIMIT para preview
        const previewQuery = `
          SELECT 
            CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
            u.documento,
            COALESCE(r.nombre, 'Sin regional') as regional,
            DATE_FORMAT(jl.entrada, '%d/%m/%Y') as fecha_inicio_turno,
            DATE_FORMAT(jl.salida, '%d/%m/%Y') as fecha_fin_turno,
            TIME_FORMAT(jl.entrada, '%H:%i') as hora_inicio,
            TIME_FORMAT(jl.salida, '%H:%i') as hora_final,
            CASE 
              WHEN jl.descanso_manana_inicio IS NOT NULL AND jl.descanso_manana_fin IS NOT NULL 
              THEN CONCAT(TIME_FORMAT(jl.descanso_manana_inicio, '%H:%i'), ' - ', TIME_FORMAT(jl.descanso_manana_fin, '%H:%i'))
              ELSE 'No aplicó'
            END as descanso_manana,
            CASE 
              WHEN jl.almuerzo_inicio IS NOT NULL AND jl.almuerzo_fin IS NOT NULL 
              THEN CONCAT(TIME_FORMAT(jl.almuerzo_inicio, '%H:%i'), ' - ', TIME_FORMAT(jl.almuerzo_fin, '%H:%i'))
              ELSE 'No aplicó'
            END as almuerzo,
            'No aplicó' as descanso_tarde,
            CONCAT(
              FLOOR(jl.horas_trabajadas), ' horas ', 
              ROUND((jl.horas_trabajadas - FLOOR(jl.horas_trabajadas)) * 60), ' minutos'
            ) as cantidad_horas_trabajadas,
            -- ===============================================
            -- REQUERIMIENTO 3: CORRECCIÓN DE HORAS EXTRAS (VISTA PREVIA)
            -- ===============================================
            -- Vista previa con el mismo cálculo corregido de horas extras
            -- Se usa específicamente 'horas_extra' en lugar de 'no_remunerado'
            -- para obtener las horas extras reales de la tabla novedades
            -- ===============================================
            COALESCE(
              (SELECT CONCAT(SUM(n2.horas), ' horas')
               FROM novedades n2 
               WHERE n2.usuarioId = u.id 
               AND n2.tipo = 'horas_extra'
               AND DATE(n2.fechaInicio) = DATE(jl.entrada)
               GROUP BY DATE(n2.fechaInicio)
              ), 
              '0 horas'
            ) as cantidad_horas_extra,
            CONCAT(
              DATE_FORMAT(?, '%d/%m/%Y'), ' hasta ', DATE_FORMAT(?, '%d/%m/%Y')
            ) as periodo_consulta,
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo != 'horas_extra' AND n.tipo IS NOT NULL
                  THEN n.tipo
                  ELSE NULL
                END
                SEPARATOR ', '
              ), 
              'Sin novedades'
            ) as novedad,
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo != 'horas_extra' AND n.horas IS NOT NULL
                  THEN CONCAT(n.horas, ' horas')
                  ELSE NULL
                END
                SEPARATOR ', '
              ), 
              'Sin tiempo adicional'
            ) as tiempo_novedad
          FROM jornadas_laborales jl
          INNER JOIN usuarios u ON jl.usuario_id = u.id
          LEFT JOIN regionales r ON u.regional_id = r.id
          LEFT JOIN novedades n ON u.id = n.usuarioId 
            AND DATE(n.fechaInicio) BETWEEN ? AND ?
            AND n.tipo != 'horas_extra'
          WHERE DATE(jl.entrada) BETWEEN ? AND ?
          ${colaboradorCondition}
          GROUP BY jl.id, u.id, jl.entrada
          ORDER BY u.nombre, u.apellido, jl.entrada
          LIMIT 10
        `;

        const queryParams = [
          fechaInicio, fechaFin, // Para periodo_consulta
          fechaInicio, fechaFin, // Para filtro novedades (no horas extra)
          fechaInicio, fechaFin, // Para filtro jornadas
          ...colaboradorParams   // Para filtro por colaborador si existe
        ];

        const [rows] = await connection.execute(previewQuery, queryParams);

        // Conteo total para mostrar información adicional
        const countQuery = `
          SELECT COUNT(DISTINCT jl.id) as total
          FROM jornadas_laborales jl
          INNER JOIN usuarios u ON jl.usuario_id = u.id
          WHERE DATE(jl.entrada) BETWEEN ? AND ?
          ${colaboradorCondition}
        `;

        const countParams = [fechaInicio, fechaFin, ...colaboradorParams];
        const [countRows] = await connection.execute(countQuery, countParams);
        const total = (countRows as any)[0].total;

        res.json({
          success: true,
          data: {
            preview: rows,
            totalRegistros: total,
            mensaje: `Vista previa de ${(rows as any[]).length} de ${total} registros totales`
          }
        });

      } finally {
        await connection.end();
      }

    } catch (error: any) {
      console.error('❌ Error en vista previa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Generar archivo Excel con formato específico OXITRANS
   */
  private static async generarExcel(datos: JornadaReporte[], fechaInicio: string, fechaFin: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Jornadas Laborales');

    // Configurar propiedades del documento
    workbook.creator = 'OXITRANS S.A.S - Sistema Control de Acceso';
    workbook.created = new Date();

    // ==========================================
    // ENCABEZADO CORPORATIVO
    // ==========================================
    
    // Título principal
    worksheet.mergeCells('A1:O1');
    const tituloCell = worksheet.getCell('A1');
    tituloCell.value = 'OXITRANS S.A.S - CONTROL DE ACCESO';
    tituloCell.font = { name: 'Arial', size: 16, bold: true };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    tituloCell.font.color = { argb: 'FFFFFFFF' };

    // Subtítulo
    worksheet.mergeCells('A2:O2');
    const subtituloCell = worksheet.getCell('A2');
    subtituloCell.value = 'REPORTE DE JORNADAS LABORALES';
    subtituloCell.font = { name: 'Arial', size: 14, bold: true };
    subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Período
    worksheet.mergeCells('A3:O3');
    const periodoCell = worksheet.getCell('A3');
    periodoCell.value = `Período: ${fechaInicio.split('-').reverse().join('/')} hasta ${fechaFin.split('-').reverse().join('/')}`;
    periodoCell.font = { name: 'Arial', size: 12, bold: true };
    periodoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fecha de generación
    worksheet.mergeCells('A4:O4');
    const fechaGenCell = worksheet.getCell('A4');
    fechaGenCell.value = `Generado el: ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`;
    fechaGenCell.font = { name: 'Arial', size: 10, italic: true };
    fechaGenCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Espacio
    worksheet.getRow(5).height = 10;

    // ==========================================
    // ENCABEZADOS DE COLUMNAS
    // ==========================================
    
    const headers = [
      'NOMBRE',
      'DOCUMENTO',
      'REGIONAL ASIGNADA',
      'FECHA DE INICIO DE TURNO',
      'FECHA FINAL DE TURNO',
      'HORA INICIO',
      'HORA FINAL', 
      'DESCANSO MAÑANA',
      'ALMUERZO',
      'DESCANSO TARDE',
      'CANTIDAD DE HORAS TRABAJADAS',
      'CANTIDAD HORAS EXTRA',
      'PERÍODO DE CONSULTA',
      'NOVEDAD',
      'TIEMPO DE LA NOVEDAD'
    ];

    const headerRow = worksheet.getRow(6);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headerRow.height = 30;

    // ==========================================
    // DATOS DE FILAS
    // ==========================================
    
    datos.forEach((fila, index) => {
      const rowNumber = index + 7;
      const dataRow = worksheet.getRow(rowNumber);
      
      const valores = [
        fila.nombre_completo,
        fila.documento,
        fila.regional,
        fila.fecha_inicio_turno,
        fila.fecha_fin_turno,
        fila.hora_inicio,        // Nueva columna hora inicio
        fila.hora_final,         // Nueva columna hora final
        fila.descanso_manana,
        fila.almuerzo,
        fila.descanso_tarde,
        fila.cantidad_horas_trabajadas,
        fila.cantidad_horas_extra,
        fila.periodo_consulta,
        fila.novedad,
        fila.tiempo_novedad
      ];

      valores.forEach((valor, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1);
        cell.value = valor;
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        // Alternar colores de filas
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      dataRow.height = 25;
    });

    // ==========================================
    // AJUSTE DE COLUMNAS
    // ==========================================
    
    const columnWidths = [25, 15, 20, 18, 18, 12, 12, 20, 20, 15, 25, 20, 25, 20, 25];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // ==========================================
    // PIE DE PÁGINA
    // ==========================================
    
    const lastRow = datos.length + 8;
    worksheet.mergeCells(`A${lastRow}:O${lastRow}`);
    const footerCell = worksheet.getCell(`A${lastRow}`);
    footerCell.value = `Total de registros: ${datos.length} | Sistema OXITRANS - Control de Acceso v2025`;
    footerCell.font = { name: 'Arial', size: 9, italic: true };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}