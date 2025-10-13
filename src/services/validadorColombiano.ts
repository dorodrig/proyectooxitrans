// ====================================
// 🛡️ SERVICIO DE VALIDACIONES OXITRANS
// Validaciones específicas para Colombia
// ====================================

export interface ValidacionResult {
  esValido: boolean;
  mensaje: string;
  tipo: 'error' | 'warning' | 'info' | 'success';
  sugerencias?: string[];
}

export class ValidadorColombiano {
  
  // ======== VALIDACIÓN CÉDULA COLOMBIANA ========
  static validarCedula(cedula: string): ValidacionResult {
    // Limpiar la cédula de espacios y caracteres especiales
    const cedulaLimpia = cedula.replace(/[^0-9]/g, '');
    
    // Validaciones básicas
    if (!cedulaLimpia) {
      return {
        esValido: false,
        mensaje: 'El número de cédula es obligatorio',
        tipo: 'error',
        sugerencias: ['Ingrese un número de documento válido']
      };
    }

    if (cedulaLimpia.length < 6) {
      return {
        esValido: false,
        mensaje: 'La cédula debe tener mínimo 6 dígitos',
        tipo: 'error',
        sugerencias: ['Las cédulas colombianas tienen entre 6 y 10 dígitos']
      };
    }

    if (cedulaLimpia.length > 10) {
      return {
        esValido: false,
        mensaje: 'La cédula no puede tener más de 10 dígitos',
        tipo: 'error',
        sugerencias: ['Verifique que no haya incluído espacios o caracteres adicionales']
      };
    }

    // Validar que no sean todos números iguales
    const numerosIguales = /^(\d)\1+$/.test(cedulaLimpia);
    if (numerosIguales) {
      return {
        esValido: false,
        mensaje: 'La cédula no puede tener todos los dígitos iguales',
        tipo: 'error',
        sugerencias: ['Verifique el número de documento']
      };
    }

    // Validar secuencias obvias
    const esSecuencia = this.esSecuenciaNumerica(cedulaLimpia);
    if (esSecuencia) {
      return {
        esValido: false,
        mensaje: 'El número ingresado parece ser una secuencia no válida',
        tipo: 'warning',
        sugerencias: ['Verifique que sea el número correcto del documento']
      };
    }

    // Algoritmo de verificación básico para cédula colombiana
    const esValidoAlgoritmo = this.validarAlgoritmoCedula(cedulaLimpia);
    if (!esValidoAlgoritmo) {
      return {
        esValido: false,
        mensaje: 'El formato del número de cédula no es válido',
        tipo: 'warning',
        sugerencias: [
          'Verifique el número completo',
          'Asegúrese de no haber omitido dígitos'
        ]
      };
    }

    return {
      esValido: true,
      mensaje: 'Número de cédula válido',
      tipo: 'success'
    };
  }

  // ======== VALIDACIÓN DE NOMBRES ========
  static validarNombre(nombre: string): ValidacionResult {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      return {
        esValido: false,
        mensaje: 'El nombre es obligatorio',
        tipo: 'error'
      };
    }

    if (nombreLimpio.length < 2) {
      return {
        esValido: false,
        mensaje: 'El nombre debe tener al menos 2 caracteres',
        tipo: 'error'
      };
    }

    if (nombreLimpio.length > 50) {
      return {
        esValido: false,
        mensaje: 'El nombre no puede exceder 50 caracteres',
        tipo: 'error'
      };
    }

    // Validar caracteres permitidos (letras, espacios, acentos, ñ)
    const patronNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!patronNombre.test(nombreLimpio)) {
      return {
        esValido: false,
        mensaje: 'El nombre solo puede contener letras y espacios',
        tipo: 'error',
        sugerencias: ['No use números o caracteres especiales']
      };
    }

    return {
      esValido: true,
      mensaje: 'Nombre válido',
      tipo: 'success'
    };
  }

  // ======== VALIDACIÓN EMAIL ========
  static validarEmail(email: string): ValidacionResult {
    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio) {
      return {
        esValido: false,
        mensaje: 'El email es obligatorio',
        tipo: 'error'
      };
    }

    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(emailLimpio)) {
      return {
        esValido: false,
        mensaje: 'Formato de email inválido',
        tipo: 'error',
        sugerencias: ['Ejemplo: usuario@empresa.com']
      };
    }

    return {
      esValido: true,
      mensaje: 'Email válido',
      tipo: 'success'
    };
  }

  // ======== VALIDACIÓN TELÉFONO COLOMBIANO ========
  static validarTelefono(telefono: string): ValidacionResult {
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');

    if (!telefonoLimpio) {
      return {
        esValido: false,
        mensaje: 'El teléfono es obligatorio',
        tipo: 'error'
      };
    }

    // Validar celular colombiano (10 dígitos empezando por 3)
    const patronCelular = /^3[0-9]{9}$/;
    // Validar teléfono fijo (7 dígitos + código de área)
    const patronFijo = /^[1-9][0-9]{6,7}$/;

    if (patronCelular.test(telefonoLimpio)) {
      return {
        esValido: true,
        mensaje: 'Número de celular válido',
        tipo: 'success'
      };
    }

    if (patronFijo.test(telefonoLimpio)) {
      return {
        esValido: true,
        mensaje: 'Número de teléfono fijo válido',
        tipo: 'success'
      };
    }

    return {
      esValido: false,
      mensaje: 'Formato de teléfono inválido',
      tipo: 'error',
      sugerencias: [
        'Celular: 10 dígitos (ej: 3001234567)',
        'Fijo: 7-8 dígitos (ej: 6012345678)'
      ]
    };
  }

  // ======== MÉTODOS AUXILIARES ========
  private static esSecuenciaNumerica(numero: string): boolean {
    // Detectar secuencias como 123456789, 987654321, etc.
    for (let i = 1; i < numero.length; i++) {
      const actual = parseInt(numero[i]);
      const anterior = parseInt(numero[i - 1]);
      
      if (i === 1) continue; // Necesitamos al menos 3 dígitos para determinar patrón
      
      const diferencia = actual - anterior;
      const diferenciaAnterior = anterior - parseInt(numero[i - 2]);
      
      if (Math.abs(diferencia) === 1 && diferencia === diferenciaAnterior && numero.length > 5) {
        return true; // Es una secuencia
      }
    }
    return false;
  }

  private static validarAlgoritmoCedula(cedula: string): boolean {
    // Algoritmo simplificado de validación de cédula colombiana
    // Basado en el dígito de verificación cuando aplica
    
    if (cedula.length < 8) return true; // Para cédulas cortas asumimos válidas
    
    try {
      let suma = 0;
      let multiplicador = 1;
      
      // Recorrer de derecha a izquierda
      for (let i = cedula.length - 2; i >= 0; i--) {
        let producto = parseInt(cedula[i]) * multiplicador;
        if (producto >= 10) {
          producto = Math.floor(producto / 10) + (producto % 10);
        }
        suma += producto;
        multiplicador = multiplicador === 1 ? 2 : 1;
      }
      
      const digitoVerificacion = (10 - (suma % 10)) % 10;
      const ultimoDigito = parseInt(cedula[cedula.length - 1]);
      
      // Para efectos prácticos, aceptamos si la diferencia es mínima
      // ya que no todas las cédulas siguen estrictamente este algoritmo
      return Math.abs(digitoVerificacion - ultimoDigito) <= 2;
      
    } catch (error) {
      return false;
    }
  }

  // ======== VALIDACIÓN DE BÚSQUEDA ========
  static validarTerminoBusqueda(termino: string): ValidacionResult {
    const terminoLimpio = termino.trim();

    if (!terminoLimpio) {
      return {
        esValido: false,
        mensaje: 'Ingrese un término de búsqueda',
        tipo: 'info'
      };
    }

    if (terminoLimpio.length < 3) {
      return {
        esValido: false,
        mensaje: `Ingrese al menos 3 caracteres (${terminoLimpio.length}/3)`,
        tipo: 'warning'
      };
    }

    if (terminoLimpio.length > 50) {
      return {
        esValido: false,
        mensaje: 'El término de búsqueda es muy largo',
        tipo: 'error'
      };
    }

    // Detectar si es cédula numérica
    const esSoloNumeros = /^\d+$/.test(terminoLimpio);
    if (esSoloNumeros) {
      const validacionCedula = this.validarCedula(terminoLimpio);
      if (!validacionCedula.esValido && validacionCedula.tipo === 'error') {
        return {
          esValido: false,
          mensaje: 'Formato de cédula inválido',
          tipo: 'warning',
          sugerencias: validacionCedula.sugerencias
        };
      }
    }

    // Validar caracteres especiales excesivos
    const caracteresEspeciales = terminoLimpio.match(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g);
    if (caracteresEspeciales && caracteresEspeciales.length > 2) {
      return {
        esValido: false,
        mensaje: 'Demasiados caracteres especiales en la búsqueda',
        tipo: 'warning',
        sugerencias: ['Use solo letras, números y espacios']
      };
    }

    return {
      esValido: true,
      mensaje: 'Término de búsqueda válido',
      tipo: 'success'
    };
  }

  // ======== SANITIZACIÓN ========
  static sanitizarInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .replace(/[<>]/g, ''); // Remover caracteres potencialmente peligrosos
  }

  // ======== FORMATEAR CÉDULA ========
  static formatearCedula(cedula: string): string {
    const cedulaLimpia = cedula.replace(/[^0-9]/g, '');
    if (cedulaLimpia.length <= 3) return cedulaLimpia;
    
    // Formato: 12.345.678
    return cedulaLimpia.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // ======== FORMATEAR TELÉFONO ========
  static formatearTelefono(telefono: string): string {
    const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
    
    if (telefonoLimpio.length === 10 && telefonoLimpio.startsWith('3')) {
      // Celular: 300 123 4567
      return `${telefonoLimpio.slice(0, 3)} ${telefonoLimpio.slice(3, 6)} ${telefonoLimpio.slice(6)}`;
    }
    
    if (telefonoLimpio.length >= 7) {
      // Fijo: 601 234 5678
      const inicio = telefonoLimpio.slice(0, -4);
      const final = telefonoLimpio.slice(-4);
      return `${inicio} ${final}`;
    }
    
    return telefono;
  }
}

export default ValidadorColombiano;