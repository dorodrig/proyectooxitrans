import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { Usuario, Regional, TipoUsuario } from '../types';


interface AsignarRegionalUsuarioProps {
  regionales: Regional[];
}

const AsignarRegionalUsuario: React.FC<AsignarRegionalUsuarioProps> = ({ regionales }) => {
  const [search, setSearch] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [regionalId, setRegionalId] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>('planta');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Buscar usuario
  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['buscar-usuario', search],
    queryFn: () => usuariosService.buscar(search),
    enabled: search.length > 2,
  });

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

  return (
    <div className="asignar-regional-usuario p-4 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Asignar Regional y Tipo de Usuario</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuario por nombre o documento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input w-full"
        />
        {loadingUsuarios && <div>Buscando...</div>}
        {usuarios && (
          <ul className="border rounded mt-2 bg-gray-50">
            {usuarios.map((u: Usuario) => (
              <li
                key={u.id}
                className={`p-2 cursor-pointer hover:bg-gray-200 ${usuarioSeleccionado?.id === u.id ? 'bg-gray-300' : ''}`}
                onClick={() => setUsuarioSeleccionado(u)}
              >
                {u.nombre} {u.apellido} - {u.documento}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Regional</label>
        <select
          className="form-input w-full"
          value={regionalId}
          onChange={e => setRegionalId(e.target.value)}
        >
          <option value="">Seleccione una regional</option>
          {regionales.map(r => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
      </div>
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
