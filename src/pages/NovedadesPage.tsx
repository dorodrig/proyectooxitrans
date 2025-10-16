import React, { useState } from 'react';
import NavigationBar from '../components/common/NavigationBar';
import '../styles/pages/novedadesPage.scss';
import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import { novedadesService } from '../services/novedadesService';


const tiposNovedad = [
  { value: 'incapacidad', label: 'Incapacidad' },
  { value: 'ausentismo', label: 'Ausentismo' },
  { value: 'permiso', label: 'Permiso' },
  { value: 'no_remunerado', label: 'Día no remunerado' },
  { value: 'lic_maternidad', label: 'Licencia de maternidad' },
  { value: 'lic_paternidad', label: 'Licencia de paternidad' },
  { value: 'dia_familia', label: 'Día de la familia' },
  { value: 'horas_extra', label: '⏰ Horas Extra' },
];

const NovedadesPage: React.FC = () => {
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horas, setHoras] = useState('');
  const [msg, setMsg] = useState<string|null>(null);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);

  // Obtener usuarios activos
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-activos'],
    queryFn: async () => {
      const res = await usuariosService.getAll(1, 100, '');
      return res?.data?.usuarios?.filter((u: { estado: string }) => u.estado === 'activo') || [];
    }
  });
  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarioSearch.trim().length > 0
    ? usuarios.filter((u: { nombre: string; apellido: string; documento: string }) =>
        (`${u.nombre} ${u.apellido} ${u.documento}`.toLowerCase().includes(usuarioSearch.toLowerCase()))
      )
    : usuarios;

  // Calcular horas automáticamente si hay rango de fechas
  React.useEffect(() => {
    if (fechaInicio && fechaFin && fechaInicio !== fechaFin) {
      const ini = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const dias = Math.ceil((fin.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setHoras((dias * 8).toString());
    } else if (fechaInicio && fechaFin && fechaInicio === fechaFin) {
      setHoras(''); // Se debe ingresar manualmente
    }
  }, [fechaInicio, fechaFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!usuarioId || !tipo || !fechaInicio || !fechaFin || !horas) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setErrorMsg('La fecha final no puede ser menor que la inicial.');
      return;
    }
    if (Number(horas) <= 0) {
      setErrorMsg('La cantidad de horas debe ser mayor a cero.');
      return;
    }
    try {
      await novedadesService.create({ usuarioId, tipo, fechaInicio, fechaFin, horas: Number(horas) });
      setMsg('Novedad registrada correctamente');
      setUsuarioId('');
      setTipo('');
      setFechaInicio('');
      setFechaFin('');
      setHoras('');
      setTimeout(() => setMsg(null), 2000);
    } catch (err) {
      setErrorMsg('Error al registrar la novedad'+err);
    }
  };

  return (
    <div className="novedades-page">
      <NavigationBar title="Registro de Novedades" />
      <h1 className="text-2xl font-bold mb-4 text-oxitrans-primary">Agregar Novedades a Usuarios</h1>
      <form className="novedad-form" onSubmit={handleSubmit}>
        {errorMsg && <div className="msg-error">{errorMsg}</div>}
        <div className="form-group">
          <label>Usuario</label>
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={usuarioSearch}
            onChange={e => setUsuarioSearch(e.target.value)}
            style={{ marginBottom: '0.5rem' }}
          />
          <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} required>
            <option value="">Selecciona un usuario</option>
            {usuariosFiltrados.map((u: { id: string; nombre: string; apellido: string; documento: string }) => (
              <option key={u.id} value={u.id}>{u.nombre} {u.apellido} - {u.documento}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tipo de novedad</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} required>
            <option value="">Selecciona tipo</option>
            {tiposNovedad.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Fecha inicial</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Fecha final</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Cantidad de horas</label>
          <input type="number" value={horas} onChange={e => setHoras(e.target.value)} min={1} placeholder="Horas" required={fechaInicio === fechaFin} />
          <small>{fechaInicio && fechaFin && fechaInicio !== fechaFin ? 'Calculado automáticamente (8h/día)' : 'Si es solo un día, ingresa las horas.'}</small>
        </div>
        <button type="submit" className="btn-primary">Registrar Novedad</button>
      </form>
  {msg && <div className="msg-success">{msg}</div>}
    </div>
  );
};

export default NovedadesPage;
