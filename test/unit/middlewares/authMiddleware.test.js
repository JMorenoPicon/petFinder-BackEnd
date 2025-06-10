import { authMiddleware } from '../../../src/middlewares/auth/authMiddleware.js';
import jwt from 'jsonwebtoken';
import config from '../../../src/config.js';

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            header: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 401 if no token is provided', () => {
        req.header.mockReturnValue(undefined);

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: 'No se proporcionó token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set req.user if token is valid', () => {
        req.header.mockReturnValue('Bearer validtoken');
        const decoded = { id: 'userId', role: 'user' };
        jwt.verify.mockReturnValue(decoded);

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('validtoken', config.security.JWT_SECRET);
        expect(req.user).toEqual(decoded);
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
        req.header.mockReturnValue('Bearer invalidtoken');
        jwt.verify.mockImplementation(() => { throw new Error('fail'); });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: expect.stringContaining('Token inválido o expirado') });
        expect(next).not.toHaveBeenCalled();
    });
});
