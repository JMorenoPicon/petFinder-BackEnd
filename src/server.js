import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import logger from "./helpers/logger/logger.js";
import connectDB from "./config.js"; //import conneccion function

dotenv.config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares de seguridad y logs
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan(`dev`, { stream: { write: message => logger.info(message.trim()) } }));

// Ruta de prueba
app.get(`/`, (req, res) => {
    logger.info(`Solicitud recibida en /`);
    res.json({ message: `API funcionando con seguridad y MongoDB Atlas 🚀` });
});

// Iniciar servidor
const server = app.listen(process.env.PORT || 5000, () => {
    logger.info(`Servidor en http://localhost:${process.env.PORT || 5000}`);
});

// Exportar tanto el servidor como la app para pruebas
export { app, server };
