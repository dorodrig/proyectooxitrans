import { executeQuery } from '../config/database';

export interface Regional {
  id: string;
  nombre: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
  created_at?: Date;
  updated_at?: Date;
}

export const RegionalModel = {
  async getAll(): Promise<Regional[]> {
    const rows = await executeQuery('SELECT * FROM regionales');
    return rows as Regional[];
  },
  async create(nombre: string, descripcion?: string, latitud?: number, longitud?: number): Promise<Regional> {
    // Definir tipo para el resultado del insert
    interface InsertResult {
      insertId: number | string;
    }
  // Guardar en minúsculas
  const nombreLower = nombre.toLowerCase();
  const descripcionLower = descripcion ? descripcion.toLowerCase() : undefined;
  const result = await executeQuery(
    'INSERT INTO regionales (nombre, descripcion, latitud, longitud) VALUES (?, ?, ?, ?)',
    [nombreLower, descripcionLower, latitud ?? null, longitud ?? null]
  ) as InsertResult[];
  const insertId = Array.isArray(result) ? result[0]?.insertId : undefined;
  return { id: insertId?.toString() ?? '', nombre: nombreLower, descripcion: descripcionLower, latitud, longitud };
  },
  async update(id: string, data: Partial<Regional>): Promise<Regional | null> {
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
    if (data.latitud !== undefined) {
      fields.push('latitud = ?');
      values.push(data.latitud);
    }
    if (data.longitud !== undefined) {
      fields.push('longitud = ?');
      values.push(data.longitud);
    }
    if (fields.length === 0) return null;
    values.push(id);
    await executeQuery(`UPDATE regionales SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await executeQuery('SELECT * FROM regionales WHERE id = ?', [id]);
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as Regional) : null;
  },
  async delete(id: string): Promise<boolean> {
    const result = await executeQuery('DELETE FROM regionales WHERE id = ?', [id]);
    // Si el resultado tiene affectedRows, devolver true si es mayor a 0
    if (Array.isArray(result) && typeof result[0]?.affectedRows === 'number') {
      return result[0].affectedRows > 0;
    }
    return false;
  },
};
