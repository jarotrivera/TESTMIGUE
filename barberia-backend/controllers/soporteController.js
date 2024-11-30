const Soporte = require('../models/Soporte');


// Controlador para crear un ticket de soporte
const crearTicket = async (req, res) => {
  try {
    const { asunto, descripcion, prioridad } = req.body; // Los datos enviados por el formulario
    const { id: id_usuario } = req.user;
    const id_negocio = req.user.negocio?.id || null;

    if (!id_negocio) {
      return res.status(400).json({ message: 'El usuario no pertenece a ningún negocio.' });
    }

    if (!descripcion || descripcion.length < 10 || descripcion.length > 500) {
      return res.status(400).json({ message: 'La descripción debe tener entre 10 y 500 caracteres.' });
    }

    const descripcionRegex = /^[a-zA-Z0-9\s.,!?'"\-]+$/;
    if (!descripcionRegex.test(descripcion)) {
      return res.status(400).json({ message: 'La descripción contiene caracteres no permitidos.' });
    }

    let imagenUrl = null;
    if (req.files && req.files.imagen) {
      const imagen = req.files.imagen[0];
      imagenUrl = `${req.protocol}://${req.get('host')}/uploads/${imagen.filename}`;
    }

    const nuevoTicket = await Soporte.create({
      id_usuario,
      id_negocio,
      cargo: req.user.cargo,
      asunto,
      descripcion,
      prioridad: prioridad || 'media',
      imagen: imagenUrl,
    });

    res.status(201).json({
      message: 'Ticket de soporte creado exitosamente.',
      ticket: nuevoTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el ticket de soporte.',
      error: error.message,
    });
  }
};


const obtenerTicketsUsuario = async (req, res) => {
  try {
    const { id: id_usuario } = req.user;

    // Obtener todos los tickets asociados al usuario
    const tickets = await Soporte.findAll({
      where: { id_usuario },
      order: [['creado_en', 'DESC']],
    });

    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los tickets de soporte.',
      error: error.message,
    });
  }
};

const obtenerTodosLosTickets = async (req, res) => {
  try {
    const tickets = await Soporte.findAll({
      order: [['creado_en', 'DESC']],
    });

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error al obtener los tickets de soporte:', error);
    res.status(500).json({
      message: 'Error al obtener los tickets de soporte.',
      error: error.message,
    });
  }
};

// Controlador para actualizar el estado de un ticket de soporte
const actualizarEstadoTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    if (!['pendiente', 'en_progreso', 'resuelto'].includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido.' });
    }

    const ticket = await Soporte.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado.' });
    }

    ticket.estado = estado;
    ticket.respuesta = respuesta;
    await ticket.save();

    res.status(200).json({ message: 'Estado y respuesta del ticket actualizados correctamente.', ticket });
  } catch (error) {
    console.error('Error al actualizar el estado y la respuesta del ticket:', error);
    res.status(500).json({
      message: 'Error al actualizar el estado y la respuesta del ticket.',
      error: error.message,
    });
  }
};


module.exports = {
  crearTicket,
  obtenerTicketsUsuario,
  obtenerTodosLosTickets,
  actualizarEstadoTicket,
};