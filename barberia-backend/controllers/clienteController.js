const Cliente = require('../models/Cliente');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Reserva, Servicio, Usuario, empleado } = require('../models/associations');
const crearCuentaCliente = async (req, res) => {
    const { nombre, apellido, email_cliente, password_cliente, celular_cliente } = req.body;
  
    try {
      // Validar si el correo ya está en uso
      const clienteExistente = await Cliente.findOne({ where: { email_cliente } });
      if (clienteExistente) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
      }
  
      // Generar un hash de la contraseña
      const hashedPassword = await bcrypt.hash(password_cliente, 10);
  
      // Crear el cliente
      const nuevoCliente = await Cliente.create({
        nombre,
        apellido,
        email_cliente,
        password_cliente: hashedPassword,
        celular_cliente,
      });
  
      // Generar el token JWT
      const token = jwt.sign(
        {
          id: nuevoCliente.id,
          email: nuevoCliente.email_cliente,
          nombre: nuevoCliente.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(201).json({
        message: 'Cuenta creada exitosamente.',
        cliente: {
          id: nuevoCliente.id,
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          email_cliente: nuevoCliente.email_cliente,
          celular_cliente: nuevoCliente.celular_cliente,
        },
        token,
      });
    } catch (error) {
      console.error('Error al crear la cuenta del cliente:', error);
      res.status(500).json({ message: 'Error al crear la cuenta del cliente.', error: error.message });
    }
  };

  const loginCliente = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const cliente = await Cliente.findOne({ where: { email_cliente: correo } });

        if (!cliente) {
            console.log('Cliente no encontrado');
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Comparar la contraseña
        const isPasswordValid = await bcrypt.compare(contraseña, cliente.password_cliente);
        console.log('Contraseña proporcionada:', contraseña);
        console.log('Hash almacenado:', cliente.password_cliente);
        console.log('¿Contraseña válida?:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: cliente.id, correo: cliente.email_cliente }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        }); 
        return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ error: 'Error al iniciar sesión', detalle: error.message });
    }
};

const getCliente = async (req, res) => {
  try {
    const clienteId = req.user.id; // Asegúrate de que el middleware de autenticación setea el cliente en `req.user`
    const cliente = await Cliente.findByPk(clienteId, {
      attributes: ['id', 'nombre', 'apellido', 'email_cliente', 'celular_cliente'], // Seleccionamos solo los campos necesarios
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al obtener los datos del cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar datos del cliente autenticado
const updateCliente = async (req, res) => {
  const { email_cliente, celular_cliente } = req.body;

  try {
    const clienteId = req.user.id; // Asegúrate de que el middleware de autenticación setea el cliente en `req.user`

    // Validar que los campos sean correctos
    if (!email_cliente || !celular_cliente) {
      return res.status(400).json({ message: 'Email y celular son requeridos' });
    }

    const cliente = await Cliente.findByPk(clienteId);

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Actualizar los datos del cliente
    cliente.email_cliente = email_cliente;
    cliente.celular_cliente = celular_cliente;

    await cliente.save();

    return res.status(200).json({ message: 'Datos actualizados correctamente', cliente });
  } catch (error) {
    console.error('Error al actualizar los datos del cliente:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const obtenerHistorialReservas = async (req, res) => {
  try {
    const { id_cliente } = req.params; // Obtén el ID del cliente desde los parámetros de la URL

    if (!id_cliente) {
      return res.status(400).json({ message: 'ID del cliente requerido.' });
    }

    // Consulta las reservas del cliente junto con las relaciones
    const reservas = await Reserva.findAll({
      where: { id_cliente },
      include: [
        {
          model: Servicio,
                    as: 'servicio', // Alias actualizado
                    attributes: ['nombre'],
        },
        {
          model: Usuario,
                    as: 'empleadoUsuario', // Alias actualizado
                    attributes: ['nombre'],
        },
      ],
      attributes: ['fecha', 'hora_inicio', 'hora_fin'], // Atributos de la reserva
      order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']], // Orden por fecha y hora
    });

    if (!reservas.length) {
      return res.status(404).json({ message: 'No se encontraron reservas para este cliente.' });
    }

    // Formatear los datos antes de enviarlos
    const historial = reservas.map((reserva) => ({
      servicio: reserva.servicio?.nombre || 'Sin servicio',
      empleado: reserva.empleadoUsuario?.nombre || 'Sin asignar',
      fecha: reserva.fecha,
      hora: `${reserva.hora_inicio} - ${reserva.hora_fin}`,
    }));

    return res.status(200).json(historial);
  } catch (error) {
    console.error('Error al obtener el historial de reservas:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
  
const verificarCorreo = async (req, res) => {
  const { email } = req.query; // Recibe el correo por query params

  try {
      // Verificar si el correo ya está registrado
      const cliente = await Cliente.findOne({ where: { email_cliente: email } });

      if (cliente) {
          return res.status(200).json({
              registrado: true,
              message: 'El correo ya está registrado. Por favor, inicia sesión.',
          });
      }

      return res.status(200).json({
          registrado: false,
          message: 'El correo está disponible.',
      });
  } catch (error) {
      console.error('Error al verificar el correo:', error);
      res.status(500).json({ error: 'Error interno al verificar el correo.' });
  }
};
  
const crearOActualizarCliente = async (req, res) => {
  const { nombre, email, telefono, is_guest } = req.body;

  try {
      // Verificar si ya existe un cliente con el mismo correo
      let cliente = await Cliente.findOne({ where: { email_cliente: email } });

      if (cliente) {
          return res.status(200).json({
              message: 'El cliente ya existe.',
              clienteId: cliente.id, // Retorna el ID del cliente existente
          });
      }

      // Si no existe, crear un cliente nuevo
      cliente = await Cliente.create({
          nombre,
          email_cliente: email,
          celular_cliente: telefono || null, // Teléfono es opcional
          is_guest: is_guest || true, // Por defecto, es un cliente invitado
          password_cliente: null, // Los clientes invitados no tienen contraseña
          token_recuperacion_cliente: null, // No aplicable para invitados
      });

      return res.status(201).json({
          message: 'Cliente invitado creado exitosamente.',
          clienteId: cliente.id, // Retorna el ID del cliente recién creado
      });
  } catch (error) {
      console.error('Error al crear o actualizar cliente:', error);
      res.status(500).json({ error: 'Error interno al manejar el cliente.' });
  }
};
  

  module.exports = {
    crearCuentaCliente,
    loginCliente,
    verificarCorreo,
    crearOActualizarCliente,
    getCliente,
    updateCliente,
    obtenerHistorialReservas,

  };