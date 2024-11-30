const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authClienteMiddleware = require('../middleware/authClienteMiddleware'); //Importamos el middleware de autenticación

router.post('/register', clienteController.crearCuentaCliente);
router.post('/loginc', clienteController.loginCliente);
router.get('/verificar-correo', clienteController.verificarCorreo);
router.post('/invitado', clienteController.crearOActualizarCliente);
router.get('/me', authClienteMiddleware, clienteController.getCliente);
router.put('/me', authClienteMiddleware, clienteController.updateCliente);
router.get('/historial/:id_cliente', authClienteMiddleware, clienteController.obtenerHistorialReservas);

module.exports = router;
