import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../types';

const AdminUsuariosPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [accionError, setAccionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoadingAuth = useAuthStore(state => state.isLoading);
  const navigate = useNavigate();

  const token = localStorage.getItem('auth_token');
  const { data, isLoading, error } = useQuery({
    queryKey: ['usuarios', searchQuery],
    queryFn: async () => {
      if (!token) {
        await logout();
        navigate('/login');
        throw new Error('Token no encontrado, redirigiendo a login');
      }
      try {
        return await usuariosService.getAll(1, 50, searchQuery);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.toLowerCase().includes('401')) {
          setSessionExpired(true);
          await logout();
          navigate('/login');
        }
        throw err;
      }
    },
    enabled: isAuthenticated && !isLoadingAuth,
  });
  // Adaptar para respuesta anidada: { success, data: { usuarios, ... } }
  const usuarios: Usuario[] = data?.data?.usuarios || [];

  const mutation = useMutation({
    mutationFn: async ({ id, nuevoEstado }: { id: string; nuevoEstado: 'activo' | 'inactivo' }) => {
      setAccionError(null);
      try {
        const res = await usuariosService.toggleStatus(id, nuevoEstado);
        if (res && typeof res === 'object' && 'data' in res && res.data) {
          return res.data as Usuario;
        }
        return res as Usuario || null;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.toLowerCase().includes('401')) {
          setSessionExpired(true);
          await logout();
          navigate('/login');
        }
        if (err instanceof Error) {
          setAccionError(err.message || 'Error al cambiar el estado del usuario');
        } else {
          setAccionError('Error al cambiar el estado del usuario');
        }
        throw err;
      }
    },
    onMutate: async ({ id, nuevoEstado }) => {
      await queryClient.cancelQueries({ queryKey: ['usuarios'] });
      const previousData = queryClient.getQueryData<{ data: { usuarios: Usuario[] } }>(['usuarios', searchQuery]);
      // Actualización optimista
      queryClient.setQueryData(['usuarios', searchQuery], (oldData) => {
        if (!oldData || typeof oldData !== 'object') return oldData;
        const usuarios = (oldData as { data?: { usuarios?: Usuario[] } })?.data?.usuarios;
        if (!usuarios) return oldData;
        return {
          ...(oldData ?? {}),
          data: {
            ...((oldData as { data: { usuarios: Usuario[] } }).data),
            usuarios: usuarios.map((u: Usuario) =>
              u.id === id ? { ...u, estado: nuevoEstado } : u
            ),
          },
        };
      });
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Revertir si hay error
      if (context?.previousData) {
        queryClient.setQueryData(['usuarios', searchQuery], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
  };

  const handleToggleEstado = (usuario: Usuario) => {
    const nuevoEstado: 'activo' | 'inactivo' = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    mutation.mutate({ id: usuario.id, nuevoEstado });
  };

  return (
    <div className="admin-usuarios-page">
      <h1 className="text-2xl font-bold mb-4">Administración de Usuarios</h1>
      {sessionExpired && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          Tu sesión ha expirado. Por favor inicia sesión nuevamente.
        </div>
      )}
      {accionError && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
          {accionError}
        </div>
      )}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input w-64"
        />
        <button type="submit" className="btn-primary">Buscar</button>
      </form>
      {isLoading ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="text-red-500">Error al cargar usuarios</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario: Usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>{usuario.documento}</td>
                  <td>{usuario.rol}</td>
                  <td>{usuario.estado}</td>
                  <td>
                    <button
                      className={`btn ${usuario.estado === 'activo' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleEstado(usuario)}
                      disabled={mutation.isPending}
                    >
                      {usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">No se encontraron usuarios</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsuariosPage;
