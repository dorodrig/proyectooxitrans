import React, { useState } from 'react';
import '../styles/components/regionales-crud.scss';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regionalesService } from '../services/regionalesService';
import type { Regional } from '../types';

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

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string; latitud?: number; longitud?: number }) =>
      regionalesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regionales'] });
      setNombre('');
      setDescripcion('');
      setLatitud(null);
      setLongitud(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; nombre: string; descripcion?: string; latitud?: number; longitud?: number }) =>
      regionalesService.update(data.id, { nombre: data.nombre, descripcion: data.descripcion, latitud: data.latitud, longitud: data.longitud }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regionales'] });
      setEditId(null);
      setNombre('');
      setDescripcion('');
      setLatitud(null);
      setLongitud(null);
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
  };

  // Componente para seleccionar coordenadas en el mapa
  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setLatitud(e.latlng.lat);
        setLongitud(e.latlng.lng);
      },
    });
    return latitud !== null && longitud !== null ? <Marker position={[latitud, longitud]} /> : null;
  }

  return (
    <div className="regionales-crud bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2 text-oxitrans-red">Gestionar Regionales</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (editId) {
            updateMutation.mutate({
              id: editId,
              nombre,
              descripcion,
              latitud: latitud === null ? undefined : latitud,
              longitud: longitud === null ? undefined : longitud,
            });
          } else {
            createMutation.mutate({
              nombre,
              descripcion,
              latitud: latitud === null ? undefined : latitud,
              longitud: longitud === null ? undefined : longitud,
            });
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
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Selecciona la ubicación en el mapa:</label>
          <MapContainer center={[latitud ?? DEFAULT_LAT, longitud ?? DEFAULT_LNG]} zoom={15} style={{ height: '350px', width: '100%' } as React.CSSProperties}>
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
