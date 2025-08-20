import { executeQuery } from '../config/database';

export interface Regional {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const RegionalModel = {
  async getAll(): Promise<Regional[]> {
    const rows = await executeQuery('SELECT * FROM regionales');
    return rows as Regional[];
  },
  async create(nombre: string, descripcion?: string): Promise<Regional> {
    // Definir tipo para el resultado del insert
    interface InsertResult {
      insertId: number | string;
    }
    const result = await executeQuery('INSERT INTO regionales (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]) as InsertResult[];
    const insertId = Array.isArray(result) ? result[0]?.insertId : undefined;
    return { id: insertId?.toString() ?? '', nombre, descripcion };
  },
};
