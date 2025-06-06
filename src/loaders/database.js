import mongoose from 'mongoose';
import config from '../config.js'; // Para obtener el URI de la base de datos desde .env
import logger from '../helpers/utils/logger.js'; // Para registrar errores

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch {
        logger.error('Error connecting to the database');
        process.exit(1); // Terminar el proceso si no se puede conectar
    }
};

export default connectDB;
