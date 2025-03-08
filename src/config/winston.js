import winston from 'winston';
import path from 'path';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

const winstonConfig = {
    level: process.env.LOG_LEVEL || 'info', // Usar un nivel de log configurable desde .env
    transports: [
        // Log a la consola (solo con colores en desarrollo)
        new transports.Console({
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Añadir timestamp
                colorize(), // Colorear los logs si no es producción
                printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`), // Formato del log
            ),
            silent: process.env.NODE_ENV === 'test', // Desactivar logs en pruebas
        }),

        // Log a un archivo (solo en producción)
        ...(process.env.NODE_ENV === 'production'
            ? [
                new transports.File({
                    filename: path.join('logs', 'app.log'),
                    level: 'info',
                    format: combine(
                        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        json() // Formato JSON en producción
                    ),
                }),
            ]
            : []),

        // Log de errores en un archivo separado
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error', // Solo errores en este archivo
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                json()
            ),
        }),
    ],
    exitOnError: false, // No terminar el proceso si hay un error
};

export default winstonConfig;
