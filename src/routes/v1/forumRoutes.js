import express from 'express';
import { createPost, getPosts, getPostById, updatePost, deletePost } from '../../controllers/forumController.js';

const router = express.Router();

// Rutas de posts en el foro
router.post('/', createPost);              // Crear un nuevo post
router.get('/', getPosts);                 // Obtener todos los posts
router.get('/:id', getPostById);           // Obtener un post por ID
router.put('/:id', updatePost);           // Actualizar un post
router.delete('/:id', deletePost);       // Eliminar un post

export default router;
