import express from 'express';
import { createPet, getPets, getPetById, updatePet, deletePet, getAdoptablePets, getLostPets } from '../../controllers/petController.js';

const router = express.Router();

// Rutas de mascotas
router.post('/', createPet);
router.get('/', getPets);
router.get('/adoptable', getAdoptablePets);
router.get('/lost', getLostPets);
router.get('/:id', getPetById);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

export default router;
