// servicioRoutes.js

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para crear un servicio con autenticación y validación
router.post(
  '/',
  authMiddleware,
  [
    body('nombre').notEmpty().withMessage('El nombre del servicio es obligatorio'),
    body('duracion').isInt({ min: 1 }).withMessage('La duración debe ser un número mayor a 0'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('id_negocio').notEmpty().withMessage('El ID del negocio es obligatorio'),
  ],
  servicioController.createServicio
);

// Ruta para obtener todos los servicios
router.get('/', authMiddleware, servicioController.getServicios);

// Ruta para obtener un servicio específico por ID
router.get('/:id', servicioController.getServicioById);

// Ruta para actualizar un servicio con autenticación y validación
router.put(
  '/:id',
  authMiddleware,
  [
    body('nombre').notEmpty().withMessage('El nombre del servicio es obligatorio'),
    body('duracion').isInt({ min: 1 }).withMessage('La duración debe ser un número mayor a 0'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('id_negocio').notEmpty().withMessage('El ID del negocio es obligatorio'),
  ],
  servicioController.updateServicio
);

// Ruta para eliminar un servicio con autenticación
router.delete('/:id', authMiddleware, servicioController.deleteServicio);

router.get('/empleado/:id_empleado/servicios', authMiddleware,servicioController.getServiciosByEmpleado);


// Ruta para obtener empleados asignados a un servicio específico
router.get('/servicios/:id_servicio/empleados', authMiddleware, servicioController.getEmpleadosByServicio);

router.get('/negocio/:id_negocio',  servicioController.getServiciosByNegocio);

module.exports = router;

