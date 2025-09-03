import { Router } from 'express';
import { body } from 'express-validator';
import { UsuariosController } from '../controllers/UsuariosController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones para crear usuario
const createUserValidation = [
  body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('apellido').trim().isLength({ min: 2, max: 100 }).withMessage('Apellido debe tener entre 2 y 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('documento').trim().isLength({ min: 6, max: 20 }).withMessage('Documento debe tener entre 6 y 20 caracteres'),
  body('tipoDocumento').isIn(['CC', 'CE', 'PA']).withMessage('Tipo de documento inválido'),
  body('rol').isIn(['admin', 'empleado', 'supervisor']).withMessage('Rol inválido'),
  body('departamento').trim().isLength({ min: 2, max: 100 }).withMessage('Departamento requerido'),
  body('cargo').trim().isLength({ min: 2, max: 100 }).withMessage('Cargo requerido'),
  body('fechaIngreso').isISO8601().withMessage('Fecha de ingreso inválida')
];

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('nombre').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('apellido').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Apellido debe tener entre 2 y 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('telefono').optional().trim().isLength({ max: 20 }).withMessage('Teléfono muy largo'),
  body('departamento').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Departamento requerido'),
  body('cargo').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Cargo requerido')
];

// Rutas específicas DEBEN ir ANTES que las rutas con parámetros
// Rutas dashboard (deben ir antes de /:id para evitar conflictos)
router.get('/stats', UsuariosController.getStats);
router.get('/por-rol', UsuariosController.getPorRol);
router.get('/por-departamento', UsuariosController.getPorDepartamento);
router.get('/por-cargo', UsuariosController.getPorCargo);
router.get('/novedades-stats', UsuariosController.getNovedadesStats);

// Rutas generales
router.get('/', UsuariosController.getAll);
router.get('/search', UsuariosController.search);
router.get('/departamento/:departamento', UsuariosController.getByDepartamento);
router.get('/:id', UsuariosController.getById);
router.post('/', createUserValidation, UsuariosController.create);
router.put('/:id', updateUserValidation, UsuariosController.update);

router.put('/:id/regional', UsuariosController.asignarRegionalYTipo);
router.put('/:id/status', UsuariosController.toggleStatus);
// Endpoint para asignar rol a un usuario
router.put('/:id/rol', UsuariosController.asignarRol);
// Endpoint para asignar cargo a un usuario
router.put('/:id/cargo', UsuariosController.asignarCargo);
router.post('/:id/reset-password', UsuariosController.resetPassword);
router.delete('/:id', UsuariosController.delete);

export default router;
