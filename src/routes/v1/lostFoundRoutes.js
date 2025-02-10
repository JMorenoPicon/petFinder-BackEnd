import express from 'express';
import { createReport, getReports } from '../../controllers/lostFoundController.js';

const router = express.Router();

// Rutas de reportes de mascotas perdidas/encontradas
router.post('/', createReport);
router.get('/', getReports);

export default router;
