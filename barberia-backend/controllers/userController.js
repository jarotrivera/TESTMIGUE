// controllers/userController.js
const Usuario = require('../models/Usuario');
const Negocio = require('../models/Negocio');
const DuenoNegocio = require('../models/DuenoNegocio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmpleadoNegocio = require('../models/EmpleadoNegocio');
const DisponibilidadEmpleado = require('../models/DisponibilidadEmpleado');
const path = require('path');
const db = require('../config/database');
const dayjs = require('dayjs');


// Función para registrar un usuario y crear su negocio
const register = async (req, res) => {
  const {
    nombre,
    correo,
    contraseña,
    telefono,
    nombreNegocio,
    correoNegocio, // Nuevo campo
    telefonoNegocio,
    direccionNegocio,
    cargo,
  } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const emailExists = await Usuario.findOne({ where: { correo } });
    if (emailExists) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    const negocioExists = await Negocio.findOne({ where: { nombre: nombreNegocio } });
    if (negocioExists) {
      return res.status(400).json({ message: 'El nombre del negocio ya está en uso.' });
    }

    // Crear el hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena_hash: hashedPassword,
      telefono,
      cargo,
    });

    console.log('Usuario creado:', nuevoUsuario);

    // Crear el negocio relacionado con el usuario
    const nuevoNegocio = await Negocio.create({
      nombre: nombreNegocio,
      correo: correoNegocio, // Guardar correo del negocio
      telefono: telefonoNegocio,
      direccion: direccionNegocio,
      id_dueno: nuevoUsuario.id,
    });

    // Crear la relación entre el usuario y el negocio (dueño de negocio)
    await DuenoNegocio.create({
      id_usuario: nuevoUsuario.id,
      id_negocio: nuevoNegocio.id,
    });

    

    // Generar un token JWT para el usuario recién registrado
    const token = jwt.sign({ id: nuevoUsuario.id, correo: nuevoUsuario.correo }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(201).json({ message: 'Usuario y negocio creados con éxito', token });
  } catch (error) {
    console.error('Error al registrar el usuario y crear el negocio:', error);
    return res.status(500).json({ error: 'Error en el registro', detalle: error.message });
  }
};

// Función para el inicio de sesión
const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, usuario.contrasena_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    console.log("Cargo obtenido del usuario para el token:", usuario.cargo);
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, cargo: usuario.cargo }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión', detalle: error.message });
  }
};

// Función para obtener un usuario por su ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return res.status(500).json({ error: 'Error al obtener el usuario', detalle: error.message });
  }
};

// Función para obtener el usuario logeado
const getLoggedUser = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: { id: req.user.id },
      include: {
        model: Negocio,
        as: 'negocio',
        attributes: ['id', 'nombre', 'telefono','correo','descripcion','categoria'],
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      cargo: usuario.cargo,
      foto_perfil: usuario.foto_perfil,
      negocio: usuario.negocio || {},
      
    });
  } catch (error) {
    console.error('Error al obtener el usuario logeado:', error);
    res.status(500).json({ error: 'Error al obtener el usuario logeado' });
  }
};
const updateUser = async (req, res) => {
  const { nombre, correo, telefono, contraseñaActual, nuevaContraseña } = req.body;

  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se intenta cambiar la contraseña, verificar la contraseña actual
    if (nuevaContraseña) {
      if (!contraseñaActual) {
        return res.status(400).json({ message: 'Debe ingresar la contraseña actual para cambiarla.' });
      }

      // Verificar la contraseña actual
      const isPasswordValid = await bcrypt.compare(contraseñaActual, usuario.contrasena_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }

      // Crear el hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
      usuario.contrasena_hash = hashedPassword;
    }

    // Actualizar otros campos si están presentes
    if (nombre) usuario.nombre = nombre;
    if (correo) usuario.correo = correo;
    if (telefono) usuario.telefono = telefono;

    await usuario.save();
    return res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return res.status(500).json({ error: 'Error al actualizar el usuario', detalle: error.message });
  }
};
const uploadProfileImage = async (req, res) => {
  try {
    console.log("ID de usuario en req.user:", req.user);

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const userId = req.user.id;

    // Busca al usuario por su ID
    const user = await Usuario.findByPk(userId);

    // Verifica si el usuario existe
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualiza el campo foto_perfil y guarda los cambios
    user.foto_perfil = profileImageUrl;
    await user.save();

    res.json({
      message: 'Foto de perfil actualizada correctamente',
      profileImage: user.foto_perfil,
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
};

const registrarComoEmpleado = async (req, res) => {
  try {
    const { id_usuario, id_negocio } = req.body;

    // Verificar que el usuario y negocio existen
    const usuario = await Usuario.findByPk(id_usuario);
    const negocio = await Negocio.findByPk(id_negocio);

    if (!usuario || !negocio) {
      return res.status(404).json({ message: 'Usuario o negocio no encontrado.' });
    }

    // Verificar si ya está registrado como empleado
    const yaRegistrado = await EmpleadoNegocio.findOne({
      where: {
        id_usuario,
        id_negocio,
      },
    });

    if (yaRegistrado) {
      return res.status(400).json({ message: 'El usuario ya está registrado como empleado en este negocio.' });
    }

    // Registrar como empleado
    await EmpleadoNegocio.create({
      id_usuario,
      id_negocio,
      id_empleado: id_usuario,
    });

    return res.status(201).json({ message: 'Registrado como empleado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar como empleado:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Guardar disponibilidad del empleado
const guardarDisponibilidad = async (req, res) => {
  try {
    const { id_usuario, disponibilidad } = req.body;

    if (!id_usuario || !Array.isArray(disponibilidad)) {
      return res.status(400).json({ message: 'Datos inválidos. Verifica el usuario y la disponibilidad.' });
    }

    // Verificar que el usuario exista
    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Buscar negocio asociado al usuario
    const negocio = await Negocio.findOne({ where: { id_dueno: id_usuario } });
    if (!negocio) {
      return res.status(404).json({ message: 'No se encontró un negocio asociado al usuario.' });
    }

    // Validar días válidos
    const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    for (const dia of disponibilidad) {
      if (!diasValidos.includes(dia.dia_semana)) {
        return res.status(400).json({ message: `Día inválido: ${dia.dia_semana}` });
      }

      if (!dia.hora_inicio || !dia.hora_fin || dia.disponible === undefined) {
        return res.status(400).json({ message: 'Algunos días o valores no están definidos o no son válidos.' });
      }
    }

    // Eliminar registros existentes para el usuario
    await DisponibilidadEmpleado.destroy({ where: { id_usuario } });

    // Crear nuevas entradas
    const nuevasDisponibilidades = await Promise.all(
      disponibilidad.map((dia) =>
        DisponibilidadEmpleado.create({
          id_usuario,
          id_negocio: negocio.id, // Relación con el negocio
          dia_semana: dia.dia_semana,
          hora_inicio: dia.hora_inicio,
          hora_fin: dia.hora_fin,
          disponible: dia.disponible,
        })
      )
    );

    return res.status(201).json({
      message: 'Disponibilidad guardada exitosamente.',
      nuevasDisponibilidades,
    });
  } catch (error) {
    console.error('Error al guardar disponibilidad:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};



// Obtener disponibilidad del empleado
const obtenerDisponibilidad = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Buscar disponibilidad en la base de datos
    const disponibilidad = await DisponibilidadEmpleado.findAll({
      where: { id_usuario },
      attributes: ['dia_semana', 'hora_inicio', 'hora_fin', 'disponible'], // Asegúrate de devolver solo los campos relevantes
    });

    if (disponibilidad.length === 0) {
      // Si no hay disponibilidad, devolver un horario predeterminado
      const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
      const disponibilidadDefault = diasSemana.map((dia) => ({
        dia_semana: dia,
        hora_inicio: '08:00:00', // Asegúrate de usar formato válido para la base de datos
        hora_fin: '18:00:00',
        disponible: true,
      }));

      return res.status(200).json(disponibilidadDefault);
    }

    // Validar y normalizar la disponibilidad existente
    const disponibilidadNormalizada = disponibilidad.map((entry) => ({
      dia_semana: entry.dia_semana,
      hora_inicio: entry.hora_inicio ? entry.hora_inicio : '08:00:00', // Valor predeterminado si es nulo
      hora_fin: entry.hora_fin ? entry.hora_fin : '18:00:00', // Valor predeterminado si es nulo
      disponible: entry.disponible !== undefined ? entry.disponible : true, // Valor predeterminado si es nulo
    }));

    // Devolver disponibilidad existente
    return res.status(200).json(disponibilidadNormalizada);
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


const eliminarDeEmpleadoNegocio = async (req, res) => {
  try {
    const { id_usuario, id_negocio } = req.body;

    // Validar los datos de entrada
    if (!id_usuario || !id_negocio) {
      return res.status(400).json({ message: 'ID de usuario y negocio son requeridos.' });
    }

    // Verificar si el usuario existe en empleado_negocio
    const empleado = await EmpleadoNegocio.findOne({
      where: {
        id_usuario,
        id_negocio,
      },
    });

    let empleadoEliminado = false;
    if (empleado) {
      await empleado.destroy(); // Eliminar registro de empleado_negocio
      empleadoEliminado = true;
      console.log('Usuario eliminado de empleado_negocio exitosamente.');
    } else {
      console.warn('El usuario no está registrado como empleado en este negocio.');
    }

    // Verificar y eliminar datos de disponibilidad_empleado
    const disponibilidadEliminada = await DisponibilidadEmpleado.destroy({
      where: { id_usuario },
    });

    if (disponibilidadEliminada > 0) {
      console.log('Disponibilidad eliminada exitosamente.');
    } else {
      console.warn('No se encontró disponibilidad para el usuario.');
    }

    // Responder al cliente con un resumen de la operación
    return res.status(200).json({
      message: 'Eliminación completada.',
      empleadoEliminado,
      disponibilidadEliminada: disponibilidadEliminada > 0,
    });
  } catch (error) {
    console.error('Error al eliminar al usuario de empleado_negocio o disponibilidad_empleado:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const checkEmpleadoStatus = async (req, res) => {
  const { id_usuario } = req.params;

  if (!id_usuario) {
    return res.status(400).json({ message: 'ID de usuario requerido.' });
  }

  try {
    const empleado = await EmpleadoNegocio.findOne({
      where: { id_usuario },
    });

    if (empleado) {
      return res.status(200).json({ realizaServicios: true });
    } else {
      return res.status(200).json({ realizaServicios: false });
    }
  } catch (error) {
    console.error('Error al verificar el estado del empleado:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};




module.exports = {
  register,
  login,
  getUserById,
  getLoggedUser,
  updateUser,
  uploadProfileImage,
  registrarComoEmpleado,
  guardarDisponibilidad,
  obtenerDisponibilidad,
  eliminarDeEmpleadoNegocio,
  checkEmpleadoStatus,
};
