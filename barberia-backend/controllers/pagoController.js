const axios = require('axios');
const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const khipuClient = require('../utils/khipuClient');


exports.crearPagoConKhipu = async (req, res) => {
  const { id_reserva, monto, descripcion } = req.body;

  try {
    // Validar la reserva
    const reserva = await Reserva.findByPk(id_reserva);
    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    // Crear el pago en Khipu
    const response = await khipuClient.post('/payments', {
      subject: descripcion,
      amount: monto,
      transaction_id: id_reserva.toString(),
      currency: 'CLP',
      return_url: 'https://rhea-backend-production.up.railway.app/simulacion/pago-exitoso',
      cancel_url: 'https://rhea-backend-production.up.railway.app/simulacion/pago-cancelado',
    });

    const { payment_id, payment_url } = response.data;

    // Guardar el pago en la base de datos
    const nuevoPago = await Pago.create({
      id: payment_id, // ID generado por Khipu
      id_reserva,
      monto,
      fecha: new Date(), // Fecha actual
      metodo_pago: 'Khipu', // Método de pago
      estado: 'pendiente', // Estado inicial
    });

    // Asociar el pago a la reserva
    reserva.id_pago = nuevoPago.id;
    await reserva.save();

    // Retornar la URL de pago al cliente
    return res.status(200).json({ payment_id, payment_url });
  } catch (error) {
    console.error('Error al crear el pago con Khipu:', error);
    return res.status(500).json({
      message: 'Error al generar el pago con Khipu.',
      error: error.message,
    });
  }
};

exports.recibirNotificacionKhipu = async (req, res) => {
  const { api_version, notification_token } = req.body;

  try {
      // Hacer una solicitud a Khipu para validar la notificación
      const authHeader = Buffer.from(
          `${process.env.KHIPU_RECEIVER_ID}:${process.env.KHIPU_SECRET}`
      ).toString('base64');

      const response = await axios.post(
          `${process.env.KHIPU_BASE_URL}/verify-notification`,
          { notification_token },
          {
              headers: {
                  Authorization: `Basic ${authHeader}`,
                  'Content-Type': 'application/json',
              },
          }
      );

      const { payment_id, status } = response.data;

      // Actualizar el estado del pago en la base de datos
      const pago = await Pago.findOne({ where: { codigo_transaccion: payment_id } });
      if (pago) {
          pago.estado = status === 'done' ? 'pagado' : 'fallido';
          await pago.save();
      }

      res.status(200).json({ message: 'Notificación procesada correctamente.' });
  } catch (error) {
      console.error('Error al procesar la notificación de Khipu:', error);
      res.status(500).json({ message: 'Error al procesar la notificación.', error: error.message });
  }
};


// Obtener todos los pagos
exports.getPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    res.status(200).json(pagos);
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ message: 'Error al obtener los pagos', error });
  }
};

// Obtener un pago por ID
exports.getPagoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findByPk(id);

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.status(200).json(pago);
  } catch (error) {
    console.error('Error al obtener el pago:', error);
    res.status(500).json({ message: 'Error al obtener el pago', error });
  }
};

// Actualizar un pago
exports.updatePago = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, metodo_pago, estado } = req.body;

    const pago = await Pago.findByPk(id);
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    pago.monto = monto || pago.monto;
    pago.metodo_pago = metodo_pago || pago.metodo_pago;
    pago.estado = estado || pago.estado;

    await pago.save();
    res.status(200).json({ message: 'Pago actualizado con éxito', pago });
  } catch (error) {
    console.error('Error al actualizar el pago:', error);
    res.status(500).json({ message: 'Error al actualizar el pago', error });
  }
};

// Eliminar un pago
exports.deletePago = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findByPk(id);

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    await pago.destroy();
    res.status(200).json({ message: 'Pago eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el pago:', error);
    res.status(500).json({ message: 'Error al eliminar el pago', error });
  }
};
