import React, { useState } from 'react';
import NavigationBar from '../components/common/NavigationBar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import { cargosService } from '../services/cargosService';
import ResponsiveTable from '../components/ui/ResponsiveTable';
import { useResponsive } from '../hooks/useResponsive';
interface Cargo {
  id: string;
  nombre: string;
  descripcion?: string;
}
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../types';


const AdminUsuariosPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [accionError, setAccionError] = useState<string | null>(null);
  const { isMobile } = useResponsive();
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

  // Obtener cargos disponibles
  const { data: cargosData } = useQuery({ queryKey: ['cargos'], queryFn: cargosService.getAll });
  const cargos: Cargo[] = cargosData || [];

  // Mutación para asignar cargo
  const asignarCargoMutation = useMutation({
    mutationFn: async ({ id, cargo }: { id: string; cargo: string }) => {
      return usuariosService.asignarCargo(id, cargo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

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
      <NavigationBar title="Administración de Usuarios" />
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
      <div className="acciones-usuarios">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input w-full max-w-xs"
          />
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
        <button
          className="btn-primary asignar-roles-btn"
          onClick={() => navigate('/admin/asignar-roles')}
        >
          Asignar Roles
        </button>
      </div>
      {/* Estadísticas */}
      {!isLoading && !error && (
        <div className="table-stats">
          <div className="stat-card">
            <span className="stat-number">{usuarios.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{usuarios.filter(u => u.estado === 'activo').length}</span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{usuarios.filter(u => u.estado === 'inactivo').length}</span>
            <span className="stat-label">Inactivos</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <p>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="text-red-500">Error al cargar usuarios</p>
        </div>
      ) : isMobile ? (
        // Vista de tarjetas para móvil
        <div className="users-cards-container">
          {usuarios.length > 0 ? (
            usuarios.map((usuario: Usuario) => (
              <div key={usuario.id} className="user-card">
                <div className="user-card-header">
                  <h3 className="user-name">{usuario.nombre} {usuario.apellido}</h3>
                  <span className={`badge ${usuario.estado === 'activo' ? 'badge-success' : 'badge-secondary'}`}>
                    {usuario.estado}
                  </span>
                </div>
                
                <div className="user-card-body">
                  <div className="user-field">
                    <span className="field-label">Documento:</span>
                    <span className="field-value">{usuario.documento}</span>
                  </div>
                  
                  <div className="user-field">
                    <span className="field-label">Rol:</span>
                    <span className={`badge badge-${usuario.rol === 'admin' ? 'primary' : usuario.rol === 'supervisor' ? 'warning' : 'secondary'}`}>
                      {usuario.rol}
                    </span>
                  </div>
                  
                  <div className="user-field">
                    <span className="field-label">Cargo:</span>
                    <select
                      value={usuario.cargo || ''}
                      onChange={e => asignarCargoMutation.mutate({ id: usuario.id, cargo: e.target.value })}
                      className="cargo-select-mobile"
                      disabled={asignarCargoMutation.isPending}
                    >
                      <option value="">Sin cargo</option>
                      {cargos.map((cargo: Cargo) => (
                        <option key={cargo.id} value={cargo.nombre}>{cargo.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="user-card-footer">
                  <button
                    className={`btn ${usuario.estado === 'activo' ? 'btn-danger' : 'btn-success'} btn-full-width`}
                    onClick={() => handleToggleEstado(usuario)}
                    disabled={mutation.isPending}
                  >
                    {usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </div>
      ) : (
        // Vista de tabla para desktop
        <ResponsiveTable
          variant="default"
          stats={[
            { label: 'Total', value: usuarios.length },
            { label: 'Activos', value: usuarios.filter(u => u.estado === 'activo').length },
            { label: 'Inactivos', value: usuarios.filter(u => u.estado === 'inactivo').length }
          ]}
        >
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Rol</th>
                <th>Cargo</th>
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
                    <td>
                      <span className={`badge badge-${usuario.rol === 'admin' ? 'primary' : usuario.rol === 'supervisor' ? 'warning' : 'secondary'}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td>
                      <div className="lista-cargos-usuario">
                        <select
                          value={usuario.cargo || ''}
                          onChange={e => asignarCargoMutation.mutate({ id: usuario.id, cargo: e.target.value })}
                          className="cargo-item"
                          disabled={asignarCargoMutation.isPending}
                        >
                          <option value="">Sin cargo</option>
                          {cargos.map((cargo: Cargo) => (
                            <option key={cargo.id} value={cargo.nombre}>{cargo.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${usuario.estado === 'activo' ? 'badge-success' : 'badge-secondary'}`}>
                        {usuario.estado}
                      </span>
                    </td>
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
                  <td colSpan={6} className="text-center">No se encontraron usuarios</td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      )}
    </div>
  );
};

export default AdminUsuariosPage;
