import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Pencil, Briefcase } from 'lucide-react';
import styles from '../styles/components/CargosCrud.module.scss';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cargosService } from '../services/cargosService';

interface Cargo {
  id: string | number;
  nombre: string;
  descripcion?: string;
}

const CargosCrud: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data: cargos = [], isLoading } = useQuery({
    queryKey: ['cargos', search, page],
    queryFn: async () => {
      const all = await cargosService.getAll();
      if (search.trim()) {
        return all.filter((c: Cargo) => c.nombre.toLowerCase().includes(search.toLowerCase()));
      }
      return all;
    }
  });
  const totalPages = Math.ceil(cargos.length / PAGE_SIZE);
  const cargosPage = cargos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) => cargosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
      setNombre('');
      setDescripcion('');
      setSuccessMsg('Cargo agregado correctamente');
      setTimeout(() => setSuccessMsg(null), 2000);
    },
    onError: () => {
      setErrorMsg('Error al agregar el cargo');
      setTimeout(() => setErrorMsg(null), 2500);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; nombre: string; descripcion?: string }) => cargosService.update(data.id, { nombre: data.nombre, descripcion: data.descripcion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
      setEditId(null);
      setNombre('');
      setDescripcion('');
      setSuccessMsg('Cargo actualizado correctamente');
      setTimeout(() => setSuccessMsg(null), 2000);
    },
    onError: () => {
      setErrorMsg('Error al actualizar el cargo');
      setTimeout(() => setErrorMsg(null), 2500);
    },
  });

  const handleEdit = (cargo: Cargo) => {
    setEditId(cargo.id.toString());
    setNombre(cargo.nombre);
    setDescripcion(cargo.descripcion || '');
  };

  const handleCancel = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
  };

  return (
      <div className={styles['cargos-crud']}>
        <h3 style={{ color: '#297372', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.3rem' }}>Gestionar Cargos</h3>
      {successMsg && (
        <div className="flex items-center gap-2 p-2 mb-2 bg-green-100 text-green-700 rounded animate-fade-in">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2 mb-2 bg-red-100 text-red-700 rounded animate-fade-in">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      <form onSubmit={e => {
        e.preventDefault();
        if (editId) {
          updateMutation.mutate({ id: editId, nombre, descripcion });
        } else {
          createMutation.mutate({ nombre, descripcion });
        }
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Nombre del cargo"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className={styles['form-input']}
                required
                style={{ paddingLeft: '2.2rem' }}
              />
              <BriefcaseIcon />
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className={styles['form-input']}
                style={{ paddingLeft: '2.2rem' }}
              />
              <PencilIcon />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
            <button type="submit" className={styles['edit-btn']}>
              {editId ? 'Actualizar' : 'Agregar'} <CheckCircle size={16} />
            </button>
            {editId && (
              <button type="button" className={styles['edit-btn']} style={{ background: '#e5e7eb', color: '#222' }} onClick={handleCancel}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#297372', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>Cargos creados</h2>
        {isLoading ? (
          <div>Cargando cargos...</div>
        ) : cargos.length === 0 ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded text-center">Aún no existen cargos registrados.</div>
  ) : null}
        {/* Mejora visual del grid de cargos */}
        <style>{`
          .cargo-card {
            transition: box-shadow 0.2s;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(200,16,46,0.07);
          }
          .cargo-card:hover {
            box-shadow: 0 4px 16px rgba(200,16,46,0.15);
            border-color: #c8102e;
          }
        `}</style>
        <div className={styles['search-bar']}>
          <input
            type="text"
            placeholder="Buscar cargo..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={styles['form-input']}
            style={{ minWidth: '180px' }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles['cargos-table']}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargosPage.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No se encontraron cargos.</td>
                </tr>
              ) : (
                cargosPage.map((cargo: Cargo) => (
                  <tr key={cargo.id.toString()}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#297372', fontWeight: 600 }}>
                      <Briefcase size={18} />
                      {cargo.nombre}
                    </td>
                    <td>{cargo.descripcion || '-'}</td>
                    <td>
                      <button
                        className={styles['edit-btn']}
                        onClick={() => handleEdit(cargo)}
                      >
                        <Pencil size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className={styles['pagination']}>
            <button className={styles['btn']} disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button className={styles['btn']} disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );

  // Iconos para los inputs
  function BriefcaseIcon() {
    return <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#297372' }}><Briefcase size={18} /></span>;
  }
  function PencilIcon() {
    return <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}><Pencil size={18} /></span>;
  }
};

export default CargosCrud;
