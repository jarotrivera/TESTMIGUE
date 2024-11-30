// archivo: routes/soporteRoutes.js
const express = require('express');
const router = express.Router();
const soporteController = require('../controllers/soporteController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Verifica que el soporteController contiene `crearTicket`
router.post('/crear', authMiddleware, upload.fields([
    { name: 'asunto', maxCount: 1 },
    { name: 'descripcion', maxCount: 1 },
    { name: 'prioridad', maxCount: 1 },
    { name: 'imagen', maxCount: 1 } // La imagen es opcional
  ]), soporteController.crearTicket);

router.get('/tickets', authMiddleware, soporteController.obtenerTicketsUsuario);

// Ruta para obtener todos los tickets de soporte (solo para administradores)
router.get('/todos', authMiddleware, soporteController.obtenerTodosLosTickets);

// Ruta para actualizar el estado de un ticket de soporte
router.put('/:id/estado', authMiddleware, soporteController.actualizarEstadoTicket);

module.exports = router;
