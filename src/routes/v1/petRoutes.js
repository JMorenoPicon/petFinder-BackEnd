import express from 'express';
import { createPet, getPets, getPetById, updatePet, deletePet, getAdoptablePets, getLostPets, getMyPets, markPetAsFound, getFoundPets } from '../../controllers/petController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';  // Middleware de autenticación
import { ownerUser, adminRole } from '../../middlewares/auth/roleMiddleware.js';  // Middleware de roles


const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         species:
 *           type: string
 *         breed:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *         city:
 *           type: string
 *         image:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, reserved, lost, found]
 *         foundAt:
 *           type: string
 *           format: date-time
 *         foundLocationLat:
 *           type: number
 *         foundLocationLng:
 *           type: number
 *         owner:
 *           oneOf:
 *             - type: string
 *               description: ID del usuario propietario
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *         lastSeen:
 *           type: string
 *         reservedAt:
 *           type: string
 *           format: date-time
 *         locationLat:
 *           type: number
 *         locationLng:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Rutas de mascotas
/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Crear una nueva mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - species
 *               - breed
 *               - birthDate
 *               - description
 *               - city
 *               - image
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: Max
 *               species:
 *                 type: string
 *                 example: Perro
 *               breed:
 *                 type: string
 *                 example: Labrador
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 2020-01-01
 *               description:
 *                 type: string
 *                 example: Muy juguetón y cariñoso
 *               city:
 *                 type: string
 *                 example: Madrid
 *               image:
 *                 type: string
 *                 example: https://ejemplo.com/imagen.jpg
 *               status:
 *                 type: string
 *                 enum: [available, reserved, lost, found]
 *                 example: available
 *               lastSeen:
 *                 type: string
 *                 example: "Calle Mayor, Madrid"
 *               reservedAt:
 *                 type: string
 *                 format: date-time
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Mascota creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Datos inválidos o faltantes
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
router.post('/', authMiddleware, createPet);
/**
 * @swagger
 * /pets/adoptable:
 *   get:
 *     summary: Obtener mascotas disponibles para adopción
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas adoptables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/adoptable', authMiddleware, getAdoptablePets);
/**
 * @swagger
 * /pets/lost:
 *   get:
 *     summary: Obtener mascotas perdidas
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas perdidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/lost', authMiddleware, getLostPets);
/**
 * @swagger
 * /pets/found:
 *   get:
 *     summary: Obtener mascotas encontradas
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/found', authMiddleware, getFoundPets);
/**
 * @swagger
 * /pets/mine:
 *   get:
 *     summary: Obtener todas las mascotas del usuario autenticado
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/mine', authMiddleware, getMyPets);
/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Eliminar una mascota por ID
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Mascota eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permiso para modificar esta mascota
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/:id', authMiddleware, ownerUser, deletePet);
/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Obtener una mascota por ID
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Mascota encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, getPetById);
/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Obtener todas las mascotas (solo admin)
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Acceso denegado, solo admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', authMiddleware, adminRole, getPets);
/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Actualizar una mascota por ID
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Max
 *               species:
 *                 type: string
 *                 example: Perro
 *               breed:
 *                 type: string
 *                 example: Labrador
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 2020-01-01
 *               description:
 *                 type: string
 *                 example: Muy juguetón y cariñoso
 *               city:
 *                 type: string
 *                 example: Madrid
 *               image:
 *                 type: string
 *                 example: https://ejemplo.com/imagen.jpg
 *               status:
 *                 type: string
 *                 enum: [available, reserved, lost, found]
 *                 example: available
 *               lastSeen:
 *                 type: string
 *                 example: "Calle Mayor, Madrid"
 *               reservedAt:
 *                 type: string
 *                 format: date-time
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Mascota actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permiso para modificar esta mascota
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:id', authMiddleware, ownerUser, updatePet);
/**
 * @swagger
 * /pets/{id}/found:
 *   put:
 *     summary: Marcar mascota como encontrada
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foundAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-01T12:00:00Z"
 *               foundLocationLat:
 *                 type: number
 *                 example: 40.4168
 *               foundLocationLng:
 *                 type: number
 *                 example: -3.7038
 *     responses:
 *       200:
 *         description: Mascota marcada como encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       401:
 *         description: No autorizado, token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permiso para modificar esta mascota
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:id/found', authMiddleware, ownerUser, markPetAsFound); // Marcar mascota como encontrada

export default router;
