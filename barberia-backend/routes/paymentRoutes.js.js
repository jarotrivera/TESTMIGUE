const express = require('express');
const router = express.Router();
const khipuClient = require('../utils/khipuClient');

router.post('/generatePago', async (req, res) => {
  const { amount, description, customerEmail } = req.body;

  try {
    const response = await khipuClient.post('/payments', {
      subject: description,
      currency: 'CLP',
      amount: parseFloat(amount),
      payerEmail: customerEmail,
      returnUrl: 'http://localhost:3000/payment-success', // Cambia según tu frontend
      cancelUrl: 'http://localhost:3000/payment-cancel',
      transactionId: `trans-${Date.now()}`,
    });

    res.json({
      paymentUrl: response.data.payment_url,
    });
  } catch (error) {
    console.error('Error al generar el pago:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error al generar el pago', error: error.message });
  }
});

module.exports = router;
