// controllers/Email.js
const nodemailer = require('nodemailer');

// Configura el transporte de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: 'yoninplay03@gmail.com', // Tu correo
        pass: 'ewlb uyjh arus vymz', // La contraseña de la aplicación generada
    },
});


// Función para enviar el correo de creación de contraseña
const enviarEmailCreacionContraseña = async (email, link) => {
    const mailOptions = {
        from: '"Soporte" <yoninplay03@gmail.com>', // Nombre y correo del remitente
        to: email,
        subject: 'Crea tu contraseña',
        text: `Hola,\n\nPor favor, sigue este enlace para crear tu contraseña: ${link}\n\nGracias.`,
        html: `<p>Hola,</p><p>Por favor, sigue este enlace para crear tu contraseña:</p><a href="${link}">Crear Contraseña</a><p>Gracias.</p>`,
    };
    

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

module.exports = {
    enviarEmailCreacionContraseña,
};
