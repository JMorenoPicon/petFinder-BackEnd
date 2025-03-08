import mongoose from 'mongoose';
import config from '../config.js'; // Para obtener el URI de la base de datos desde .env

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conexión a MongoDB exitosa');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // Terminar el proceso si no se puede conectar
    }
};

export default connectDB;
