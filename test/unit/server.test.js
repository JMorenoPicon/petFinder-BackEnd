import request from 'supertest';
import { app, server } from '../../src/server.js'; // Importa tanto app como server

describe('API Básica', () => {
    it('Debe responder con un mensaje de bienvenida', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('API funcionando con seguridad 🚀');
    });

    afterAll(() => {
        server.close(); // Cierra el servidor después de las pruebas
    });
});
