import express from 'express';
import cors from 'cors';
import { logDate } from '../middlewares/logger-middleware.js'; // Middleware de logger
import errorHandler from '../middlewares/error-handler.js'; // Middleware de manejo de errores
import router from '../routes/v1/index.js'; // Las rutas de la aplicación
import dotenv from 'dotenv'; // Para cargar variables de entorno
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../documentation/swagger.js';

dotenv.config(); // Cargar variables de entorno

export default function (server) {
    server.use(express.json({ limit: '10mb' }));   // Permitir que Express maneje solicitudes JSON
    server.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para soportar datos URL-encoded
    server.use(cors());           // Habilitar CORS
    server.use(logDate); // Middleware para registrar las solicitudes

    // Health check global para Render
    server.get('/', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'PetFinder API healthy' });
    });

    // Documentación Swagger accesible en /api-docs
    server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    server.use(process.env.APIBASE, router); // Rutas de la aplicación

    server.use('*', (req, res) => {
        res.status(404).send('Not found');  // Ruta no encontrada
    });

    server.use(errorHandler); // Middleware para el manejo de errores
}
