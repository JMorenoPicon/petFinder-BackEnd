jest.mock('express', () => ({
    json: jest.fn(() => function jsonParser() {}),
    urlencoded: jest.fn(() => function urlencodedParser() {}),
}));

import express from 'express';
import expressLoader from '../../../src/loaders/express.js';

jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));
jest.mock('../../../src/middlewares/logger-middleware.js', () => ({
    logDate: jest.fn((req, res, next) => next())
}));
jest.mock('../../../src/middlewares/error-handler.js', () => jest.fn((err, req, res, next) => next()));
jest.mock('../../../src/routes/v1/index.js', () => jest.fn());
jest.mock('swagger-ui-express', () => ({
    serve: jest.fn(),
    setup: jest.fn(() => (req, res, next) => next())
}));
jest.mock('../../../src/documentation/swagger.js', () => ({}));

describe('express loader', () => {
    let server;

    beforeEach(() => {
        server = {
            use: jest.fn(),
            get: jest.fn()
        };
        process.env.APIBASE = '/api/v1';
    });

    it('should setup all middlewares and routes', () => {
        expressLoader(server);

        // JSON and urlencoded
        expect(express.json).toHaveBeenCalledWith({ limit: '10mb' });
        expect(express.urlencoded).toHaveBeenCalledWith({ extended: true, limit: '10mb' });
        expect(server.use).toHaveBeenCalledWith(expect.any(Function)); // jsonParser
        expect(server.use).toHaveBeenCalledWith(expect.any(Function)); // urlencodedParser

        // CORS
        expect(server.use).toHaveBeenCalledWith(expect.any(Function));
        // Logger
        expect(server.use).toHaveBeenCalledWith(expect.any(Function));
        // Health check
        expect(server.get).toHaveBeenCalledWith('/', expect.any(Function));
        // Swagger
        expect(server.use).toHaveBeenCalledWith('/api-docs', expect.anything(), expect.anything());
        // API routes
        expect(server.use).toHaveBeenCalledWith('/api/v1', expect.any(Function));
        // 404 handler
        expect(server.use).toHaveBeenCalledWith('*', expect.any(Function));
        // Error handler
        expect(server.use).toHaveBeenCalledWith(expect.any(Function));
    });
});
