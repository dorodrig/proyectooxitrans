import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/regionales-crud.scss';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regionalesService } from '../services/regionalesService';
import { geocodingService, type SearchSuggestion } from '../services/geocodingService';
import type { Regional } from '../types';
import { Search, MapPin } from 'lucide-react';

const RegionalesCrud: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: regionales = [], isLoading } = useQuery({
    queryKey: ['regionales'],
    queryFn: regionalesService.getAll,
  });

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const DEFAULT_LAT = 4.60971;
  const DEFAULT_LNG = -74.08175;
  const [latitud, setLatitud] = useState<number | null>(DEFAULT_LAT);
  const [longitud, setLongitud] = useState<number | null>(DEFAULT_LNG);
  
  // Estados para búsqueda de direcciones
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string; latitud?: number; longitud?: number }) => {
      console.log('📤 Enviando datos para crear regional:', data);
      return regionalesService.create(data);
    },
    onSuccess: (data) => {
      console.log('✅ Regional creada exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['regionales'] });
      setNombre('');
      setDescripcion('');
      setLatitud(null);
      setLongitud(null);
      setSearchQuery('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    },
    onError: (error) => {
      console.error('❌ Error al crear regional:', error);
      alert('Error al crear la regional. Por favor intenta nuevamente.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; nombre: string; descripcion?: string; latitud?: number; longitud?: number }) => {
      console.log('📤 Enviando datos para actualizar regional:', data);
      return regionalesService.update(data.id, { nombre: data.nombre, descripcion: data.descripcion, latitud: data.latitud, longitud: data.longitud });
    },
    onSuccess: (data) => {
      console.log('✅ Regional actualizada exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['regionales'] });
      setEditId(null);
      setNombre('');
      setDescripcion('');
      setLatitud(null);
      setLongitud(null);
      setSearchQuery('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    },
    onError: (error) => {
      console.error('❌ Error al actualizar regional:', error);
      alert('Error al actualizar la regional. Por favor intenta nuevamente.');
    },
  });

  // deleteMutation removido porque ya no se permite eliminar regionales desde el modal

  const handleEdit = (regional: Regional) => {
    setEditId(regional.id);
    setNombre(regional.nombre);
    setDescripcion(regional.descripcion || '');
    setLatitud(typeof regional.latitud === 'number' ? regional.latitud : DEFAULT_LAT);
    setLongitud(typeof regional.longitud === 'number' ? regional.longitud : DEFAULT_LNG);
  };

  const handleCancel = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
    setLatitud(null);
    setLongitud(null);
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Función para manejar la búsqueda de direcciones
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Debounce de 500ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await geocodingService.searchAddresses(value);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setIsSearching(false);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setIsSearching(false);
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
  };

  // Función para seleccionar una sugerencia
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setLatitud(suggestion.latitude);
    setLongitud(suggestion.longitude);
    setMapCenter([suggestion.latitude, suggestion.longitude]);
    setSearchQuery(geocodingService.formatDisplayName(suggestion.display_name));
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Efecto para cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Limpiar timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Componente para seleccionar coordenadas en el mapa
  function LocationMarker() {
    const map = useMapEvents({
      click(e: LeafletMouseEvent) {
        setLatitud(e.latlng.lat);
        setLongitud(e.latlng.lng);
        // Limpiar búsqueda cuando se selecciona manualmente
        setSearchQuery('');
        setShowSuggestions(false);
      },
    });

    // Centrar mapa cuando se actualiza mapCenter
    useEffect(() => {
      map.setView(mapCenter, map.getZoom());
    }, [mapCenter, map]);

    return latitud !== null && longitud !== null ? <Marker position={[latitud, longitud]} /> : null;
  }

  return (
    <div className="regionales-crud bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2 text-oxitrans-red">Gestionar Regionales</h3>
            <form
        onSubmit={(e) => {
          e.preventDefault();
          
          // Validación básica
          if (!nombre.trim()) {
            alert('El nombre de la regional es requerido');
            return;
          }

          // Validar coordenadas si están presentes
          if (latitud !== null && (isNaN(latitud) || latitud < -90 || latitud > 90)) {
            alert('La latitud debe ser un número válido entre -90 y 90');
            return;
          }

          if (longitud !== null && (isNaN(longitud) || longitud < -180 || longitud > 180)) {
            alert('La longitud debe ser un número válido entre -180 y 180');
            return;
          }

          const regionalData = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || undefined,
            latitud: (latitud !== null && !isNaN(latitud)) ? latitud : undefined,
            longitud: (longitud !== null && !isNaN(longitud)) ? longitud : undefined,
          };
          
          if (editId) {
            updateMutation.mutate({
              id: editId,
              ...regionalData
            });
          } else {
            createMutation.mutate(regionalData);
          }
        }}
        className="mb-4"
      >
        <input
          type="text"
          placeholder="Nombre de la regional"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="form-input mr-2"
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          className="form-input mr-2"
        />
        
        {/* Búsqueda de direcciones */}
        <div className="search-container mb-3" ref={suggestionContainerRef}>
          <label className="block text-sm font-medium mb-1">
            <Search className="inline w-4 h-4 mr-1" />
            Buscar dirección:
          </label>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Ej: Calle 26 #68-32, Bogotá o Centro, Medellín"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
            {isSearching && (
              <div className="search-loading">
                <div className="spinner"></div>
              </div>
            )}
          </div>
          
          {/* Sugerencias de búsqueda */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="suggestion-item"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <MapPin className="suggestion-icon" />
                  <div className="suggestion-content">
                    <div className="suggestion-title">
                      {geocodingService.formatDisplayName(suggestion.display_name)}
                    </div>
                    <div className="suggestion-coords">
                      {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-2 map-container-wrapper">
          <label className="block text-sm font-medium mb-1">O selecciona directamente en el mapa:</label>
          <MapContainer 
            center={mapCenter} 
            zoom={15} 
            style={{ height: '450px', width: '100%', maxWidth: '100%' } as React.CSSProperties}
            key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when center changes
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
          {latitud && longitud && (
            <div className="mt-2 text-xs text-gray-700">
              <span>Latitud: {latitud.toFixed(6)}</span> | <span>Longitud: {longitud.toFixed(6)}</span>
            </div>
          )}
        </div>
        <button type="submit" className="btn bg-oxitrans-red text-white font-bold px-4 py-2 rounded">
          {editId ? 'Actualizar' : 'Agregar'}
        </button>
        {editId && (
          <button type="button" className="btn ml-2 px-4 py-2" onClick={handleCancel}>
            Cancelar
          </button>
        )}
      </form>
      {isLoading ? (
        <div>Cargando regionales...</div>
      ) : (
        <ul className="divide-y">
          {regionales.map(regional => (
            <li key={regional.id} className="py-2 flex justify-between items-center">
              <span>
                <span className="font-semibold">{regional.nombre}</span>
                {regional.descripcion && <span className="text-gray-500 ml-2">{regional.descripcion}</span>}
              </span>
              <span>
                <button
                  className="btn text-xs bg-yellow-400 px-2 py-1 rounded mr-2"
                  onClick={() => handleEdit(regional)}
                >
                  Editar
                </button>
                {/* Botón Eliminar removido, solo se permite editar */}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RegionalesCrud;
