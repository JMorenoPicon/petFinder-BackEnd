import express from 'express';
import { createPet, getPets, getPetById, updatePet, deletePet, getAdoptablePets, getLostPets, getMyPets, markPetAsFound, getFoundPets } from '../../controllers/petController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';  // Middleware de autenticación
import { ownerUser } from '../../middlewares/auth/roleMiddleware.js';  // Middleware de roles


const router = express.Router();

// Rutas de mascotas
router.post('/', authMiddleware, createPet);
router.get('/adoptable', authMiddleware, getAdoptablePets);
router.get('/lost', authMiddleware, getLostPets);
router.get('/found', authMiddleware, getFoundPets);
router.get('/mine', authMiddleware, getMyPets);
router.delete('/:id', authMiddleware, ownerUser, deletePet);
router.get('/:id', authMiddleware, getPetById);
router.get('/', authMiddleware, getPets);
router.put('/:id', authMiddleware, ownerUser, updatePet);
router.put('/:id/found', authMiddleware, ownerUser, markPetAsFound); // Marcar mascota como encontrada

export default router;
