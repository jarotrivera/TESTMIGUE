// archivo: utils/sendEmail.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

// EMPLEADO CREAR CUENTA
// Función para enviar correos usando plantillas dinámicas 
const sendEmail = async (to, templateId, dynamicData) => {
  const msg = {
    to, // Correo del receptor
    from: 'rheareserve@gmail.com', // 
    templateId, // ID de la plantilla dinámica en SendGrid
    dynamic_template_data: dynamicData // Datos dinámicos que se pasarán a la plantilla
  };   
  try {
    await sgMail.send(msg);
    console.log('Correo enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar correo:', error.response ? error.response.body.errors : error.message);
    throw new Error('No se pudo enviar el correo');
  }
};


// CORREO CONFIRMACIÓN DE CITA
// NUEVA FUNCIÓN para enviar correos con dynamicTemplateData (por ejemplo, para reservas)
const sendEmailWithTemplateData = async (to, templateId, dynamicTemplateData) => {
  const msg = {
    to, // Correo del receptor
    from: 'rheareserve@gmail.com', // Correo del remitente
    templateId, // ID de la plantilla dinámica en SendGrid
    dynamic_template_data: dynamicTemplateData, // Datos dinámicos que se pasarán a la plantilla
  };
  try {
    await sgMail.send(msg);
    console.log('Correo enviado exitosamente con dynamicTemplateData');
  } catch (error) {
    console.error('Error al enviar correo con dynamicTemplateData:', error.response ? error.response.body.errors : error.message);
    throw new Error('No se pudo enviar el correo con dynamicTemplateData');
  }
};

module.exports = {
  sendEmail, // Función original para empleados
  sendEmailWithTemplateData, // Nueva función para reservas u otros usos
};