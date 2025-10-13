import { Request, Response } from 'express';
import { RegionalModel } from '../models/RegionalModel';
import { executeQuery } from '../config/database';

export const RegionalController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const regionales = await RegionalModel.getAll();
      res.json({ success: true, data: regionales });
    } catch (error) {
      console.error('Error en getAll regionales:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener regionales' 
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 Datos recibidos para crear regional:', req.body);
      
      const { nombre, descripcion, latitud, longitud } = req.body;
      
      // Validaciones mejoradas
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Nombre requerido y debe ser una cadena válida' });
        return;
      }

      // Validar coordenadas si están presentes
      let validLatitud: number | undefined = undefined;
      let validLongitud: number | undefined = undefined;

      if (latitud !== undefined && latitud !== null) {
        const parsedLat = parseFloat(latitud);
        if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
          res.status(400).json({ success: false, message: 'Latitud debe ser un número válido entre -90 y 90' });
          return;
        }
        validLatitud = parsedLat;
      }

      if (longitud !== undefined && longitud !== null) {
        const parsedLng = parseFloat(longitud);
        if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
          res.status(400).json({ success: false, message: 'Longitud debe ser un número válido entre -180 y 180' });
          return;
        }
        validLongitud = parsedLng;
      }

      const regional = await RegionalModel.create(
        nombre.trim(), 
        descripcion ? descripcion.trim() : undefined, 
        validLatitud, 
        validLongitud
      );
      
      console.log('✅ Regional creada exitosamente:', regional);
      res.json({ success: true, data: regional });
    } catch (error) {
      console.error('❌ Error en create regional:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor al crear regional',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, descripcion, latitud, longitud } = req.body;
      
      const regional = await RegionalModel.update(id, { nombre, descripcion, latitud, longitud });
      
      if (!regional) {
        res.status(404).json({ success: false, message: 'Regional no encontrada' });
        return;
      }
      
      res.json({ success: true, data: regional });
    } catch (error) {
      console.error('Error en update regional:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al actualizar regional' 
      });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Verificar si existen usuarios asociados a la regional
      const usuariosAsociados = await executeQuery('SELECT id FROM usuarios WHERE regional_id = ?', [id]);
      
      if (Array.isArray(usuariosAsociados) && usuariosAsociados.length > 0) {
        res.status(409).json({ 
          success: false, 
          message: 'No se puede eliminar la regional porque tiene usuarios asociados.' 
        });
        return;
      }
      
      const success = await RegionalModel.delete(id);
      
      if (!success) {
        res.status(404).json({ 
          success: false, 
          message: 'Regional no encontrada o no se pudo eliminar' 
        });
        return;
      }
      
      res.json({ success: true, message: 'Regional eliminada correctamente' });
    } catch (error) {
      console.error('Error en delete regional:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al eliminar regional' 
      });
    }
  },
};
