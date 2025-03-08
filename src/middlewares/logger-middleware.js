import logger from '../helpers/utils/logger/logger.js';

// Middleware para registrar la fecha y la ruta de cada solicitud
export function logDate(req, res, next) {
    const method = req.method; // Método HTTP (GET, POST, etc.)
    const path = req.path;     // Ruta de la solicitud
    const timestamp = new Date().toISOString(); // Marca temporal

    // Registrar la solicitud
    logger.info(`[${timestamp}] ${method} ${path}`);

    // Log del código de estado (cuando la respuesta se termine)
    res.on('finish', () => {
        const statusCode = res.statusCode; // Obtener el código de estado de la respuesta
        logger.info(`[${timestamp}] ${method} ${path} ${statusCode}`);
    });

    next(); // Pasar al siguiente middleware o ruta
}

// Middleware de ejemplo para registrar advertencias
// export function logMDW(req, res, next) {
//     logger.warn(`Warning: Middleware log for request to ${req.path}`);
//     next();
// }
