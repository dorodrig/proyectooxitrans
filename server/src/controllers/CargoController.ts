import { Request, Response } from 'express';
import { CargoModel } from '../models/CargoModel';

export const CargoController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const cargos = await CargoModel.getAll();
    res.json({ success: true, data: cargos });
  },
  async create(req: Request, res: Response): Promise<void> {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      res.status(400).json({ success: false, message: 'Nombre requerido' });
      return;
    }
    const cargo = await CargoModel.create(nombre, descripcion);
    res.json({ success: true, data: cargo });
  },
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const cargo = await CargoModel.update(id, { nombre, descripcion });
    if (!cargo) {
      res.status(404).json({ success: false, message: 'Cargo no encontrado' });
      return;
    }
    res.json({ success: true, data: cargo });
  },
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const success = await CargoModel.delete(id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Cargo no encontrado o no se pudo eliminar' });
      return;
    }
    res.json({ success: true });
  },
};
