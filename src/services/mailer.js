import nodemailer from 'nodemailer';
import config from '../config.js';

// Configuración de MailHog (con Docker)
const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    tls: {
        rejectUnauthorized: false,
    },
});

// const transporter = nodemailer.createTransport({
//     service: config.email.service,
//     auth: {
//         user: config.email.user,
//         pass: config.email.pass,
//     },
// });

// Función para enviar un correo de verificación
export const sendVerificationEmail = async (to, code) => {
    const mailOptions = {
        from: config.email.user,  // Correo de la cuenta Gmail
        to: to,                   // Correo del usuario
        subject: 'Código de Verificación',
        text: `Tu código de verificación es: ${code}. Ingresa este código en la aplicación para completar tu registro.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

// Función para enviar el correo de confirmación después del registro exitoso
export const sendConfirmationEmail = async (to) => {
    const mailOptions = {
        from: config.email.user,  // Correo de envio
        to: to,                   // Correo del usuario
        subject: 'Registro Exitoso',
        text: 'Tu registro ha sido completado exitosamente. ¡Bienvenido a Pet Finder!',
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado');
    } catch (error) {
        console.error('Error al enviar el correo de confirmación:', error);
    }
};
