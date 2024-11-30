const Reserva = require('../models/Reserva');
const Servicio = require('../models/Servicio');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');

exports.obtenerReservasPorNegocio = async (req, res) => {
    const { id_negocio } = req.params; // Se recibe el ID del negocio desde la ruta

    try {
        // Validar parámetro obligatorio
        if (!id_negocio) {
            return res.status(400).json({ message: 'El id_negocio es obligatorio.' });
        }

        // Buscar todas las reservas asociadas al negocio
        const reservas = await Reserva.findAll({
            where: {
                id_negocio,
            },
            include: [
                {
                    model: Servicio,
                    as: 'servicio', // Alias actualizado
                    attributes: ['nombre', 'duracion'], // Incluye solo nombre y duración del servicio
                },
                {
                    model: Cliente,
                    as: 'cliente', // Alias actualizado
                    attributes: ['nombre', 'apellido', 'comentario'], // Campos relevantes
                },
                {
                    model: Usuario,
                    as: 'empleadoUsuario', // Alias actualizado
                    attributes: ['nombre'], // Incluye solo el nombre del empleado
                },
            ],
        });

        // Mapear las reservas con los datos relevantes
        const reservasFormateadas = reservas.map((reserva) => ({
            id: reserva.id,
            fecha: reserva.fecha,
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            empleado: reserva.empleadoUsuario?.nombre || 'Sin asignar', // Nombre del empleado
            nombre_servicio: reserva.servicio?.nombre || 'Sin servicio',
            duracion: reserva.servicio?.duracion || 0,
            cliente: `${reserva.cliente?.nombre || 'Desconocido'} ${reserva.cliente?.apellido || ''}`.trim(),
            estado: reserva.estado,
            comentario_cliente: reserva.comentario_cliente || 'Sin comentario',
        }));

        res.json({ reservas: reservasFormateadas });
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ error: 'Error interno al obtener reservas.' });
    }
};
