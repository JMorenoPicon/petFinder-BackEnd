import express from 'express';
import loaders from './loaders/index.js';

const app = express();

loaders.init(app); // Inicializa todo lo necesario, como middlewares y rutas

export default app;
