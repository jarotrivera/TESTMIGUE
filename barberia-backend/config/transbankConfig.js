const Transbank = require('transbank-sdk');

// Configura manualmente los parámetros de prueba de Webpay Plus
const WebpayPlus = new Transbank.WebpayPlus.Transaction({
  commerceCode: '597055555532', // Código de Comercio de prueba para Webpay Plus
  apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // API Key de prueba
  environment: Transbank.Environment.Integration // Ambiente de Integración
});

module.exports = WebpayPlus;
