/**
 * ====================================
 * 🧪 TEST SISTEMA DE REPORTES OXITRANS
 * Verificación de generación PDF/Excel
 * ====================================
 */

import { GeneradorReportes } from '../src/services/generadorReportes.js';
import { CalculadoraHorasExtras } from '../src/services/calculadoraHorasExtras.js';

// ======== DATOS DE PRUEBA ========
const colaboradorPrueba = {
  id: 1,
  documento: '12345678',
  nombre: 'Juan Carlos',
  apellido: 'Pérez Rodríguez',
  telefono: '3001234567',
  email: 'juan.perez@oxitrans.com',
  activo: 1,
  estado: 'activo',
  regional_id: 1,
  regional_nombre: 'Bogotá',
  ubicacion_especifica: 'Sede Principal',
  tipo_usuario: 'empleado',
  fecha_creacion: '2024-01-15',
  ultima_actividad: new Date().toISOString()
};

const jornadasPrueba = [
  {
    id: 1,
    empleado_id: 1,
    fecha: '2024-01-20',
    entrada: '07:30',
    salida: '19:45',
    almuerzo_inicio: '12:00',
    almuerzo_fin: '13:00',
    descanso_manana_inicio: '09:30',
    descanso_manana_fin: '09:45',
    descanso_tarde_inicio: '15:30',
    descanso_tarde_fin: '15:45',
    duracion_almuerzo: '60',
    observaciones: 'Jornada con horas extras'
  },
  {
    id: 2,
    empleado_id: 1,
    fecha: '2024-01-21',
    entrada: '08:00',
    salida: '17:30',
    almuerzo_inicio: '12:30',
    almuerzo_fin: '13:30',
    descanso_manana_inicio: '10:00',
    descanso_manana_fin: '10:15',
    duracion_almuerzo: '60',
    observaciones: 'Jornada normal'
  },
  {
    id: 3,
    empleado_id: 1,
    fecha: '2024-01-22',
    entrada: '06:00',
    salida: '22:30',
    almuerzo_inicio: '12:00',
    almuerzo_fin: '13:00',
    descanso_manana_inicio: '09:00',
    descanso_manana_fin: '09:15',
    descanso_tarde_inicio: '16:00',
    descanso_tarde_fin: '16:15',
    duracion_almuerzo: '60',
    observaciones: 'Jornada extendida con horas nocturnas'
  }
];

const ubicacionesPrueba = [
  {
    id: 1,
    empleado_id: 1,
    fecha: '2024-01-20',
    hora: '07:30:00',
    latitud: 4.6097100,
    longitud: -74.0817500,
    tipo: 'entrada',
    descripcion: 'Entrada registrada - Sede Bogotá'
  },
  {
    id: 2,
    empleado_id: 1,
    fecha: '2024-01-20',
    hora: '19:45:00',
    latitud: 4.6097100,
    longitud: -74.0817500,
    tipo: 'salida',
    descripcion: 'Salida registrada - Sede Bogotá'
  },
  {
    id: 3,
    empleado_id: 1,
    fecha: '2024-01-21',
    hora: '08:00:00',
    latitud: 4.6097100,
    longitud: -74.0817500,
    tipo: 'entrada',
    descripcion: 'Entrada registrada - Sede Bogotá'
  }
];

// ======== FUNCIONES DE PRUEBA ========
async function probarGeneracionPDF() {
  console.log('\n🔄 Iniciando prueba de generación PDF...');
  
  try {
    // Calcular horas extras
    const calculoHorasExtras = CalculadoraHorasExtras.calcularPeriodo(
      jornadasPrueba.map(j => ({
        fecha: j.fecha,
        entrada: j.entrada,
        salida: j.salida,
        descanso_minutos: 60
      })),
      4500 // Valor hora ordinaria
    );

    const datosReporte = {
      colaborador: colaboradorPrueba,
      jornadas: jornadasPrueba,
      ubicaciones: ubicacionesPrueba,
      calculosHorasExtras: calculoHorasExtras,
      fechaGeneracion: new Date().toLocaleDateString('es-CO'),
      usuarioGenerador: 'Test Usuario',
      tipoReporte: 'completo'
    };

    console.log('📋 Datos del reporte preparados:');
    console.log(`   - Colaborador: ${colaboradorPrueba.nombre} ${colaboradorPrueba.apellido}`);
    console.log(`   - Jornadas: ${jornadasPrueba.length}`);
    console.log(`   - Ubicaciones GPS: ${ubicacionesPrueba.length}`);
    console.log(`   - Total horas extras: ${CalculadoraHorasExtras.formatearHoras(calculoHorasExtras.resumen.total_horas_extras)}`);

    await GeneradorReportes.generarPDF(datosReporte);
    console.log('✅ PDF generado exitosamente');

  } catch (error) {
    console.error('❌ Error generando PDF:', error.message);
    console.error('📋 Detalles:', error);
  }
}

async function probarGeneracionExcel() {
  console.log('\n🔄 Iniciando prueba de generación Excel...');
  
  try {
    // Calcular horas extras con valor diferente
    const calculoHorasExtras = CalculadoraHorasExtras.calcularPeriodo(
      jornadasPrueba.map(j => ({
        fecha: j.fecha,
        entrada: j.entrada,
        salida: j.salida,
        descanso_minutos: 60
      })),
      5000 // Valor hora ordinaria diferente
    );

    const datosReporte = {
      colaborador: colaboradorPrueba,
      jornadas: jornadasPrueba,
      ubicaciones: ubicacionesPrueba,
      calculosHorasExtras: calculoHorasExtras,
      fechaGeneracion: new Date().toLocaleDateString('es-CO'),
      usuarioGenerador: 'Test Usuario',
      tipoReporte: 'completo'
    };

    console.log('📊 Datos del reporte Excel preparados:');
    console.log(`   - Colaborador: ${colaboradorPrueba.nombre} ${colaboradorPrueba.apellido}`);
    console.log('   - Valor hora: $' + (5000).toLocaleString('es-CO'));
    console.log(`   - Días con extras: ${calculoHorasExtras.resumen.dias_con_extras}`);
    console.log('   - Total a pagar extras: $' + calculoHorasExtras.resumen.total_pagar_extras.toLocaleString('es-CO'));

    await GeneradorReportes.generarExcel(datosReporte);
    console.log('✅ Excel generado exitosamente');

  } catch (error) {
    console.error('❌ Error generando Excel:', error.message);
    console.error('📋 Detalles:', error);
  }
}

async function probarReportePorTipo() {
  console.log('\n🔄 Probando diferentes tipos de reporte...');

  const tipos = ['jornadas', 'ubicaciones', 'horas-extras'];
  
  for (const tipo of tipos) {
    try {
      console.log('\n📋 Generando reporte tipo: ' + tipo);
      
      const datosReporte = {
        colaborador: colaboradorPrueba,
        jornadas: tipo === 'jornadas' || tipo === 'horas-extras' ? jornadasPrueba : [],
        ubicaciones: tipo === 'ubicaciones' ? ubicacionesPrueba : undefined,
        calculosHorasExtras: tipo === 'horas-extras' ? 
          CalculadoraHorasExtras.calcularPeriodo(
            jornadasPrueba.map(j => ({
              fecha: j.fecha,
              entrada: j.entrada,
              salida: j.salida,
              descanso_minutos: 60
            })),
            4200
          ) : undefined,
        fechaGeneracion: new Date().toLocaleDateString('es-CO'),
        usuarioGenerador: 'Test Usuario',
        tipoReporte: tipo
      };

      await GeneradorReportes.generarPDF(datosReporte);
      console.log('✅ Reporte ' + tipo + ' PDF generado');
      
      await GeneradorReportes.generarExcel(datosReporte);
      console.log('✅ Reporte ' + tipo + ' Excel generado');

    } catch (error) {
      console.error('❌ Error en reporte tipo ' + tipo + ':', error.message);
    }
  }
}

// ======== EJECUCIÓN DE PRUEBAS ========
async function ejecutarPruebas() {
  console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA DE REPORTES OXITRANS');
  console.log('='.repeat(60));
  
  const inicioTiempo = Date.now();
  
  try {
    // Prueba 1: PDF completo
    await probarGeneracionPDF();
    
    // Esperar un momento entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Prueba 2: Excel completo
    await probarGeneracionExcel();
    
    // Esperar un momento entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Prueba 3: Diferentes tipos de reporte
    await probarReportePorTipo();
    
    const tiempoTranscurrido = Date.now() - inicioTiempo;
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log(`⏱️  Tiempo total: ${(tiempoTranscurrido / 1000).toFixed(2)} segundos`);
    console.log('\n📁 Archivos generados en la carpeta de descargas');
    console.log('🔍 Verifica que los reportes contengan:');
    console.log('   - Logo corporativo OXITRANS');
    console.log('   - Información del colaborador completa');
    console.log('   - Cálculos de horas extras precisos');
    console.log('   - Formato profesional y legible');
    
  } catch (error) {
    console.error('💥 ERROR CRÍTICO EN LAS PRUEBAS:', error);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarPruebas();
}

export {
  ejecutarPruebas,
  probarGeneracionPDF,
  probarGeneracionExcel,
  probarReportePorTipo
};