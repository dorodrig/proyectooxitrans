import { executeQuery, executeInsertQuery } from '../config/database';
import { ResultSetHeader } from 'mysql2';

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
    try {
      const rows = await executeQuery('SELECT * FROM regionales ORDER BY nombre');
      return rows as Regional[];
    } catch (error) {
      console.error('Error en RegionalModel.getAll:', error);
      throw new Error('Error al obtener regionales');
    }
  },

  async obtenerPorUsuario(usuarioId: number): Promise<Regional | null> {
    try {
      console.log('🏢 [DEBUG] RegionalModel.obtenerPorUsuario - usuarioId:', usuarioId);
      
      // Primero verificar que el usuario exista y tenga regional_id
      const checkUsuarioQuery = `
        SELECT id, nombre, apellido, regional_id 
        FROM usuarios 
        WHERE id = ?
      `;
      console.log('🏢 [DEBUG] Verificando usuario:', checkUsuarioQuery);
      const usuarioCheck = await executeQuery(checkUsuarioQuery, [usuarioId]);
      console.log('🏢 [DEBUG] Usuario encontrado:', usuarioCheck);
      
      if (usuarioCheck.length === 0) {
        console.log('🏢 [DEBUG] Usuario no encontrado');
        return null;
      }
      
      const usuario = usuarioCheck[0] as any;
      if (!usuario.regional_id) {
        console.log('🏢 [DEBUG] Usuario sin regional_id asignada');
        return null;
      }
      
      // Ahora obtener la regional
      const query = `
        SELECT * 
        FROM regionales 
        WHERE id = ?
      `;
      console.log('🏢 [DEBUG] Query a ejecutar:', query);
      console.log('🏢 [DEBUG] Parámetros:', [usuario.regional_id]);
      
      const result = await executeQuery(query, [usuario.regional_id]);
      console.log('🏢 [DEBUG] Resultado de la query:', result);
      
      const regional = result.length > 0 ? result[0] as Regional : null;
      console.log('🏢 [DEBUG] Regional retornada:', regional);
      
      return regional;
    } catch (error) {
      console.error('❌ Error en RegionalModel.obtenerPorUsuario:', error);
      throw new Error('Error al obtener regional del usuario');
    }
  },

  async create(nombre: string, descripcion?: string, latitud?: number, longitud?: number): Promise<Regional> {
    try {
      console.log('🗄️ RegionalModel.create recibió:', { nombre, descripcion, latitud, longitud });
      
      // El executeQuery devuelve un ResultSetHeader de MySQL
      // No necesitamos una interfaz personalizada ya que mysql2 la proporciona
      
      // Validar nombre
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        throw new Error('Nombre es requerido y debe ser una cadena válida');
      }
      
      // Guardar en minúsculas
      const nombreLower = nombre.toLowerCase();
      const descripcionLower = descripcion ? descripcion.toLowerCase() : undefined;
      
      const result = await executeInsertQuery(
        'INSERT INTO regionales (nombre, descripcion, latitud, longitud) VALUES (?, ?, ?, ?)',
        [nombreLower, descripcionLower, latitud ?? null, longitud ?? null]
      );
      
      console.log('🗄️ Resultado del INSERT:', result);
      
      // Ahora podemos acceder al insertId de forma type-safe
      const insertId = result.insertId;
      
      if (!insertId || insertId === 0) {
        console.error('❌ InsertId no válido:', insertId);
        throw new Error('No se pudo obtener el ID de la regional creada');
      }
      
      console.log('✅ Regional creada con ID:', insertId);
      
      return { 
        id: insertId.toString(), 
        nombre: nombreLower, 
        descripcion: descripcionLower, 
        latitud, 
        longitud 
      };
    } catch (error) {
      console.error('Error en RegionalModel.create:', error);
      throw new Error('Error al crear regional');
    }
  },

  async update(id: string, data: Partial<Regional>): Promise<Regional | null> {
    try {
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
      
      if (fields.length === 0) {
        return null;
      }
      
      values.push(id);
      
      await executeInsertQuery(`UPDATE regionales SET ${fields.join(', ')} WHERE id = ?`, values);
      
      const rows = await executeQuery('SELECT * FROM regionales WHERE id = ?', [id]);
      return Array.isArray(rows) && rows.length > 0 ? (rows[0] as Regional) : null;
    } catch (error) {
      console.error('Error en RegionalModel.update:', error);
      throw new Error('Error al actualizar regional');
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const result = await executeInsertQuery('DELETE FROM regionales WHERE id = ?', [id]);
      
      // El resultado es un ResultSetHeader, podemos acceder directamente a affectedRows
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en RegionalModel.delete:', error);
      throw new Error('Error al eliminar regional');
    }
  },
};
