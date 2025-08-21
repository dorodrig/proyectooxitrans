import { Request, Response } from 'express';
import { RegionalModel } from '../models/RegionalModel';
import { executeQuery } from '../config/database';

export const RegionalController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const regionales = await RegionalModel.getAll();
    res.json({ success: true, data: regionales });
    return;
  },
  async create(req: Request, res: Response): Promise<void> {
    const { nombre, descripcion, latitud, longitud } = req.body;
    if (!nombre) {
      res.status(400).json({ success: false, message: 'Nombre requerido' });
      return;
    }
    const regional = await RegionalModel.create(nombre, descripcion, latitud, longitud);
    res.json({ success: true, data: regional });
    return;
  },
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { nombre, descripcion, latitud, longitud } = req.body;
    const regional = await RegionalModel.update(id, { nombre, descripcion, latitud, longitud });
    if (!regional) {
      res.status(404).json({ success: false, message: 'Regional no encontrada' });
      return;
    }
    res.json({ success: true, data: regional });
  },
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
      // Verificar si existen usuarios asociados a la regional
      const usuariosAsociados = await executeQuery('SELECT id FROM usuarios WHERE regional_id = ?', [id]);
      if (Array.isArray(usuariosAsociados) && usuariosAsociados.length > 0) {
        res.status(409).json({ success: false, message: 'No se puede eliminar la regional porque tiene usuarios asociados.' });
        return;
      }
      const success = await RegionalModel.delete(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Regional no encontrada o no se pudo eliminar' });
        return;
      }
      res.json({ success: true });
  },
};
