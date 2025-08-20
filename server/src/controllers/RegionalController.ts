import { Request, Response } from 'express';
import { RegionalModel } from '../models/RegionalModel';

export const RegionalController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const regionales = await RegionalModel.getAll();
    res.json({ success: true, data: regionales });
    return;
  },
  async create(req: Request, res: Response): Promise<void> {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      res.status(400).json({ success: false, message: 'Nombre requerido' });
      return;
    }
    const regional = await RegionalModel.create(nombre, descripcion);
    res.json({ success: true, data: regional });
    return;
  },
};
