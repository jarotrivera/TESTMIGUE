const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
// Crear un nuevo evento
exports.createEvento = async (req, res) => {
  try {
    // Obtener datos del usuario autenticado
    const { id_negocio, id: id_usuario } = req.user;
    
    // Verificar que el usuario tenga un negocio asociado
    if (!id_negocio) {
      return res.status(403).json({ error: 'Usuario no tiene un negocio asociado' });
    }

    // Extraer los datos del evento desde el cuerpo de la solicitud
    const { titulo, descripcion, categoria, inicio, fin } = req.body;

    // Validación básica de los campos requeridos
    if (!titulo || !inicio || !fin) {
      return res.status(400).json({ error: 'Titulo, inicio y fin son requeridos' });
    }

    // Crear el evento asociado con el negocio y el usuario
    const evento = await Evento.create({
      titulo,
      descripcion,
      categoria,
      inicio,
      fin,
      id_negocio,    
      id_usuario,    
    });

    // Responder con el evento creado
    res.status(201).json(evento);
  } catch (error) {
    console.error('Error al crear el evento:', error);
    res.status(500).json({ error: 'Error al crear el evento' });
  }
};

// Obtener todos los eventos de un negocio específico
exports.getEventosPorNegocio = async (req, res) => {
  try {
    const { id_negocio } = req.params;

    // Obtener todos los eventos del negocio con la información del creador
    const eventos = await Evento.findAll({
      where: { id_negocio },
      include: [
        {
          model: Usuario,
          as: 'creador', // El alias que se configuró en la asociación
          attributes: ['nombre'], // Solo trae el nombre del usuario
        },
      ],
      attributes: ['id', 'titulo', 'inicio', 'fin', 'descripcion', 'categoria'],
    });

    // Formatear la respuesta para incluir el nombre del usuario
    const eventosFormateados = eventos.map(evento => ({
      id: evento.id,
      titulo: evento.titulo,
      inicio: evento.inicio,
      fin: evento.fin,
      descripcion: evento.descripcion,
      categoria: evento.categoria,
      nombre_usuario: evento.creador ? evento.creador.nombre : null, // Agregar el nombre del creador
    }));

    res.json(eventosFormateados);
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
    res.status(500).json({ error: 'Error al obtener los eventos' });
  }
};


// Actualizar un evento
exports.updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, inicio, fin, descripcion, categoria } = req.body;

    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await evento.update({
      titulo,
      inicio,
      fin,
      descripcion,
      categoria,
    });

    res.status(200).json(evento);
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    res.status(500).json({ error: 'Error al actualizar el evento' });
  }
};

// Eliminar un evento
exports.deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // El ID del usuario autenticado
    const userCargo = req.user.cargo; // Cargo del usuario autenticado

    // Buscar el evento
    const evento = await Evento.findByPk(id);

    // Si el evento no existe, devolver un error
    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Verificar si el usuario es el creador del evento o el dueño
    if (evento.id_usuario_creador !== userId && userCargo !== "Dueño") {
      return res.status(403).json({ error: "No tienes permiso para eliminar este evento" });
    }

    // Eliminar el evento
    await evento.destroy();
    res.status(200).json({ message: "Evento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    res.status(500).json({ error: "Error al eliminar el evento" });
  }
};