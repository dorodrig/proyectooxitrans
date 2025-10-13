// ====================================
// 📊 GENERADOR DE REPORTES - SERVICIO
// Exportación a PDF y Excel con formato profesional
// ====================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Colaborador, JornadaLaboral, UbicacionGPS } from './colaboradoresService';
import type { CalculoDetallado, ResumenPeriodo } from './calculadoraHorasExtras';
import { CalculadoraHorasExtras } from './calculadoraHorasExtras';

// Configuración de la empresa
const EMPRESA_CONFIG = {
  nombre: 'OXITRANS S.A.S',
  nit: '900.123.456-7',
  direccion: 'Calle 123 #45-67, Bogotá D.C.',
  telefono: '+57 (1) 234-5678',
  email: 'info@oxitrans.com',
  web: 'www.oxitrans.com'
};

export interface DatosReporte {
  colaborador: Colaborador;
  jornadas: JornadaLaboral[];
  ubicaciones?: UbicacionGPS[];
  calculosHorasExtras?: {
    calculos: CalculoDetallado[];
    resumen: ResumenPeriodo;
  };
  fechaGeneracion: string;
  usuarioGenerador: string;
  tipoReporte: 'completo' | 'jornadas' | 'ubicaciones' | 'horas-extras';
}

export class GeneradorReportes {

  /**
   * Genera reporte completo en PDF
   */
  static async generarPDF(datos: DatosReporte): Promise<void> {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-CO');
    
    // Configuración de fuentes
    doc.setFont('helvetica');

    // === ENCABEZADO CORPORATIVO ===
    this.agregarEncabezadoPDF(doc);

    // === TÍTULO DEL REPORTE ===
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE CONSULTA COLABORADOR', 20, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${fechaActual}`, 20, 70);
    doc.text(`Por: ${datos.usuarioGenerador}`, 20, 75);

    // === INFORMACIÓN DEL COLABORADOR ===
    let yPos = 90;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL COLABORADOR', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const infoColaborador = [
      ['Nombre Completo', `${datos.colaborador.nombre} ${datos.colaborador.apellido}`],
      ['Documento', datos.colaborador.documento],
      ['Estado', datos.colaborador.estado],
      ['Teléfono', datos.colaborador.telefono || 'No registrado'],
      ['Regional', datos.colaborador.regional_nombre || 'No asignada'],
      ['Departamento', datos.colaborador.departamento || 'No especificado'],
      ['Cargo', datos.colaborador.cargo_nombre || 'No asignado']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Campo', 'Valor']],
      body: infoColaborador,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // === JORNADAS LABORALES ===
    if (datos.jornadas.length > 0) {
      this.agregarSeccionJornadasPDF(doc, datos.jornadas, yPos);
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // === HORAS EXTRAS ===
    if (datos.calculosHorasExtras) {
      // Nueva página para horas extras si es necesario
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      this.agregarSeccionHorasExtrasPDF(doc, datos.calculosHorasExtras, yPos);
    }

    // === UBICACIONES GPS ===
    if (datos.ubicaciones && datos.ubicaciones.length > 0) {
      doc.addPage();
      this.agregarSeccionUbicacionesPDF(doc, datos.ubicaciones, 20);
    }

    // === PIE DE PÁGINA ===
    this.agregarPiePaginaPDF(doc);

    // Descargar archivo
    const nombreArchivo = `OXITRANS_Colaborador_${datos.colaborador.documento}_${fechaActual.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
  }

  /**
   * Genera reporte en Excel
   */
  static async generarExcel(datos: DatosReporte): Promise<void> {
    const workbook = XLSX.utils.book_new();
    const fechaActual = new Date().toLocaleDateString('es-CO');

    // === HOJA 1: INFORMACIÓN GENERAL ===
    const hojaInfo = this.crearHojaInformacionGeneral(datos);
    XLSX.utils.book_append_sheet(workbook, hojaInfo, 'Información General');

    // === HOJA 2: JORNADAS LABORALES ===
    if (datos.jornadas.length > 0) {
      const hojaJornadas = this.crearHojaJornadas(datos.jornadas);
      XLSX.utils.book_append_sheet(workbook, hojaJornadas, 'Jornadas Laborales');
    }

    // === HOJA 3: HORAS EXTRAS ===
    if (datos.calculosHorasExtras) {
      const hojaHorasExtras = this.crearHojaHorasExtras(datos.calculosHorasExtras);
      XLSX.utils.book_append_sheet(workbook, hojaHorasExtras, 'Horas Extras');
    }

    // === HOJA 4: UBICACIONES GPS ===
    if (datos.ubicaciones && datos.ubicaciones.length > 0) {
      const hojaUbicaciones = this.crearHojaUbicaciones(datos.ubicaciones);
      XLSX.utils.book_append_sheet(workbook, hojaUbicaciones, 'Ubicaciones GPS');
    }

    // Descargar archivo
    const nombreArchivo = `OXITRANS_Colaborador_${datos.colaborador.documento}_${fechaActual.replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  }

  // ====================================
  // MÉTODOS AUXILIARES PARA PDF
  // ====================================

  private static agregarEncabezadoPDF(doc: jsPDF): void {
    // Logo placeholder (se puede reemplazar con imagen real)
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(20, 10, 20, 20, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('OX', 27, 23);

    // Información de la empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(EMPRESA_CONFIG.nombre, 50, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIT: ${EMPRESA_CONFIG.nit}`, 50, 26);
    doc.text(EMPRESA_CONFIG.direccion, 50, 30);

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
  }

  private static agregarSeccionJornadasPDF(doc: jsPDF, jornadas: JornadaLaboral[], yPos: number): void {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('JORNADAS LABORALES', 20, yPos);

    const datosJornadas = jornadas.slice(0, 10).map(jornada => [
      jornada.fecha,
      jornada.entrada || 'N/A',
      jornada.salida || 'N/A',
      jornada.duracion_total || 'N/A',
      jornada.horas_trabajadas ? `${jornada.horas_trabajadas}h` : 'N/A',
      jornada.observaciones_entrada || jornada.observaciones_salida || '-'
    ]);

    autoTable(doc, {
      startY: yPos + 8,
      head: [['Fecha', 'Entrada', 'Salida', 'Duración', 'Horas', 'Observaciones']],
      body: datosJornadas,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 60 }
      },
      margin: { left: 20, right: 20 }
    });
  }

  private static agregarSeccionHorasExtrasPDF(
    doc: jsPDF, 
    calculosHorasExtras: { calculos: CalculoDetallado[], resumen: ResumenPeriodo }, 
    yPos: number
  ): void {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CÁLCULO DE HORAS EXTRAS', 20, yPos);

    // Resumen ejecutivo
    const datosResumen = [
      ['Total días laborados', calculosHorasExtras.resumen.total_dias_laborados.toString()],
      ['Horas ordinarias', CalculadoraHorasExtras.formatearHoras(calculosHorasExtras.resumen.total_horas_ordinarias)],
      ['Horas extras diurnas', CalculadoraHorasExtras.formatearHoras(calculosHorasExtras.resumen.total_horas_extras_diurnas)],
      ['Horas extras nocturnas', CalculadoraHorasExtras.formatearHoras(calculosHorasExtras.resumen.total_horas_extras_nocturnas)],
      ['Promedio horas/día', `${calculosHorasExtras.resumen.promedio_horas_dia}h`]
    ];

    autoTable(doc, {
      startY: yPos + 8,
      head: [['Concepto', 'Valor']],
      body: datosResumen,
      theme: 'grid',
      headStyles: { fillColor: [251, 191, 36], textColor: 0, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      margin: { left: 20, right: 20 }
    });

    const yPosDetalle = (doc as any).lastAutoTable.finalY + 10;

    // Detalle por día (primeros 15 días)
    const datosDetalle = calculosHorasExtras.calculos.slice(0, 15).map(calculo => [
      calculo.fecha,
      calculo.entrada,
      calculo.salida,
      CalculadoraHorasExtras.formatearHoras(calculo.horas_trabajadas),
      CalculadoraHorasExtras.formatearHoras(calculo.horas_ordinarias),
      CalculadoraHorasExtras.formatearHoras(calculo.horas_extras_diurnas),
      CalculadoraHorasExtras.formatearHoras(calculo.horas_extras_nocturnas)
    ]);

    autoTable(doc, {
      startY: yPosDetalle,
      head: [['Fecha', 'Entrada', 'Salida', 'Total', 'Ordinarias', 'Ext. Diurnas', 'Ext. Nocturnas']],
      body: datosDetalle,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 7, cellPadding: 1.5 },
      margin: { left: 20, right: 20 }
    });
  }

  private static agregarSeccionUbicacionesPDF(doc: jsPDF, ubicaciones: UbicacionGPS[], yPos: number): void {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UBICACIONES GPS', 20, yPos);

    const datosUbicaciones = ubicaciones.slice(0, 20).map(ubicacion => [
      ubicacion.fecha,
      ubicacion.hora,
      ubicacion.tipo.toUpperCase(),
      ubicacion.latitud.toFixed(6),
      ubicacion.longitud.toFixed(6)
    ]);

    autoTable(doc, {
      startY: yPos + 8,
      head: [['Fecha', 'Hora', 'Tipo', 'Latitud', 'Longitud']],
      body: datosUbicaciones,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      },
      margin: { left: 20, right: 20 }
    });
  }

  private static agregarPiePaginaPDF(doc: jsPDF): void {
    const totalPages = (doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Línea superior
      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      
      // Texto del pie
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${EMPRESA_CONFIG.nombre} | ${EMPRESA_CONFIG.telefono} | ${EMPRESA_CONFIG.email}`, 20, 285);
      doc.text(`Página ${i} de ${totalPages} | Generado automáticamente por Sistema OXITRANS`, 20, 290);
    }
  }

  // ====================================
  // MÉTODOS AUXILIARES PARA EXCEL
  // ====================================

  private static crearHojaInformacionGeneral(datos: DatosReporte): XLSX.WorkSheet {
    const datosHoja = [
      ['OXITRANS S.A.S - REPORTE COLABORADOR'],
      [''],
      ['Fecha de generación:', datos.fechaGeneracion],
      ['Generado por:', datos.usuarioGenerador],
      ['Tipo de reporte:', datos.tipoReporte],
      [''],
      ['=== INFORMACIÓN DEL COLABORADOR ==='],
      ['Nombre completo:', `${datos.colaborador.nombre} ${datos.colaborador.apellido}`],
      ['Documento:', datos.colaborador.documento],
      ['Estado:', datos.colaborador.estado],
      ['Teléfono:', datos.colaborador.telefono || 'No registrado'],
      ['Regional:', datos.colaborador.regional_nombre || 'No asignada'],
      ['Departamento:', datos.colaborador.departamento || 'No especificado'],
      ['Cargo:', datos.colaborador.cargo_nombre || 'No asignado'],
      [''],
      ['=== ESTADÍSTICAS ==='],
      ['Total jornadas:', datos.jornadas.length],
      ['Total ubicaciones GPS:', datos.ubicaciones?.length || 0],
      ['Período consultado:', datos.jornadas.length > 0 ? 
        `${datos.jornadas[datos.jornadas.length - 1]?.fecha} - ${datos.jornadas[0]?.fecha}` : 'N/A']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(datosHoja);
    
    // Aplicar estilos (ancho de columnas)
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 50 }
    ];

    return worksheet;
  }

  private static crearHojaJornadas(jornadas: JornadaLaboral[]): XLSX.WorkSheet {
    const encabezados = [
      'Fecha',
      'Entrada', 
      'Salida',
      'Duración Total',
      'Horas Trabajadas',
      'Almuerzo Inicio',
      'Almuerzo Fin',
      'Duración Almuerzo',
      'Latitud Entrada',
      'Longitud Entrada',
      'Latitud Salida', 
      'Longitud Salida',
      'Observaciones Entrada',
      'Observaciones Salida'
    ];

    const datosJornadas = jornadas.map(jornada => [
      jornada.fecha,
      jornada.entrada || '',
      jornada.salida || '',
      jornada.duracion_total || '',
      jornada.horas_trabajadas || '',
      jornada.almuerzo_inicio || '',
      jornada.almuerzo_fin || '',
      jornada.duracion_almuerzo || '',
      jornada.latitud_entrada || '',
      jornada.longitud_entrada || '',
      jornada.latitud_salida || '',
      jornada.longitud_salida || '',
      jornada.observaciones_entrada || '',
      jornada.observaciones_salida || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([encabezados, ...datosJornadas]);
    
    // Configurar anchos de columna
    worksheet['!cols'] = new Array(encabezados.length).fill({ wch: 15 });

    return worksheet;
  }

  private static crearHojaHorasExtras(calculosHorasExtras: { calculos: CalculoDetallado[], resumen: ResumenPeriodo }): XLSX.WorkSheet {
    const datos = [
      ['=== RESUMEN EJECUTIVO ==='],
      ['Total días laborados:', calculosHorasExtras.resumen.total_dias_laborados],
      ['Total horas ordinarias:', calculosHorasExtras.resumen.total_horas_ordinarias],
      ['Total horas extras:', calculosHorasExtras.resumen.total_horas_extras],
      ['Horas extras diurnas:', calculosHorasExtras.resumen.total_horas_extras_diurnas],
      ['Horas extras nocturnas:', calculosHorasExtras.resumen.total_horas_extras_nocturnas],
      ['Promedio horas/día:', calculosHorasExtras.resumen.promedio_horas_dia],
      ['Días con extras:', calculosHorasExtras.resumen.dias_con_extras],
      [''],
      ['=== DETALLE POR DÍA ==='],
      [
        'Fecha',
        'Entrada',
        'Salida', 
        'Horas Trabajadas',
        'Horas Ordinarias',
        'Extras Diurnas',
        'Extras Nocturnas',
        'Recargo Diurno (%)',
        'Recargo Nocturno (%)'
      ]
    ];

    // Agregar datos detallados
    calculosHorasExtras.calculos.forEach(calculo => {
      datos.push([
        calculo.fecha,
        calculo.entrada,
        calculo.salida,
        calculo.horas_trabajadas,
        calculo.horas_ordinarias,
        calculo.horas_extras_diurnas,
        calculo.horas_extras_nocturnas,
        calculo.recargo_diurno * 100,
        calculo.recargo_nocturno * 100
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(datos);
    worksheet['!cols'] = new Array(9).fill({ wch: 15 });

    return worksheet;
  }

  private static crearHojaUbicaciones(ubicaciones: UbicacionGPS[]): XLSX.WorkSheet {
    const encabezados = [
      'ID',
      'ID Jornada',
      'Fecha',
      'Hora',
      'Tipo',
      'Latitud',
      'Longitud'
    ];

    const datosUbicaciones = ubicaciones.map(ubicacion => [
      ubicacion.id,
      ubicacion.jornada_id,
      ubicacion.fecha,
      ubicacion.hora,
      ubicacion.tipo,
      ubicacion.latitud,
      ubicacion.longitud
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([encabezados, ...datosUbicaciones]);
    worksheet['!cols'] = [
      { wch: 15 },  // ID
      { wch: 15 },  // ID Jornada
      { wch: 15 },  // Fecha
      { wch: 12 },  // Hora
      { wch: 12 },  // Tipo
      { wch: 18 },  // Latitud
      { wch: 18 }   // Longitud
    ];

    return worksheet;
  }

  /**
   * Genera reporte rápido (solo datos básicos)
   */
  static async generarReporteRapido(
    colaborador: Colaborador,
    tipoExportacion: 'pdf' | 'excel' = 'pdf'
  ): Promise<void> {
    const datosBasicos: DatosReporte = {
      colaborador,
      jornadas: [],
      fechaGeneracion: new Date().toLocaleDateString('es-CO'),
      usuarioGenerador: 'Sistema OXITRANS',
      tipoReporte: 'completo'
    };

    if (tipoExportacion === 'pdf') {
      await this.generarPDF(datosBasicos);
    } else {
      await this.generarExcel(datosBasicos);
    }
  }
}