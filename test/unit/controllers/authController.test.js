import { forgotPassword, resetPassword, refreshToken } from '../../../src/controllers/authController.js';
import User from '../../../src/models/User.js';
import { sendResetEmail } from '../../../src/services/mailer.js';
import jwt from 'jsonwebtoken';
import config from '../../../src/config.js';

jest.mock('../../../src/models/User.js');
jest.mock('../../../src/services/mailer.js');
jest.mock('jsonwebtoken');

describe('Auth Controller - forgotPassword', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = { body: { email: 'test@mail.com' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockUser = {
            save: jest.fn().mockResolvedValue(),
            resetPasswordToken: null,
            resetPasswordExpires: null
        };
        jest.clearAllMocks();
    });

    it('should return 400 if email is not provided', async () => {
        req.body.email = undefined;
        await forgotPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email requerido' });
    });

    it('should return 404 if user not found', async () => {
        User.findOne.mockResolvedValue(null);
        await forgotPassword(req, res);
        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@mail.com' });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should generate token, save user, send email and return success', async () => {
        User.findOne.mockResolvedValue(mockUser);
        sendResetEmail.mockResolvedValue();

        await forgotPassword(req, res);

        expect(mockUser.resetPasswordToken).toBeDefined();
        expect(mockUser.resetPasswordExpires).toBeGreaterThan(Date.now());
        expect(mockUser.save).toHaveBeenCalled();
        expect(sendResetEmail).toHaveBeenCalledWith('test@mail.com', expect.any(String));
        expect(res.json).toHaveBeenCalledWith({ message: 'Código de verificación enviado por correo' });
    });

    it('should handle errors sending email and return 500', async () => {
        User.findOne.mockResolvedValue(mockUser);
        sendResetEmail.mockRejectedValue(new Error('fail'));

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error al enviar el correo de restablecimiento' });
    });
});

describe('Auth Controller - resetPassword', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@mail.com',
                token: '123456',
                newPassword: 'newPass123'
            }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockUser = {
            password: 'oldHash',
            save: jest.fn().mockResolvedValue()
        };
        jest.clearAllMocks();
    });

    it('should return 400 if required fields are missing', async () => {
        req.body = {};
        await resetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email, token y nueva contraseña requeridos' });
    });

    it('should return 400 if user not found or token expired', async () => {
        User.findOne.mockResolvedValue(null);
        await resetPassword(req, res);
        expect(User.findOne).toHaveBeenCalledWith({
            email: 'test@mail.com',
            resetPasswordToken: '123456',
            resetPasswordExpires: { $gt: expect.any(Number) }
        });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' });
    });

    it('should hash new password, clear token fields, save user and return success', async () => {
        User.findOne.mockResolvedValue(mockUser);
        const bcrypt = require('bcryptjs');
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPass');

        await resetPassword(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith('newPass123', 10);
        expect(mockUser.password).toBe('hashedNewPass');
        expect(mockUser.resetPasswordToken).toBeUndefined();
        expect(mockUser.resetPasswordExpires).toBeUndefined();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña restablecida correctamente' });
    });
});

describe('Auth Controller - refreshToken', () => {
    let req, res;

    beforeEach(() => {
        req = {
            header: jest.fn(),
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return 401 if no Authorization header', () => {
        req.header.mockReturnValue(undefined);

        refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó token' });
    });

    it('should return new token if valid', () => {
        req.header.mockReturnValue('Bearer validtoken');
        jwt.verify.mockReturnValue({ id: 'userId', role: 'user' });
        jwt.sign.mockReturnValue('new.jwt.token');

        refreshToken(req, res);

        expect(jwt.verify).toHaveBeenCalledWith('validtoken', config.security.JWT_SECRET);
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 'userId', role: 'user' },
            config.security.JWT_SECRET,
            { expiresIn: '1h' }
        );
        expect(res.json).toHaveBeenCalledWith({ token: 'new.jwt.token' });
    });

    it('should return 401 if token is invalid or expired', () => {
        req.header.mockReturnValue('Bearer invalidtoken');
        jwt.verify.mockImplementation(() => { throw new Error('fail'); });

        refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Token inválido o expirado'
        }));
    });
});
