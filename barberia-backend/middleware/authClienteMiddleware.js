const jwt = require('jsonwebtoken');
const Cliente = require('../models/Cliente');

const authClienteMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o mal formado.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca al cliente en la base de datos
    const cliente = await Cliente.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'apellido', 'email_cliente', 'celular_cliente'], // Ajusta los campos según tu modelo
    });

    if (!cliente) {
      console.error('Cliente no encontrado.');
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    // Adjuntar los datos del cliente al objeto req.user
    req.user = {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email_cliente: cliente.email_cliente,
      celular_cliente: cliente.celular_cliente,
    };

    console.log('Cliente autenticado:', req.user); // Verifica los datos
    next();
  } catch (error) {
    console.error('Error en el middleware de autenticación del cliente:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token no válido.' });
    }
    res.status(500).json({ message: 'Error de autenticación del cliente.' });
  }
};

module.exports = authClienteMiddleware;
