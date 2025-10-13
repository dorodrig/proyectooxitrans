// ====================================
// 🗺️ GEOCODING SERVICE - OXITRANS S.A.S
// Servicio para búsqueda de direcciones usando Nominatim (OpenStreetMap)
// ====================================

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface SearchSuggestion {
  id: string;
  display_name: string;
  latitude: number;
  longitude: number;
  type: string;
  importance: number;
}

class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly defaultParams = {
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'co', // Restringir a Colombia
    'accept-language': 'es'
  };

  /**
   * Buscar direcciones usando Nominatim
   */
  async searchAddresses(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        ...this.defaultParams,
        q: query.trim()
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'OXITRANS-Control-Acceso/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: GeocodingResult[] = await response.json();
      
      return results
        .filter(result => result && result.lat && result.lon && result.display_name) // Filtrar resultados válidos
        .map(result => ({
          id: result.place_id || `${result.lat}-${result.lon}`,
          display_name: result.display_name || 'Sin nombre',
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          type: result.type || 'unknown',
          importance: result.importance || 0
        }))
        .filter(result => !isNaN(result.latitude) && !isNaN(result.longitude)); // Filtrar coordenadas válidas

    } catch (error) {
      console.error('Error en geocoding search:', error);
      return [];
    }
  }

  /**
   * Búsqueda específica para ciudades colombianas
   */
  async searchCities(query: string): Promise<SearchSuggestion[]> {
    const cityQuery = `${query}, Colombia`;
    const results = await this.searchAddresses(cityQuery);
    
    // Filtrar solo ciudades y pueblos
    return results.filter(result => 
      ['city', 'town', 'village', 'municipality'].includes(result.type)
    );
  }

  /**
   * Búsqueda específica para calles y direcciones
   */
  async searchStreets(query: string, city?: string): Promise<SearchSuggestion[]> {
    const streetQuery = city ? `${query}, ${city}, Colombia` : `${query}, Colombia`;
    const results = await this.searchAddresses(streetQuery);
    
    // Priorizar direcciones más específicas
    return results.filter(result => 
      result.importance > 0.3 || 
      ['house', 'building', 'commercial', 'residential'].includes(result.type)
    );
  }

  /**
   * Obtener coordenadas exactas de una dirección
   */
  async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    const results = await this.searchAddresses(address);
    
    if (results.length > 0) {
      const bestResult = results[0]; // El primer resultado suele ser el más relevante
      return {
        lat: bestResult.latitude,
        lng: bestResult.longitude
      };
    }
    
    return null;
  }

  /**
   * Formatear dirección para mostrar de forma más limpia
   */
  formatDisplayName(displayName: string): string {
    // Validar que displayName no sea null o undefined
    if (!displayName || typeof displayName !== 'string') {
      return 'Dirección no disponible';
    }
    
    // Remover "Colombia" al final si está presente
    let formatted = displayName.replace(/, Colombia$/, '');
    
    // Acortar direcciones muy largas
    const parts = formatted.split(', ');
    if (parts.length > 4) {
      return parts.slice(0, 4).join(', ') + '...';
    }
    
    return formatted;
  }
}

export const geocodingService = new GeocodingService();