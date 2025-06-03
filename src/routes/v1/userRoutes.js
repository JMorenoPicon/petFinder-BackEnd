import express from 'express';
import { createUser, loginUser, getUsers, getUserById, updateUser, deleteUser, getProfile, getAdminPanel, verifyCode, requestEmailChange, confirmEmailChange, verifyEmailChange } from '../../controllers/userController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';  // Middleware de autenticación
import { adminRole, userRole } from '../../middlewares/auth/roleMiddleware.js';  // Middleware de roles


const router = express.Router();

// Rutas publicas
router.post('/', createUser); // Crear usuario
router.post('/login', loginUser); // Iniciar sesion
router.post('/verify', verifyCode);

//Rutas privadas para el usuario
router.get('/profile', authMiddleware, userRole, getProfile);
router.put('/profile', authMiddleware, userRole, updateUser);
router.post('/request-email-change', authMiddleware, requestEmailChange);
router.post('/confirm-email-change', authMiddleware, confirmEmailChange);
router.post('/verify-email-change', authMiddleware, verifyEmailChange);

//Rutas para panel de administrador
router.get('/admin', authMiddleware, adminRole, getAdminPanel);

// Rutas protegidas (requieren autenticacion)
router.get('/', authMiddleware, adminRole, getUsers);
router.get('/:id', authMiddleware, adminRole, getUserById);
router.delete('/:id', authMiddleware, userRole, deleteUser);

export default router;
