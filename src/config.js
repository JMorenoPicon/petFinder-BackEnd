import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'info', // Ajustar el nivel de logs

    security: {
        JWT_SECRET: process.env.JWT_SECRET, // Definición de la clave JWT desde .env
    },

    mongoUri: process.env.MONGO_URI, // URI para la conexión a la base de datos

    email: {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
};

export default config;
