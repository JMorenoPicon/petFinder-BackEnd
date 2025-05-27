import express from 'express';
import { getCommentsByPet, createComment } from '../../controllers/commentController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/:petId', authMiddleware, getCommentsByPet);
router.post('/:petId', authMiddleware, createComment);

export default router;
