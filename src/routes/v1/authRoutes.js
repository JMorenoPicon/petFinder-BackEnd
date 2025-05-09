// src/routes/authRoutes.js
import express from 'express';
import { forgotPassword, resetPassword } from '../../controllers/authController.js';

const router = express.Router();

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', resetPassword);

export default router;
