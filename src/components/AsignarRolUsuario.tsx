
import '../styles/components/_asignarRolUsuario.scss';
import React, { useState } from 'react';

import type { Usuario, Rol } from '../types';

interface AsignarRolUsuarioProps {
  usuario: Usuario;
  rolesDisponibles: Rol[];
  onAsignar: (usuarioId: string, nuevoRol: Rol) => void;
  onClose: () => void;
}

const AsignarRolUsuario: React.FC<AsignarRolUsuarioProps> = ({ usuario, rolesDisponibles, onAsignar, onClose }) => {
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol>(usuario.rol as Rol);
  const [error, setError] = useState<string | null>(null);

  const handleAsignar = () => {
    if (!rolSeleccionado) {
      setError('Selecciona un rol válido');
      return;
    }
    setError(null);
    onAsignar(usuario.id, rolSeleccionado);
  };

  return (
    <div className="asignar-rol-modal">
      <div className="modal-content">
        <h2>Asignar Rol a {usuario.nombre} {usuario.apellido}</h2>
        <label>Rol</label>
        <select
          value={rolSeleccionado}
          onChange={e => setRolSeleccionado(e.target.value as Rol)}
        >
          {rolesDisponibles.map(rol => (
            <option key={rol} value={rol}>{rol}</option>
          ))}
        </select>
        {error && <div className="error">{error}</div>}
        <div className="actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleAsignar}>Asignar</button>
        </div>
      </div>
    </div>
  );
};

export default AsignarRolUsuario;
