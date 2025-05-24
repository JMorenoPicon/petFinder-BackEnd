import express from 'express';
import { createPet, getPets, getPetById, updatePet, deletePet, getAdoptablePets, getLostPets, getMyPets } from '../../controllers/petController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';  // Middleware de autenticación
import { ownerUser } from '../../middlewares/auth/roleMiddleware.js';  // Middleware de roles


const router = express.Router();

// Rutas de mascotas
router.post('/', authMiddleware, createPet);
router.get('/adoptable', authMiddleware, getAdoptablePets);
router.get('/lost', authMiddleware, getLostPets);
router.get('/mine', authMiddleware, getMyPets);
router.delete('/:id', authMiddleware, ownerUser, deletePet);
router.get('/', authMiddleware, getPets);
router.get('/:id', authMiddleware, getPetById);
router.put('/:id', authMiddleware, ownerUser, updatePet);

export default router;
