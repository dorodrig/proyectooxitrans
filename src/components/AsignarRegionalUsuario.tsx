import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { Usuario, Regional, TipoUsuario } from '../types';


interface AsignarRegionalUsuarioProps {
  regionales: Regional[];
}

const AsignarRegionalUsuario: React.FC<AsignarRegionalUsuarioProps> = () => {
  const [search, setSearch] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [regionalId, setRegionalId] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>('planta');
  const [mensaje, setMensaje] = useState<string | null>(null);
  // Eliminado: mensajeEliminacion y setMensajeEliminacion (no se usan)
  const queryClient = useQueryClient();

  // Buscar usuario
    const { data: usuariosRaw, isLoading: loadingUsuarios } = useQuery<unknown>({
      queryKey: ['buscar-usuario', search],
      queryFn: () => usuariosService.buscar(search),
      enabled: search.length > 2,
    });

    // Asegurar que usuarios sea siempre un array
    function isUsuariosResponse(obj: unknown): obj is { data: Usuario[] } {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'data' in obj &&
        Array.isArray((obj as { data: Usuario[] }).data)
      );
    }

    // Helper para asegurar que el array es Usuario[]
    function toUsuarioArray(arr: unknown): Usuario[] {
      if (Array.isArray(arr)) {
        return arr.filter(u => typeof u === 'object' && u !== null && 'id' in u) as Usuario[];
      }
      return [];
    }
    let usuarios: Usuario[] = [];
    if (Array.isArray(usuariosRaw)) {
      usuarios = toUsuarioArray(usuariosRaw);
    } else if (isUsuariosResponse(usuariosRaw)) {
      usuarios = toUsuarioArray((usuariosRaw as { data: Usuario[] }).data);
    }
    let usuariosFiltrados: Usuario[] = usuarios;
    if (search.length > 2 && usuarios.length > 0) {
      const isDocumento = /^\d{6,}$/.test(search.trim());
      if (isDocumento) {
        usuariosFiltrados = usuarios.filter(u => u.documento === search.trim());
      } else {
        usuariosFiltrados = usuarios.filter(u =>
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(search.trim().toLowerCase()) ||
          u.documento.includes(search.trim())
        );
      }
    }

  // Mutación para asignar regional y tipo
  const mutation = useMutation({
    mutationFn: async () => {
      if (!usuarioSeleccionado || !regionalId) throw new Error('Faltan datos');
      return usuariosService.asignarRegionalYTipo(usuarioSeleccionado.id, regionalId, tipoUsuario);
    },
    onSuccess: () => {
      setMensaje('Regional y tipo asignados correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) setMensaje(err.message);
      else setMensaje('Error al asignar regional');
    },
  });

  const navigate = useNavigate();

  // Obtener regionales en tiempo real
  const { data: regionalesData = [] } = useQuery<Regional[]>({
    queryKey: ['regionales'],
    queryFn: async () => {
      const res = await fetch('/api/regionales');
      const json = await res.json();
      return json.data || [];
    },
  });


  return (
    <div className="asignar-regional-usuario p-4 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Asignar Regional y Tipo de Usuario</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuario por nombre o documento..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            if (usuarioSeleccionado) setUsuarioSeleccionado(null);
          }}
          className="form-input w-full"
        />
        {loadingUsuarios && <div>Buscando...</div>}
        {usuarioSeleccionado ? (
          <ul className="border rounded mt-2 bg-gray-50">
            <li
              key={usuarioSeleccionado.id}
              className="p-2 bg-red-400 text-white font-bold rounded"
            >
              {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido} - {usuarioSeleccionado.documento}
            </li>
          </ul>
        ) : (
          usuariosFiltrados.length > 0 && (
            <ul className="border rounded mt-2 bg-gray-50">
              {(usuariosFiltrados as Usuario[]).map((u: Usuario) => (
                <li
                  key={u.id}
                  className={`p-2 cursor-pointer hover:bg-gray-200 ${usuarioSeleccionado?.id === u.id ? 'bg-gray-300' : ''}`}
                  onClick={() => setUsuarioSeleccionado(u)}
                >
                  {u.nombre} {u.apellido} - {u.documento}
                </li>
              ))}
            </ul>
          )
        )}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <label className="block mb-1 font-medium">Regional</label>
        <button
          type="button"
          className="btn-gestionar-regionales"
          onClick={() => navigate('/admin/regionales')}
        >
          <span className="icon-gear">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </span>
          <span className="ml-2 font-semibold">Gestionar Regionales</span>
        </button>
      </div>
      <select
        className="form-input w-full mb-4"
        value={regionalId}
        onChange={e => setRegionalId(e.target.value)}
      >
        <option value="">Seleccione una regional</option>
        {regionalesData.map((r: Regional) => (
          <option key={r.id} value={r.id}>{r.nombre}</option>
        ))}
      </select>
  {/* Eliminado el modal, ahora la navegación es directa */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Tipo de Usuario</label>
        <select
          className="form-input w-full"
          value={tipoUsuario}
          onChange={e => setTipoUsuario(e.target.value as TipoUsuario)}
        >
          <option value="planta">Planta</option>
          <option value="visita">Visita</option>
        </select>
      </div>
      <button
        className="btn-primary w-full"
        disabled={!usuarioSeleccionado || !regionalId || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Asignar Regional y Tipo
      </button>
      {mensaje && <div className="mt-2 text-center text-green-700">{mensaje}</div>}
    </div>
  );
};

export default AsignarRegionalUsuario;
