import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config.js';

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //Verificar si el usuario existe
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'El usuario ya existe' });

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Crear el token JWT
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, config.security.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).send ({ message: 'Usuario registrado correctamente', user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error });
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
