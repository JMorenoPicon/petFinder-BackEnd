import request from 'supertest';
import app from '../../src/app.js'; // Asegúrate de que app exporta la instancia de express

describe('Auth Integration', () => {
    describe('POST /api/v1/auth/forgot-password', () => {
        it('debe rechazar si no se envía email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({});
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Email requerido/i);
        });
    });
});
