import express from 'express';

import forumRoutes from './forumRoutes.js';
import lostFoundRoutes from './lostFoundRoutes.js';
import petRoutes from './petRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/pets', petRoutes);
router.use('/lost-found', lostFoundRoutes);
router.use('/forum', forumRoutes);
router.use('/auth', authRoutes);

export default router;
