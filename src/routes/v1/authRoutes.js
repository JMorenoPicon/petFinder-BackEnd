// src/routes/authRoutes.js
import express from 'express';
import { forgotPassword, resetPassword, refreshToken } from '../../controllers/authController.js';

const router = express.Router();

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/v1/auth/refresh-token
router.post('/refresh-token', refreshToken);

export default router;
