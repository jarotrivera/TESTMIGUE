// routes/reservaHorarioRoutes.js
const express = require('express');
const router = express.Router();
const reservaHorarioController = require('../controllers/reservaHorarioController');

// Ruta para obtener los empleados disponibles para un servicio en un negocio
router.get('/disponibilidad/empleados/:negocioId/:servicioId', reservaHorarioController.obtenerEmpleadosDisponibles);

// Ruta para obtener el calendario de disponibilidad de un negocio
router.get('/calendario/:negocioId', reservaHorarioController.obtenerCalendarioDisponibilidad);

// Ruta para obtener bloques de horarios disponibles para una fecha específica
router.get('/bloques/:negocioId/:servicioId/:fecha', reservaHorarioController.obtenerBloquesDisponibles);

// Nueva Ruta para obtener disponibilidad general (todos los empleados disponibles en el negocio)
router.get('/disponibilidad/general/:negocioId/:servicioId', reservaHorarioController.obtenerDisponibilidadGeneral);

// Nueva Ruta para obtener disponibilidad de un empleado específico
router.get('/disponibilidad/empleado/:negocioId/:servicioId/:empleadoId', reservaHorarioController.obtenerDisponibilidadEmpleado);

// Ruta para crear una nueva reserva
router.post('/crear', reservaHorarioController.crearReserva);

module.exports = router;
