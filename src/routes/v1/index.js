import express from 'express';

import commentRoutes from './commentRoutes.js';
import petRoutes from './petRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'PetFinder API healthy' });
});

router.use('/users', userRoutes);
router.use('/pets', petRoutes);
router.use('/comments', commentRoutes);
router.use('/auth', authRoutes);

export default router;
