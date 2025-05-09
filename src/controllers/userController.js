import User from '../models/User.js';
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

        //TODO // Generar un código de verificación aleatorio
        // const verificationCode = Math.floor(100000 + Math.random() * 900000);  // Genera un código de 6 dígitos

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword/*, verificationCode, isVerified: false*/ });
        await newUser.save();

        //TODO await sendVerificationEmail(email, verificationCode);  // Enviar el correo de verificación

        // Crear el token JWT
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, config.security.JWT_SECRET, { expiresIn: '1h' });

        // Enviar el correo de confirmación de registro
        await sendConfirmationEmail(email);

        res.status(201).send({ message: 'Usuario registrado correctamente, Revisa tu correo electrónico.', user: newUser, data: { token } });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error });
    }
};

//TODO Verificar el código de verificación
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
        const users = await User.find();
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

//Obtener el panel de administrador (solo accesible por el admin)
export const getAdminPanel = async (req, res) => {
    try {
        //Acceder a las funcionalidades del panel de admin
        res.status(200).json({ message: 'Panel de administrador' });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el panel de administrador', error });
    }
};

// Actualizar un usuario (solo el propio usuario o admin)
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
};

// Eliminar un usuario (solo admin)
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
};
