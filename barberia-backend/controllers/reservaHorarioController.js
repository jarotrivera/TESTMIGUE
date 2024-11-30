// controllers/reservaHorarioController.js
const Negocio = require('../models/Negocio'); // Importa el modelo del negocio
const HorarioNegocio = require('../models/HorarioNegocio');
const DisponibilidadEmpleado = require('../models/DisponibilidadEmpleado');
const Reserva = require('../models/Reserva');
const Servicio = require('../models/Servicio');
const EmpleadoNegocio = require('../models/EmpleadoNegocio');
const EmpleadoServicio = require('../models/EmpleadoServicio');
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const moment = require('moment');
require('moment/locale/es'); // Cargar configuración en español para moment
moment.locale('es'); // Configurar moment para usar el español
const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { sendEmailWithTemplateData }  = require('../utils/sendEmail');


// Funcion para obtener la disponibilidad de TODOS los empleados.
exports.obtenerDisponibilidadGeneral = async (req, res) => {
    const { negocioId, servicioId } = req.params;

    try {
        const diasDisponibles = [];

        // Obtener información del negocio
        const negocio = await Negocio.findByPk(negocioId, { attributes: ['id', 'nombre'] });
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        // Obtener información del servicio
        const servicio = await Servicio.findByPk(servicioId, { attributes: ['id', 'nombre', 'duracion'] });
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        const duracionServicio = servicio.duracion;

        // Obtener el horario general del negocio
        const horariosNegocio = await HorarioNegocio.findAll({
            where: { id_negocio: negocioId, activo: true },
        });

        // Iterar sobre las próximas 4 semanas (28 días)
        for (let i = 0; i < 28; i++) {
            const fecha = moment().add(i, 'days');
            const diaSemana = fecha.format('dddd').toLowerCase();

            // Verificar si el negocio está abierto en este día de la semana
            const horarioNegocio = horariosNegocio.find(horario => horario.dia_semana.toLowerCase() === diaSemana);
            if (!horarioNegocio) {
                diasDisponibles.push({ fecha: fecha.format('YYYY-MM-DD'), disponible: false });
                continue;
            }

            // Obtener empleados disponibles para este día con sus nombres
            const empleadosDisponibles = await DisponibilidadEmpleado.findAll({
                where: {
                    id_negocio: negocioId,
                    dia_semana: diaSemana,
                    disponible: true
                },
                include: [
                    {
                        model: Usuario, // Relación con el modelo Usuario
                        attributes: ['id', 'nombre'] // Traemos solo el ID y el nombre del empleado
                    }
                ]
            });

            const bloquesPorEmpleado = [];

            for (const empleado of empleadosDisponibles) {
                const bloquesEmpleado = [];

                let horaInicio = moment(`${fecha.format('YYYY-MM-DD')} ${empleado.hora_inicio}`);
                const horaFin = moment(`${fecha.format('YYYY-MM-DD')} ${empleado.hora_fin}`);

                while (horaInicio.clone().add(duracionServicio, 'minutes').isSameOrBefore(horaFin)) {
                    const horaFinBloque = horaInicio.clone().add(duracionServicio, 'minutes');

                    // Verificar si ya existe una reserva en este bloque
                    const reservaExistente = await Reserva.findOne({
                        where: {
                            id_negocio: negocioId,
                            id_empleado: empleado.id_usuario,
                            fecha: fecha.format('YYYY-MM-DD'),
                            hora_inicio: horaInicio.format('HH:mm:ss'),
                            hora_fin: horaFinBloque.format('HH:mm:ss')
                        }
                    });

                    if (!reservaExistente) {
                        bloquesEmpleado.push({
                            hora_inicio: horaInicio.format('HH:mm'),
                            hora_fin: horaFinBloque.format('HH:mm'),
                        });
                    }

                    horaInicio = horaFinBloque;
                }

                // Solo incluimos empleados que tienen bloques disponibles
                if (bloquesEmpleado.length > 0) {
                    bloquesPorEmpleado.push({
                        empleado: {
                            id: empleado.id_usuario,
                            nombre: empleado.Usuario.nombre // Incluimos el nombre del empleado
                        },
                        bloques: bloquesEmpleado,
                    });
                }
            }

            // Si no hay bloques disponibles para ningún empleado, marcamos el día como no disponible
            diasDisponibles.push({
                fecha: fecha.format('YYYY-MM-DD'),
                disponible: bloquesPorEmpleado.length > 0,
                bloquesPorEmpleado,
            });
        }

        // Respuesta final
        res.json({
            negocio,
            servicio,
            diasDisponibles,
        });
    } catch (error) {
        console.error("Error al obtener disponibilidad general:", error);
        res.status(500).json({ error: error.message });
    }
};

// Funcion para obtener la disponibilidad de un empleado en especifico.
exports.obtenerDisponibilidadEmpleado = async (req, res) => {
    const { negocioId, empleadoId, servicioId } = req.params;

    try {
        // Obtener datos del negocio
        const negocio = await Negocio.findByPk(negocioId, {
            attributes: ['id', 'nombre']
        });
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        // Obtener datos del servicio
        const servicio = await Servicio.findByPk(servicioId, {
            attributes: ['id', 'nombre', 'duracion']
        });
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        const duracionServicio = servicio.duracion; // Duración en minutos
        const diasDisponibles = [];

        // Iterar sobre las próximas 4 semanas (28 días)
        for (let i = 0; i < 28; i++) {
            const fecha = moment().add(i, 'days');
            let diaSemana = fecha.format('dddd').toLowerCase(); // Obtiene el día en español y en minúsculas

            // Normalizar el día de la semana (quita acentos)
            diaSemana = normalizeString(diaSemana); 
            console.log(`Día calculado por moment.js (normalizado): ${diaSemana}`); // Depuración

            // Obtener disponibilidad del empleado para el día específico
            const disponibilidadEmpleado = await DisponibilidadEmpleado.findAll({
                where: {
                    id_usuario: empleadoId,
                    id_negocio: negocioId,
                    disponible: true
                }
            });

            // Filtra la disponibilidad para encontrar el día que coincide
            const disponibilidadParaElDia = disponibilidadEmpleado.filter(d => 
                normalizeString(d.dia_semana.toLowerCase()) === diaSemana
            );

            //console.log(`Disponibilidad en BD para ${diaSemana}:`, disponibilidadParaElDia.map(d => d.dia_semana)); // Depuración

            // Si no hay disponibilidad para este día, marcarlo como no disponible
            if (disponibilidadParaElDia.length === 0) {
                diasDisponibles.push({ fecha: fecha.format('YYYY-MM-DD'), disponible: false });
                //console.log(`No hay disponibilidad para el día: ${diaSemana} en la fecha ${fecha.format('YYYY-MM-DD')}`); // Depuración
                continue;
            }

            // Construir bloques de horario para el día disponible
            const bloquesEmpleado = [];
            for (const disponibilidad of disponibilidadParaElDia) {
                let horaInicio = moment(`${fecha.format('YYYY-MM-DD')} ${disponibilidad.hora_inicio}`);
                const horaFin = moment(`${fecha.format('YYYY-MM-DD')} ${disponibilidad.hora_fin}`);

                // Crear bloques con duración específica del servicio
                while (horaInicio.clone().add(duracionServicio, 'minutes').isSameOrBefore(horaFin)) {
                    const horaFinBloque = horaInicio.clone().add(duracionServicio, 'minutes');

                    const reservaExistente = await Reserva.findOne({
                        where: {
                            id_negocio: negocioId,
                            id_empleado: empleadoId,
                            fecha: fecha.format('YYYY-MM-DD'),
                            hora_inicio: horaInicio.format('HH:mm:ss'),
                            hora_fin: horaFinBloque.format('HH:mm:ss')
                        }
                    });

                    if (!reservaExistente) {
                        bloquesEmpleado.push({
                            hora_inicio: horaInicio.format('HH:mm'),
                            hora_fin: horaFinBloque.format('HH:mm'),
                        });
                    }
                    horaInicio = horaFinBloque;
                }
            }

            diasDisponibles.push({
                fecha: fecha.format('YYYY-MM-DD'),
                disponible: bloquesEmpleado.length > 0,
                bloques: bloquesEmpleado,
            });
        }

        // Respuesta con el formato esperado
        res.json({
            negocio: {
                id: negocio.id,
                nombre: negocio.nombre
            },
            servicio: {
                id: servicio.id,
                nombre: servicio.nombre,
                duracion: servicio.duracion
            },
            diasDisponibles
        });
    } catch (error) {
        console.error("Error al obtener disponibilidad del empleado:", error);
        res.status(500).json({ error: error.message });
    }
};

// Función para obtener el calendario de disponibilidad de un negocio específico para las próximas 4 semanas (patrón semanal)
exports.obtenerCalendarioDisponibilidad = async (req, res) => {
    const { negocioId } = req.params;
    const diasDisponibles = [];

    try {
        // Obtener la disponibilidad semanal del negocio (lunes a domingo)
        const horariosNegocio = await HorarioNegocio.findAll({
            where: {
                id_negocio: negocioId,
                activo: true
            }
        });

        console.log("Horarios del negocio:", horariosNegocio);

        // Obtener la disponibilidad semanal de los empleados del negocio (lunes a domingo)
        const disponibilidadEmpleados = await DisponibilidadEmpleado.findAll({
            where: {
                id_negocio: negocioId,
                disponible: true
            }
        });

        console.log("Disponibilidad de empleados:", disponibilidadEmpleados);

        // Iterar sobre los próximos 28 días y aplicar el patrón semanal
        for (let i = 0; i < 28; i++) {
            const fecha = moment().add(i, 'days');
            const diaSemana = fecha.format('dddd'); // Obtener el nombre del día en español

            console.log(`Revisando la fecha: ${fecha.format('YYYY-MM-DD')} (${diaSemana})`);

            // Paso 1: Verificar si el negocio está disponible en el día de la semana actual
            const horarioDia = horariosNegocio.find(horario => horario.dia_semana.toLowerCase() === diaSemana.toLowerCase());

            if (!horarioDia) {
                // Si el negocio está cerrado ese día en su patrón semanal, marcar como no disponible
                diasDisponibles.push({ fecha: fecha.format('YYYY-MM-DD'), disponible: false });
                console.log(`Negocio cerrado el día ${diaSemana}`);
                continue;
            }

            // Paso 2: Verificar si hay empleados disponibles para el día de la semana actual
            const empleadosDia = disponibilidadEmpleados.filter(empleado => empleado.dia_semana.toLowerCase() === diaSemana.toLowerCase());

            console.log(`Empleados disponibles el día ${diaSemana}:`, empleadosDia);

            // Verificar si algún empleado tiene disponibilidad que coincida con el horario del negocio
            const hayEmpleadoDisponible = empleadosDia.some(empleado => {
                const horaInicioEmpleado = moment(`${fecha.format('YYYY-MM-DD')} ${empleado.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
                const horaFinEmpleado = moment(`${fecha.format('YYYY-MM-DD')} ${empleado.hora_fin}`, 'YYYY-MM-DD HH:mm:ss');
                const horaInicioNegocio = moment(`${fecha.format('YYYY-MM-DD')} ${horarioDia.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
                const horaFinNegocio = moment(`${fecha.format('YYYY-MM-DD')} ${horarioDia.hora_fin}`, 'YYYY-MM-DD HH:mm:ss');
                
                // Comprobar si el horario del empleado se solapa con el horario del negocio
                const solapamiento = horaInicioEmpleado.isBefore(horaFinNegocio) && horaFinEmpleado.isAfter(horaInicioNegocio);
                console.log(`Comparando horarios para empleado ${empleado.id_usuario}: Negocio [${horaInicioNegocio.format('HH:mm')} - ${horaFinNegocio.format('HH:mm')}] vs Empleado [${horaInicioEmpleado.format('HH:mm')} - ${horaFinEmpleado.format('HH:mm')}] => Solapamiento: ${solapamiento}`);
                
                return solapamiento;
            });

            // Agregar el resultado final al calendario de disponibilidad
            diasDisponibles.push({ fecha: fecha.format('YYYY-MM-DD'), disponible: hayEmpleadoDisponible });
            console.log(`Resultado para ${fecha.format('YYYY-MM-DD')}: ${hayEmpleadoDisponible ? "Disponible" : "No disponible"}`);
        }

        // Devolver el calendario de disponibilidad al cliente
        res.json(diasDisponibles);
    } catch (error) {
        // Manejo de errores en caso de fallo en la consulta
        res.status(500).json({ error: error.message });
    }
};

// Función para obtener los bloques de horarios disponibles para una fecha específica
exports.obtenerBloquesDisponibles = async (req, res) => {
    const { negocioId, servicioId, fecha } = req.params;
    
    try {
        const diaSemana = moment(fecha).format('dddd'); // Obtener el día de la semana

        // Paso 1: Obtener la duración del servicio
        const servicio = await Servicio.findByPk(servicioId);
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        const duracionServicio = servicio.duracion; // Duración en minutos

        // Paso 2: Obtener el horario del negocio para el día específico
        const horarioNegocio = await HorarioNegocio.findOne({
            where: { id_negocio: negocioId, dia_semana: diaSemana, activo: true }
        });
        if (!horarioNegocio) {
            return res.status(404).json({ message: 'El negocio está cerrado en esta fecha' });
        }

        const negocioInicio = moment(`${fecha} ${horarioNegocio.hora_inicio}`, 'YYYY-MM-DD HH:mm');
        const negocioFin = moment(`${fecha} ${horarioNegocio.hora_fin}`, 'YYYY-MM-DD HH:mm');

        // Paso adicional: Obtener solo empleados que ofrecen el servicio específico
        const empleadosQueOfrecenServicio = await EmpleadoServicio.findAll({
            where: { id_servicio: servicioId },
            attributes: ['id_empleado']
        });
        const idsEmpleados = empleadosQueOfrecenServicio.map(e => e.id_empleado);

        // Paso 3: Obtener disponibilidad de empleados en ese día
        const empleadosDisponibles = await DisponibilidadEmpleado.findAll({
            where: {
                id_negocio: negocioId,
                dia_semana: diaSemana,
                disponible: true,
                id_usuario: idsEmpleados
            }
        });
        if (empleadosDisponibles.length === 0) {
            return res.status(404).json({ message: 'No hay empleados disponibles en esta fecha' });
        }

        // Paso 4: Generar bloques de tiempo y verificar reservas existentes
        const bloquesDisponibles = [];

        for (let empleado of empleadosDisponibles) {
            const empInicio = moment(`${fecha} ${empleado.hora_inicio}`, 'YYYY-MM-DD HH:mm');
            const empFin = moment(`${fecha} ${empleado.hora_fin}`, 'YYYY-MM-DD HH:mm');

            let bloqueInicio = moment.max(empInicio, negocioInicio); // Máximo entre horario negocio y empleado
            const finHorario = moment.min(empFin, negocioFin); // Mínimo entre horario negocio y empleado

            while (bloqueInicio.clone().add(duracionServicio, 'minutes').isSameOrBefore(finHorario)) {
                const bloqueFin = bloqueInicio.clone().add(duracionServicio, 'minutes');

                // Verificar si el bloque ya está reservado
                const reservaExistente = await Reserva.findOne({
                    where: {
                        id_negocio: negocioId,
                        id_empleado: empleado.id_usuario,
                        fecha: {
                            [Op.between]: [bloqueInicio.toDate(), bloqueFin.toDate()]
                        }
                    }
                });

                if (!reservaExistente) {
                    // Bloque disponible si no hay reserva
                    bloquesDisponibles.push({
                        empleado: empleado.id_usuario,
                        hora_inicio: bloqueInicio.format('HH:mm'),
                        hora_fin: bloqueFin.format('HH:mm')
                    });
                }
                // Avanzar al siguiente bloque
                bloqueInicio = bloqueFin;
            }
        }

        res.json(bloquesDisponibles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para obtener los empleados disponibles para un negocio y servicio específico
exports.obtenerEmpleadosDisponibles = async (req, res) => {
    const { negocioId, servicioId } = req.params;

    try {
        // Obtener los IDs de empleados que realizan el servicio especificado
        const empleadosServicio = await EmpleadoServicio.findAll({
            where: { id_servicio: servicioId },
            attributes: ['id_empleado']
        });

        const idsEmpleadosServicio = empleadosServicio.map(empleado => empleado.id_empleado);

        // Obtener los empleados que pertenecen al negocio especificado y que realizan el servicio
        const empleados = await EmpleadoNegocio.findAll({
            where: {
                id_negocio: negocioId,
                id_usuario: idsEmpleadosServicio
            },
            include: [
                {
                    model: Usuario, // Incluimos el modelo Usuario
                    attributes: ['id', 'nombre'] // Traemos solo el ID y nombre
                },
                {
                    model: DisponibilidadEmpleado,
                    as: 'disponibilidades', // Usar el alias definido en las asociaciones
                    attributes: ['disponible'], // Solo traemos el campo necesario
                }
            ]
        });

        // Filtrar empleados con al menos un día disponible
        const resultado = empleados
            .filter(empleado => empleado.disponibilidades.some(d => d.disponible)) // Verifica disponibilidad
            .map(empleado => ({
                id: empleado.Usuario.id, // ID del empleado desde el modelo Usuario
                nombre: empleado.Usuario.nombre // Nombre del empleado desde el modelo Usuario
            }));

        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener empleados disponibles:', error);
        res.status(500).json({ message: 'Error al obtener empleados disponibles' });
    }
};

exports.crearReserva = async (req, res) => {
    const {
        clienteId,
        negocioId,
        servicioId,
        empleadoId, // Recibido desde el frontend
        fecha,
        hora_inicio,
        hora_fin,
        comentario_cliente,
    } = req.body;

    try {
        // Validar datos obligatorios
        if (!clienteId || !negocioId || !servicioId || !empleadoId || !fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ 
                message: 'Faltan datos obligatorios para crear la reserva.',
                dataRecibida: req.body, // Para depuración
            });
        }

        // Buscar el id_usuario correspondiente al id_empleado
        const empleadoNegocio = await EmpleadoNegocio.findOne({
            where: { id: empleadoId, id_negocio: negocioId },
        });

        if (!empleadoNegocio) {
            return res.status(404).json({
                message: 'No se encontró el empleado asociado al negocio proporcionado.',
            });
        }

        const id_usuario = empleadoNegocio.id_usuario; // Extraer el id_usuario
        const nombre_profesional = empleadoNegocio.Usuario?.nombre_usuario || 'Profesional no especificado';
        
        // Buscar información del negocio
        const negocio = await Negocio.findByPk(negocioId, {
            attributes: ['nombre'],
        });

        if (!negocio) {
            return res.status(404).json({
                message: 'No se encontró el negocio proporcionado.',
            });
        }

        // Buscar información del servicio
        const servicio = await Servicio.findByPk(servicioId, {
            attributes: ['nombre'],
        });

        if (!servicio) {
            return res.status(404).json({
                message: 'No se encontró el servicio proporcionado.',
            });
        }

        // Crear la reserva
        const nuevaReserva = await Reserva.create({
            id_cliente: clienteId,
            id_negocio: negocioId,
            id_servicio: servicioId,
            id_usuario, // Usamos el id_usuario obtenido
            id_empleado: empleadoId, // Guardamos también el id_empleado para trazabilidad
            fecha,
            hora_inicio,
            hora_fin,
            comentario_cliente,
            estado: 'reservado',
            fecha_creacion: new Date(),
        });

        // envio de  correo 
        // Buscar información del cliente
        const cliente = await Cliente.findByPk(clienteId);

        // Enviar correo al cliente
        if (!cliente || !cliente.email_cliente) {
            console.error('El cliente no tiene un correo válido:', cliente);
        } else {
            // Enviar correo al cliente
            try {
                console.log('Enviando correo con los datos:', {
                    to: cliente.email_cliente,
                    nombre_usuario: cliente.nombre,
                    numero_reserva: nuevaReserva.id,
                    negocio: negocio.nombre, 
                    servicio: servicio.nombre, 
                    profesional: nombre_profesional, 
                    fecha,
                    hora_inicio,
                    hora_fin,
                });

                await sendEmailWithTemplateData(cliente.email_cliente, 'd-d6cf6663ca1441468c43fc510b22cb33', {
                    nombre_usuario: cliente.nombre,
                    numero_reserva: nuevaReserva.id,
                    negocio: negocio.nombre, // Nombre del negocio
                    servicio: servicio.nombre, // Nombre del servicio
                    profesional: nombre_profesional, // Nombre del profesional
                    fecha, // Fecha de la reserva
                    hora_inicio, // Hora de inicio
                    hora_fin, // Hora de fin
                });
            } catch (error) {
                console.error('Error al enviar el correo:', error.message);
                // El correo fallido no debería detener el proceso principal.
            }
        }

        res.status(201).json({ message: 'Reserva creada exitosamente.', reserva: nuevaReserva });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        res.status(500).json({ message: 'Error interno al crear la reserva.', error: error.message });
    }
};