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

      const { fechaInicio, fechaFin, formato = 'xlsx' } = req.query as {
        fechaInicio: string;
        fechaFin: string;
        formato?: string;
      };

      console.log(`🔍 Generando reporte de jornadas - Rango: ${fechaInicio} a ${fechaFin}`);

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Consulta SQL unificada para obtener datos de las 3 tablas
        const reporteQuery = `
          SELECT 
            CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
            u.documento,
            COALESCE(r.nombre, 'Sin regional') as regional,
            DATE_FORMAT(jl.entrada, '%d/%m/%Y') as fecha_inicio_turno,
            DATE_FORMAT(jl.salida, '%d/%m/%Y') as fecha_fin_turno,
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
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo = 'no_remunerado' 
                  THEN CONCAT(n.horas, ' horas')
                  ELSE NULL
                END
                SEPARATOR ', '
              ), 
              '0 horas'
            ) as cantidad_horas_extra,
            CONCAT(
              DATE_FORMAT(?, '%d/%m/%Y'), ' hasta ', DATE_FORMAT(?, '%d/%m/%Y')
            ) as periodo_consulta,
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo != 'no_remunerado' AND n.tipo IS NOT NULL
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
                  WHEN n.tipo != 'no_remunerado' AND n.horas IS NOT NULL
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
          WHERE DATE(jl.entrada) BETWEEN ? AND ?
          GROUP BY jl.id, u.id, jl.entrada
          ORDER BY u.nombre, u.apellido, jl.entrada
        `;

        const [rows] = await connection.execute(reporteQuery, [
          fechaInicio, fechaFin, // Para periodo_consulta
          fechaInicio, fechaFin, // Para filtro novedades
          fechaInicio, fechaFin  // Para filtro jornadas
        ]);

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

      const { fechaInicio, fechaFin } = req.query as {
        fechaInicio: string;
        fechaFin: string;
      };

      console.log(`👀 Vista previa reporte - Rango: ${fechaInicio} a ${fechaFin}`);

      const connection = await mysql.createConnection(dbConfig);
      
      try {
        // Misma consulta pero con LIMIT para preview
        const previewQuery = `
          SELECT 
            CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
            u.documento,
            COALESCE(r.nombre, 'Sin regional') as regional,
            DATE_FORMAT(jl.entrada, '%d/%m/%Y') as fecha_inicio_turno,
            DATE_FORMAT(jl.salida, '%d/%m/%Y') as fecha_fin_turno,
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
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo = 'no_remunerado' 
                  THEN CONCAT(n.horas, ' horas')
                  ELSE NULL
                END
                SEPARATOR ', '
              ), 
              '0 horas'
            ) as cantidad_horas_extra,
            CONCAT(
              DATE_FORMAT(?, '%d/%m/%Y'), ' hasta ', DATE_FORMAT(?, '%d/%m/%Y')
            ) as periodo_consulta,
            COALESCE(
              GROUP_CONCAT(
                CASE 
                  WHEN n.tipo != 'no_remunerado' AND n.tipo IS NOT NULL
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
                  WHEN n.tipo != 'no_remunerado' AND n.horas IS NOT NULL
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
          WHERE DATE(jl.entrada) BETWEEN ? AND ?
          GROUP BY jl.id, u.id, jl.entrada
          ORDER BY u.nombre, u.apellido, jl.entrada
          LIMIT 10
        `;

        const [rows] = await connection.execute(previewQuery, [
          fechaInicio, fechaFin,
          fechaInicio, fechaFin,
          fechaInicio, fechaFin
        ]);

        // Conteo total para mostrar información adicional
        const countQuery = `
          SELECT COUNT(DISTINCT jl.id) as total
          FROM jornadas_laborales jl
          WHERE DATE(jl.entrada) BETWEEN ? AND ?
        `;

        const [countRows] = await connection.execute(countQuery, [fechaInicio, fechaFin]);
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
    worksheet.mergeCells('A1:M1');
    const tituloCell = worksheet.getCell('A1');
    tituloCell.value = 'OXITRANS S.A.S - CONTROL DE ACCESO';
    tituloCell.font = { name: 'Arial', size: 16, bold: true };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    tituloCell.font.color = { argb: 'FFFFFFFF' };

    // Subtítulo
    worksheet.mergeCells('A2:M2');
    const subtituloCell = worksheet.getCell('A2');
    subtituloCell.value = 'REPORTE DE JORNADAS LABORALES';
    subtituloCell.font = { name: 'Arial', size: 14, bold: true };
    subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Período
    worksheet.mergeCells('A3:M3');
    const periodoCell = worksheet.getCell('A3');
    periodoCell.value = `Período: ${fechaInicio.split('-').reverse().join('/')} hasta ${fechaFin.split('-').reverse().join('/')}`;
    periodoCell.font = { name: 'Arial', size: 12, bold: true };
    periodoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fecha de generación
    worksheet.mergeCells('A4:M4');
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
    
    const columnWidths = [25, 15, 20, 18, 18, 20, 20, 15, 25, 20, 25, 20, 25];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // ==========================================
    // PIE DE PÁGINA
    // ==========================================
    
    const lastRow = datos.length + 8;
    worksheet.mergeCells(`A${lastRow}:M${lastRow}`);
    const footerCell = worksheet.getCell(`A${lastRow}`);
    footerCell.value = `Total de registros: ${datos.length} | Sistema OXITRANS - Control de Acceso v2025`;
    footerCell.font = { name: 'Arial', size: 9, italic: true };
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}