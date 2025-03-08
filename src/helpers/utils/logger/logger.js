import winston from 'winston';
import winstonConfig from '../../../config/winston.js'; // Importar la configuración

const logger = winston.createLogger(winstonConfig); // Usar la configuración importada

export default logger; // Exportar el logger
