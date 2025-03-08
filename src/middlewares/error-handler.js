import logger from '../helpers/utils/logger/logger.js';

// Middleware para manejo de errores
export default function errorHandler(err, req, res, next) {
    const status = err.status || 500; // Establecer código de estado por defecto 500
    const message = err.message || 'Internal Server Error'; // Mensaje de error por defecto
    const stack = err.stack || ''; // Stack trace (útil para errores internos)

    // Registrar el error
    logger.error(`[${status}] ${message} - ${req.method} ${req.originalUrl} - ${stack}`);

    // Respuesta de error (más detallada)
    res.status(status).send({
        code: status,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack }) // Incluir stack trace solo en desarrollo
    });
}
