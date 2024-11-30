const express = require('express');
const router = express.Router();
const panelReservasController = require('../controllers/panelReservasController');

// Ruta para obtener reservas por negocio
router.get('/:id_negocio', panelReservasController.obtenerReservasPorNegocio);

module.exports = router;