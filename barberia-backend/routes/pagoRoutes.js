const express = require('express');
const router = express.Router();
const { crearPagoConKhipu, recibirNotificacionKhipu } = require('../controllers/pagoController');

router.post('/crearPago', crearPagoConKhipu);

router.post('/notificacion', recibirNotificacionKhipu);

module.exports = router;
