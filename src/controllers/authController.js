// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendResetEmail } from '../services/mailer.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

/**
 * 1) Genera un código, lo almacena en el usuario y envía el mail.
 */
export async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requerido' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Generar un token numérico de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar token y expiración (1 hora)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600 * 1000;
    await user.save();

    // Enviar correo
    try {
        await sendResetEmail(email, token);
        res.json({ message: 'Código de verificación enviado por correo' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error enviando correo' });
    }
}

/**
 * 2) Verifica el token y cambia la contraseña.
 */
export async function resetPassword(req, res) {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: 'Email, token y nueva contraseña requeridos' });
    }

    const user = await User.findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Hashear la nueva contraseña y limpiar campos
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña restablecida correctamente' });
}

export function refreshToken(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No se proporcionó token' });
    }
    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, config.security.JWT_SECRET);
        // Generar un nuevo token con los mismos datos y nueva expiración
        const newToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            config.security.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado', error });
    }
}
