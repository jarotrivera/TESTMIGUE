// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, getUserById, getLoggedUser,updateUser, uploadProfileImage, registrarComoEmpleado, guardarDisponibilidad, obtenerDisponibilidad, eliminarDeEmpleadoNegocio, checkEmpleadoStatus } = require('../controllers/userController');
const upload = require('../middleware/upload');

// Rutas de usuario
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getLoggedUser); // Ruta /me antes de /:id
router.get('/:id', getUserById);
router.put('/update', authMiddleware, updateUser);
router.post('/upload-profile-image', authMiddleware, (req, res) => {
    upload.single('profileImage')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      // Llama al controlador si no hay errores
      uploadProfileImage(req, res);
    });
  });

  router.post('/registrar-empleado', authMiddleware, registrarComoEmpleado);

  // Ruta para guardar disponibilidad del empleado
  router.post('/guardar-disponibilidad', authMiddleware, guardarDisponibilidad);
  
  // Ruta para obtener disponibilidad del empleado
  router.get('/disponibilidad/:id_usuario', authMiddleware, obtenerDisponibilidad);
  
  // Ruta para eliminar al usuario de empleado_negocio
  router.post('/eliminar-empleado', authMiddleware, eliminarDeEmpleadoNegocio);

  router.get('/empleado/:id_usuario', authMiddleware, checkEmpleadoStatus);



  
module.exports = router;
