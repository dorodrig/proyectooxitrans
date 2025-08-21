import { executeQuery } from '../config/database';

export interface Cargo {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const CargoModel = {
  async getAll(): Promise<Cargo[]> {
    const rows = await executeQuery('SELECT * FROM cargos');
    return rows as Cargo[];
  },
  async create(nombre: string, descripcion?: string): Promise<Cargo> {
    const nombreLower = nombre.toLowerCase();
    const descripcionLower = descripcion ? descripcion.toLowerCase() : undefined;
    const result = await executeQuery('INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)', [nombreLower, descripcionLower]);
    const insertId = Array.isArray(result) ? result[0]?.insertId : undefined;
    return { id: insertId?.toString() ?? '', nombre: nombreLower, descripcion: descripcionLower };
  },
  async update(id: string, data: Partial<Cargo>): Promise<Cargo | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (data.nombre) {
      fields.push('nombre = ?');
      values.push(data.nombre.toLowerCase());
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion ? data.descripcion.toLowerCase() : null);
    }
    if (fields.length === 0) return null;
    values.push(id);
    await executeQuery(`UPDATE cargos SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await executeQuery('SELECT * FROM cargos WHERE id = ?', [id]);
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as Cargo) : null;
  },
  async delete(id: string): Promise<boolean> {
    const result = await executeQuery('DELETE FROM cargos WHERE id = ?', [id]);
    if (Array.isArray(result) && typeof result[0]?.affectedRows === 'number') {
      return result[0].affectedRows > 0;
    }
    return false;
  },
};
