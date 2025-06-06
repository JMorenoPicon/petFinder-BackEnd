import express from 'express';
import { createUser, loginUser, updateUser, getProfile, verifyCode, requestEmailChange, confirmEmailChange, verifyEmailChange } from '../../controllers/userController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';  // Middleware de autenticación
import { userRole } from '../../middlewares/auth/roleMiddleware.js';  // Middleware de roles


const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         role:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Rutas publicas
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - repeatPassword
 *             properties:
 *               username:
 *                 type: string
 *                 example: juanito
 *               email:
 *                 type: string
 *                 example: juanito@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *               repeatPassword:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: El usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/', createUser); // Crear usuario
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 */
router.post('/login', loginUser); // Iniciar sesion
/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verificar código de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 */
router.post('/verify', verifyCode);

//Rutas privadas para el usuario
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener perfil de usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 isVerified:
 *                   type: boolean
 *       401:
 *         description: No autorizado, token inválido o ausente
 *       403:
 *         description: Acceso denegado por rol insuficiente
 */
router.get('/profile', authMiddleware, userRole, getProfile);
/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: juanitoNuevo
 *               email:
 *                 type: string
 *                 example: juanitoNuevo@email.com
 *               password:
 *                 type: string
 *                 example: nuevaPassword123
 *               currentPassword:
 *                 type: string
 *                 example: passwordActual123
 *             required:
 *               - currentPassword
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación o contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado, token inválido o ausente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/profile', authMiddleware, userRole, updateUser);
/**
 * @swagger
 * /users/request-email-change:
 *   post:
 *     summary: Solicitar cambio de email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 example: nuevo@email.com
 *     responses:
 *       200:
 *         description: Código enviado al nuevo email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Ese email ya está en uso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado, token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/request-email-change', authMiddleware, requestEmailChange);
/**
 * @swagger
 * /users/confirm-email-change:
 *   post:
 *     summary: Confirmar cambio de email con código recibido
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Código incorrecto o no hay cambio pendiente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado, token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/confirm-email-change', authMiddleware, confirmEmailChange);
/**
 * @swagger
 * /users/verify-email-change:
 *   post:
 *     summary: Verificar y confirmar cambio de email con código y ambos emails
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldEmail
 *               - newEmail
 *               - verificationCode
 *             properties:
 *               oldEmail:
 *                 type: string
 *                 example: actual@email.com
 *               newEmail:
 *                 type: string
 *                 example: nuevo@email.com
 *               verificationCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Código o email incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/verify-email-change', authMiddleware, verifyEmailChange);

//Rutas para panel de administrador
//TODO router.get('/admin', authMiddleware, adminRole, getAdminPanel);

//TODO Rutas protegidas (requieren autenticacion)
//TODO router.get('/', authMiddleware, adminRole, getUsers);
//TODO router.get('/:id', authMiddleware, adminRole, getUserById);
//TODO router.delete('/:id', authMiddleware, userRole, deleteUser);

export default router;
