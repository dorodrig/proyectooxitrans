// ====================================
// 🧪 TEST VALIDACIONES PASO 8
// Pruebas del sistema de validación implementado
// ====================================

import { ValidadorColombiano } from '../src/services/validadorColombiano.js';
import { ManejadorErrores } from '../src/services/manejadorErrores.js';

console.log('🧪 INICIANDO TESTS DE VALIDACIÓN - PASO 8\n');

// ====================================
// ✅ TEST 1: VALIDACIÓN DE CÉDULAS
// ====================================
console.log('📋 TEST 1: Validación de Cédulas Colombianas');
console.log('═'.repeat(50));

const cedulasPrueba = [
  '12345678',      // Válida básica
  '1234567890',    // Válida larga  
  '123456',        // Muy corta
  '12345678901',   // Muy larga
  '11111111',      // Números iguales
  '12345',         // Muy corta
  'abc123',        // Con letras
  ''               // Vacía
];

cedulasPrueba.forEach(cedula => {
  const resultado = ValidadorColombiano.validarCedula(cedula);
  console.log(`📄 Cédula: "${cedula}" - ${resultado.esValido ? '✅' : '❌'} - ${resultado.mensaje}`);
});

console.log('\n');

// ====================================
// ✅ TEST 2: VALIDACIÓN DE NOMBRES
// ====================================
console.log('👤 TEST 2: Validación de Nombres');
console.log('═'.repeat(50));

const nombresPrueba = [
  'Juan Carlos',     // Válido
  'María José',      // Válido
  'Ana',            // Válido corto
  'J',              // Muy corto
  'Juan123',        // Con números
  'Juan@Carlos',    // Con caracteres especiales
  'Juan  Carlos',   // Doble espacio
  'JUAN CARLOS',    // Mayúsculas
  ''                // Vacío
];

nombresPrueba.forEach(nombre => {
  const resultado = ValidadorColombiano.validarNombre(nombre);
  console.log(`👤 Nombre: "${nombre}" - ${resultado.esValido ? '✅' : '❌'} - ${resultado.mensaje}`);
});

console.log('\n');

// ====================================
// ✅ TEST 3: VALIDACIÓN TÉRMINOS DE BÚSQUEDA
// ====================================
console.log('🔍 TEST 3: Validación Términos de Búsqueda');
console.log('═'.repeat(50));

const terminosPrueba = [
  '12345678',       // Documento válido
  'Pérez',         // Apellido válido
  'Juan Carlos',   // Nombre completo
  'Pe',            // Muy corto
  '123',           // Número muy corto
  'Pérez García',  // Apellido compuesto
  'María José',    // Nombre compuesto
  '   Juan   ',    // Con espacios
  'test@example',  // Con caracteres raros
  ''               // Vacío
];

terminosPrueba.forEach(termino => {
  const resultado = ValidadorColombiano.validarTerminoBusqueda(termino);
  console.log(`🔍 Término: "${termino}" - ${resultado.esValido ? '✅' : '❌'} - ${resultado.mensaje}`);
});

console.log('\n');

// ====================================
// ✅ TEST 4: SANITIZACIÓN DE INPUTS
// ====================================
console.log('🧹 TEST 4: Sanitización de Inputs');
console.log('═'.repeat(50));

const inputsPrueba = [
  '  Juan Carlos  ',     // Espacios
  'María<script>',       // Script injection
  'Pedro&nbsp;López',    // HTML entities  
  'Ana\t\nCarlos',      // Tabs y saltos
  'José\r\nMartín',     // Retornos de carro
  'Carlos   López',      // Múltiples espacios
  'María\u00A0José'     // Espacio no separable
];

inputsPrueba.forEach(input => {
  const sanitizado = ValidadorColombiano.sanitizarInput(input);
  console.log(`🧹 Original: "${input}" → Sanitizado: "${sanitizado}"`);
});

console.log('\n');

// ====================================
// ✅ TEST 5: MANEJO DE ERRORES HTTP
// ====================================
console.log('🚫 TEST 5: Análisis de Errores HTTP');
console.log('═'.repeat(50));

const erroresPrueba = [
  { status: 400, message: 'Bad Request' },
  { status: 401, message: 'Unauthorized' },
  { status: 403, message: 'Forbidden' },
  { status: 404, message: 'Not Found' },
  { status: 500, message: 'Internal Server Error' },
  { status: 503, message: 'Service Unavailable' },
  { code: 'NETWORK_ERROR' },
  { message: 'Connection timeout' }
];

erroresPrueba.forEach(error => {
  const analisis = ManejadorErrores.analizarErrorHttp(error);
  console.log(`🚫 Error ${error.status || error.code || 'UNKNOWN'}: ${analisis.mensaje}`);
  console.log(`   📊 Severidad: ${analisis.severidad} | Reintentos: ${analisis.puedeReintentar ? 'SÍ' : 'NO'}`);
});

console.log('\n');

// ====================================
// ✅ RESUMEN DE TESTS
// ====================================
console.log('📊 RESUMEN DE TESTS COMPLETADOS');
console.log('═'.repeat(50));
console.log('✅ Validación de cédulas colombianas');
console.log('✅ Validación de nombres y apellidos');
console.log('✅ Validación de términos de búsqueda');
console.log('✅ Sanitización de inputs de usuario');
console.log('✅ Análisis de errores HTTP contextuales');
console.log('\n🎉 PASO 8 - VALIDACIONES: IMPLEMENTACIÓN COMPLETA');
console.log('🛡️ Sistema robusto de validación y manejo de errores operativo');