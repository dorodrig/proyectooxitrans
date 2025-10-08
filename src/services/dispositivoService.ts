/**
 * 📱 DETECCIÓN DE CONTEXTO PWA Y DISPOSITIVO
 * Servicio para detectar el contexto de ejecución y optimizar GPS
 */

interface ContextoDispositivo {
  esPWA: boolean;
  esMovil: boolean;
  esLaptop: boolean;
  tieneGPS: boolean;
  precisonEsperada: number;
  recomendaciones: string[];
}

class DispositivoService {
  
  /**
   * Detectar contexto completo del dispositivo
   */
  static detectarContexto(): ContextoDispositivo {
    const esPWA = this.esPWAInstalada();
    const esMovil = this.esDispositivoMovil();
    const esLaptop = !esMovil && this.esDesktop();
    const tieneGPS = this.tieneGPSReal();
    
    // Precisión esperada basada en contexto
    let precisonEsperada: number;
    let recomendaciones: string[] = [];
    
    if (esPWA && esMovil) {
      precisonEsperada = 20; // GPS real en móvil
      recomendaciones.push("📱 Excelente: PWA en móvil con GPS");
      recomendaciones.push("🎯 Ve al exterior para máxima precisión");
    } else if (esMovil && !esPWA) {
      precisonEsperada = 50; // Browser móvil
      recomendaciones.push("📱 Bueno: Móvil en navegador");
      recomendaciones.push("💡 Instala la PWA para mejor rendimiento");
    } else if (esLaptop) {
      precisonEsperada = 650; // WiFi/IP location
      recomendaciones.push("💻 Limitado: Laptop usa WiFi/IP");
      recomendaciones.push("📱 Usa un móvil para mejor precisión GPS");
      recomendaciones.push("🏢 Tolerancia relajada aplicada automáticamente");
    } else {
      precisonEsperada = 200; // Desconocido
      recomendaciones.push("❓ Contexto desconocido");
    }
    
    return {
      esPWA,
      esMovil,
      esLaptop,
      tieneGPS,
      precisonEsperada,
      recomendaciones
    };
  }
  
  /**
   * Detectar si la app está instalada como PWA
   */
  private static esPWAInstalada(): boolean {
    // Múltiples métodos de detección
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }
  
  /**
   * Detectar dispositivo móvil
   */
  private static esDispositivoMovil(): boolean {
    const userAgent = navigator.userAgent;
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }
  
  /**
   * Detectar desktop/laptop
   */
  private static esDesktop(): boolean {
    const userAgent = navigator.userAgent;
    return /Windows|Mac|Linux/i.test(userAgent) && !/Mobile/i.test(userAgent);
  }
  
  /**
   * Detectar si tiene GPS real (no solo IP/WiFi)
   */
  private static tieneGPSReal(): boolean {
    // Aproximación: móviles típicamente tienen GPS, desktops no
    return (
      this.esDispositivoMovil() && 
      'geolocation' in navigator &&
      // Detectar si está en HTTPS (requerido para GPS en algunos browsers)
      window.location.protocol === 'https:'
    );
  }
  
  /**
   * Obtener configuración GPS optimizada para el contexto
   */
  static obtenerConfigGPSOptimizada(): PositionOptions {
    const contexto = this.detectarContexto();
    
    if (contexto.esPWA && contexto.esMovil) {
      // PWA móvil: máxima precisión
      return {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Siempre fresco
      };
    } else if (contexto.esMovil) {
      // Browser móvil: buena precisión
      return {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000
      };
    } else if (contexto.esLaptop) {
      // Laptop: tolerante, más tiempo
      return {
        enableHighAccuracy: true,
        timeout: 30000, // Más tiempo para WiFi triangulation
        maximumAge: 15000 // Permitir cache más tiempo
      };
    } else {
      // Por defecto
      return {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      };
    }
  }
  
  /**
   * Log de información del contexto para debugging
   */
  static logContextoCompleto(): void {
    const contexto = this.detectarContexto();
    
    console.group('📱 CONTEXTO DEL DISPOSITIVO');
    console.log('PWA Instalada:', contexto.esPWA ? '✅ Sí' : '❌ No');
    console.log('Dispositivo Móvil:', contexto.esMovil ? '✅ Sí' : '❌ No');  
    console.log('Laptop/Desktop:', contexto.esLaptop ? '✅ Sí' : '❌ No');
    console.log('GPS Real Disponible:', contexto.tieneGPS ? '✅ Sí' : '❌ No');
    console.log('Precisión Esperada:', `±${contexto.precisonEsperada}m`);
    console.log('User Agent:', navigator.userAgent);
    console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'PWA' : 'Browser');
    console.log('Protocolo:', window.location.protocol);
    
    console.group('📋 RECOMENDACIONES:');
    contexto.recomendaciones.forEach(rec => console.log(rec));
    console.groupEnd();
    
    console.groupEnd();
  }
}

export { DispositivoService, type ContextoDispositivo };