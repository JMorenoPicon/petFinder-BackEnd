import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

// Función para enviar un correo de verificación
export const sendVerificationEmail = async (to, code) => {
    const mailOptions = {
        from: config.email.user,  // Correo de la cuenta Gmail
        to: to,                   // Correo del usuario
        subject: 'Verifica tu correo en Pet Finder',
        text: `Tu código de verificación es: ${code}. Ingresa este código en la aplicación para completar tu registro.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch {
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
    } catch {
    }
};

// Función para enviar un correo de restablecimiento de contraseña
export async function sendResetEmail(to, token) {
    await transporter.sendMail({
        from: '"PetFinder" <no-reply@petfinder.com>',
        to,
        subject: 'PetFinder – Recuperar contraseña',
        html: `
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Código de verificación: <b>${token}</b></p>
      <p>Si no lo solicitaste, ignora este correo.</p>
    `
    });
}
