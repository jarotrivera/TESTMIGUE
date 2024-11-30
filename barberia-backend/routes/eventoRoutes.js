const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const authMiddleware = require('../middleware/authMiddleware'); // Asegurarse de importar el middleware si es necesario


// Ruta para crear un evento (requiere autenticación)
router.post('/', authMiddleware, eventoController.createEvento);

// Ruta para obtener todos los eventos de un negocio específico
router.get('/negocio/:id_negocio', authMiddleware, eventoController.getEventosPorNegocio);

// Ruta para actualizar un evento (requiere autenticación)
router.put('/:id', authMiddleware, eventoController.updateEvento);

// Ruta para eliminar un evento (requiere autenticación)
router.delete('/:id', authMiddleware, eventoController.deleteEvento);

module.exports = router;
