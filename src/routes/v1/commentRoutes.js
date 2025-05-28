import express from 'express';
import { getCommentsByPet, createComment, updateComment, deleteComment } from '../../controllers/commentController.js';
import { authMiddleware } from '../../middlewares/auth/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/:petId', authMiddleware, getCommentsByPet);
router.post('/:petId', authMiddleware, createComment);
router.put('/:petId/:commentId', authMiddleware, updateComment);
router.delete('/:petId/:commentId', authMiddleware, deleteComment);

export default router;
