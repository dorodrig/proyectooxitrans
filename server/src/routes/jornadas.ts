import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { JornadaController } from '../controllers/jornadaController';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @route   GET /api/jornadas/actual
 * @desc    Obtener jornada actual del usuario autenticado
 * @access  Private
 */
router.get('/actual', JornadaController.obtenerJornadaActual);

/**
 * @route   POST /api/jornadas/registrar
 * @desc    Registrar tiempo de jornada laboral
 * @access  Private
 */
router.post('/registrar', JornadaController.registrarTiempo);

/**
 * @route   POST /api/jornadas/validar-ubicacion
 * @desc    Validar ubicación del usuario
 * @access  Private
 */
router.post('/validar-ubicacion', JornadaController.validarUbicacion);

/**
 * @route   GET /api/jornadas/historial
 * @desc    Obtener historial de jornadas del usuario
 * @access  Private
 */
router.get('/historial', JornadaController.obtenerHistorial);

/**
 * @route   POST /api/jornadas/:id/forzar-cierre
 * @desc    Forzar cierre de jornada
 * @access  Private
 */
router.post('/:id/forzar-cierre', JornadaController.forzarCierre);

export default router;