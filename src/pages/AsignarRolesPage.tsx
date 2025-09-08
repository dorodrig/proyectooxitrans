import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { Usuario, Rol } from '../types';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/common/NavigationBar';

const ROLES: Rol[] = ['admin', 'empleado', 'supervisor'];

const AsignarRolesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | ''>('');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['usuarios', searchQuery],
    queryFn: () => usuariosService.getAll(1, 50, searchQuery),
  });
  const usuarios: Usuario[] = data?.data?.usuarios || [];

  const asignarRolMutation = useMutation({
    mutationFn: async ({ usuarioId, nuevoRol }: { usuarioId: string; nuevoRol: Rol }) => {
      return await usuariosService.asignarRol(usuarioId, nuevoRol);
    },
    onSuccess: () => {
      setMensaje('Rol asignado correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setUsuarioSeleccionado(null);
      setRolSeleccionado('');
    },
    onError: (err: unknown) => {
      if (err instanceof Error) setMensaje(err.message);
      else setMensaje('Error al asignar el rol');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
  };

  const handleAsignarRol = () => {
    if (!usuarioSeleccionado || !rolSeleccionado) {
      setMensaje('Selecciona usuario y rol');
      return;
    }
    // Log para depuración
    console.log('[AsignarRol] usuarioId:', usuarioSeleccionado.id, 'rol:', rolSeleccionado);
    asignarRolMutation.mutate({ usuarioId: usuarioSeleccionado.id, nuevoRol: rolSeleccionado });
  };

  return (
    <div className="asignar-roles-page">
      <NavigationBar 
        title="Asignar Roles a Usuarios"
        showBackButton={true}
        showHomeButton={true}
        showBreadcrumb={true}
        showRefreshButton={true}
      />
      <div className="asignar-roles-container">
        <h1>Asignar Roles a Usuarios</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit">Buscar</button>
        </form>
        {mensaje && <div className="mensaje">{mensaje}</div>}
        <div className="tabla-usuarios">
          {isLoading ? (
            <p className="mensaje">Cargando usuarios...</p>
          ) : error ? (
            <p className="mensaje error">Error al cargar usuarios</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Rol Actual</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario: Usuario) => (
                    <tr key={usuario.id} className={usuarioSeleccionado?.id === usuario.id ? 'seleccionado' : ''}>
                      <td>{usuario.nombre} {usuario.apellido}</td>
                      <td>{usuario.documento}</td>
                      <td className="capitalize">{usuario.rol}</td>
                      <td>
                        <button
                          className="seleccionar-btn"
                          onClick={() => setUsuarioSeleccionado(usuario)}
                          disabled={usuarioSeleccionado?.id === usuario.id}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="mensaje">No se encontraron usuarios</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {usuarioSeleccionado && (
          <div className="asignar-rol-form">
            <div>
              Asignar nuevo rol a <span className="usuario-nombre">{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</span>
            </div>
            <select
              value={rolSeleccionado}
              onChange={e => setRolSeleccionado(e.target.value as Rol)}
            >
              <option value="">Selecciona un rol</option>
              {ROLES.map(rol => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
            <button type="button" onClick={handleAsignarRol}>Asignar Rol</button>
          </div>
        )}
        <button className="volver-btn" onClick={() => navigate('/admin/usuarios')}>Volver a Administración de Usuarios</button>
      </div>
    </div>
  );
};

export default AsignarRolesPage;
