import { executeQuery, executeInsertQuery } from '../config/database';

export interface Novedad {
  id?: number;
  usuarioId: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  horas: number;
}

export const NovedadModel = {
  async create(novedad: Novedad) {
    const query = `INSERT INTO novedades (usuarioId, tipo, fechaInicio, fechaFin, horas) VALUES (?, ?, ?, ?, ?)`;
    const result = await executeInsertQuery(query, [
      novedad.usuarioId,
      novedad.tipo,
      novedad.fechaInicio,
      novedad.fechaFin,
      novedad.horas
    ]);
    return { ...novedad, id: result.insertId };
  },
  async findAll() {
    const query = `SELECT * FROM novedades`;
    return await executeQuery(query);
  },
  async findByUsuario(usuarioId: number) {
    const query = `SELECT * FROM novedades WHERE usuarioId = ?`;
    return await executeQuery(query, [usuarioId]);
  }
};
