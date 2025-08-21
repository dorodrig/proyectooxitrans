import { Request, Response } from 'express';
import { NovedadModel } from '../models/NovedadModel';

export const NovedadesController = {
  async create(req: Request, res: Response) {
    try {
      const { usuarioId, tipo, fechaInicio, fechaFin, horas } = req.body;
      if (!usuarioId || !tipo || !fechaInicio || !fechaFin || !horas) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
      }
  const novedad = await NovedadModel.create({ usuarioId, tipo, fechaInicio, fechaFin, horas });
  return res.status(201).json({ success: true, data: novedad });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al registrar la novedad.', error });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
  const novedades = await NovedadModel.findAll();
  return res.json({ success: true, data: novedades });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener novedades.', error });
    }
  },

  async getByUsuario(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
  const novedades = await NovedadModel.findByUsuario(Number(usuarioId));
  return res.json({ success: true, data: novedades });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener novedades del usuario.', error });
    }
  }
};
