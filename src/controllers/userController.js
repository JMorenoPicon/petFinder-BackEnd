import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Comment from '../models/Comment.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { sendVerificationEmail, sendConfirmationEmail } from '../services/mailer.js';

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //Verificar si el usuario existe
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'El usuario ya existe' });

        // Generar un código de verificación aleatorio
        const verificationCode = Math.floor(100000 + Math.random() * 900000);  // Genera un código de 6 dígitos

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword, verificationCode, isVerified: false });
        await newUser.save();

        // Enviar el correo de verificación
        await sendVerificationEmail(email, verificationCode);

        res.status(201).send({ message: 'Usuario registrado correctamente, Revisa tu correo electrónico.', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error });
    }
};

// Verificar el código de verificación
export const verifyCode = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Buscar el usuario por el email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Verificar si el código coincide
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Código incorrecto' });
        }

        // Marcar al usuario como verificado
        user.isVerified = true;
        user.verificationCode = null; // Limpiar el código después de la verificación
        await user.save();

        // Enviar correo de confirmación después del registro exitoso
        await sendConfirmationEmail(email);

        res.status(200).json({ message: 'Registro completado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el código', error });
    }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });

        // Verificar si el usuario está verificado
        if (!user.isVerified) {
            // Generar un código de verificación aleatorio
            const verificationCode = Math.floor(100000 + Math.random() * 900000);  // Genera un código de 6 dígitos
            // Guardar el código en el usuario
            user.verificationCode = verificationCode;
            await user.save();
            // Reenviar el código de verificación aquí
            await sendVerificationEmail(user.email, verificationCode);
            return res.status(200).json({
                message: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
                isVerified: false
            });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas' });

        // Crear el token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, config.security.JWT_SECRET, { expiresIn: '1h' });

        //Responder con el token
        res.status(200).json({ message: 'Inicio de sesión exitoso', user, token });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
};

// Obtener todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -__v');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
};

// Obtener un usuario por ID (solo admin)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
};

//Obtener el perfil del usuario logueado (solo accesible por el propio usuario)
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id); //Obtener el usuario a través del ID almacenado en el token
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        //Devolver solo ciertos datos del perfil del usuario
        const { username, email } = user;
        res.status(200).json({ username, email });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil del usuario', error });
    }
};

// Actualizar un usuario (solo el propio usuario o admin)
export const updateUser = async (req, res) => {
    try {
        const { username, email, password, currentPassword } = req.body;

        // 1. Buscar el usuario actual
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // 2. Validar currentPassword
        if (!currentPassword) {
            return res.status(400).json({ message: 'Debes introducir tu contraseña actual para actualizar el perfil.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        // 3. Preparar los datos a actualizar
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // 4. Actualizar usuario
        const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
};

// Eliminar un usuario (solo admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'No se puede eliminar un usuario administrador.' });
        }

        // Eliminar mascotas del usuario
        await Pet.deleteMany({ owner: user._id });

        // Eliminar comentarios del usuario
        await Comment.deleteMany({ author: user._id });

        // Eliminar usuario
        await user.deleteOne();

        res.status(200).json({ message: 'Usuario y datos asociados eliminados exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
};

// Solicitar cambio de email
export const requestEmailChange = async (req, res) => {
    try {
        const { newEmail } = req.body;
        // Verifica que el nuevo email no esté en uso
        const exists = await User.findOne({ email: newEmail });
        if (exists) return res.status(400).json({ message: 'Ese email ya está en uso.' });

        // Genera código de verificación
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Guarda el email pendiente y el código en el usuario autenticado
        const user = await User.findById(req.user.id);
        user.pendingEmail = newEmail;
        user.pendingEmailCode = code;
        await user.save();

        // Envía el código al nuevo email
        await sendVerificationEmail(newEmail, code);

        res.status(200).json({ message: 'Código enviado al nuevo email.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar cambio de email', error });
    }
};

// Confirmar cambio de email
export const confirmEmailChange = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.pendingEmail || !user.pendingEmailCode) {
            return res.status(400).json({ message: 'No hay cambio de email pendiente.' });
        }
        if (user.pendingEmailCode !== code) {
            return res.status(400).json({ message: 'Código incorrecto.' });
        }

        // Realiza el cambio
        user.email = user.pendingEmail;
        user.pendingEmail = null;
        user.pendingEmailCode = null;
        await user.save();

        res.status(200).json({ message: 'Email actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al confirmar cambio de email', error });
    }
};

export const verifyEmailChange = async (req, res) => {
    try {
        const { oldEmail, newEmail, verificationCode } = req.body;
        // Busca el usuario por el email antiguo
        const user = await User.findOne({ email: oldEmail });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Verifica que el nuevo email y el código coincidan
        if (user.pendingEmail !== newEmail || user.pendingEmailCode !== verificationCode) {
            return res.status(400).json({ message: 'Código o email incorrecto.' });
        }

        // Realiza el cambio
        user.email = newEmail;
        user.pendingEmail = null;
        user.pendingEmailCode = null;
        await user.save();

        res.status(200).json({ message: 'Email actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el cambio de email', error });
    }
};
