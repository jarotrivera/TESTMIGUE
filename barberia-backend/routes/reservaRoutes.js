const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para crear una reserva (disponible para cualquier usuario)
router.get('/empleados', authMiddleware , reservaController.obtenerReservacionesPorEmpleado);
router.get('/reservas-por-mes', authMiddleware, reservaController.obtenerReservasPorMes);
router.get('/reservas-por-fecha', authMiddleware, reservaController.obtenerReservasPorFecha);


router.post('/reservas', reservaController.createReserva);



// Ruta para obtener disponibilidad de un servicio en una fecha específica
router.get('/disponibilidad/:id_servicio/:fecha', reservaController.getDisponibilidad);


module.exports = router;
