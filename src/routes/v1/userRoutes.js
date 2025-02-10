import express from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../../controllers/userController.js';

const router = express.Router();

// Rutas de usuarios
router.post('/register', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
