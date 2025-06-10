import { createUser, verifyCode, loginUser, getProfile, updateUser, requestEmailChange, confirmEmailChange, verifyEmailChange } from '../../../src/controllers/userController.js';
import User from '../../../src/models/User.js';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail, sendConfirmationEmail } from '../../../src/services/mailer.js';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/models/User.js');
jest.mock('bcryptjs');
jest.mock('../../../src/services/mailer.js');
jest.mock('../../../src/services/mailer.js');
jest.mock('jsonwebtoken');

describe('User Controller - createUser', () => {
    let req, res;

    beforeEach(() => {
        req = { body: { username: 'testuser', email: 'test@mail.com', password: '123456' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.prototype.save = jest.fn().mockResolvedValue();
        sendVerificationEmail.mockResolvedValue();

        await createUser(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@mail.com' });
        expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
        expect(User.prototype.save).toHaveBeenCalled();
        expect(sendVerificationEmail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.any(String),
            user: expect.any(Object)
        }));
    });

    it('should return 400 if user already exists', async () => {
        User.findOne.mockResolvedValue({ email: 'test@mail.com' });

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El usuario ya existe' });
    });

    it('should handle errors and return 500', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al crear el usuario',
            error: expect.anything()
        }));
    });
});

describe('User Controller - verifyCode', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = { body: { email: 'test@mail.com', verificationCode: 123456 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockUser = {
            verificationCode: 123456,
            isVerified: false,
            save: jest.fn().mockResolvedValue(),
            email: 'test@mail.com'
        };
        jest.clearAllMocks();
    });

    it('should return 404 if user not found', async () => {
        User.findOne.mockResolvedValue(null);

        await verifyCode(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should return 400 if code is incorrect', async () => {
        mockUser.verificationCode = 654321;
        User.findOne.mockResolvedValue(mockUser);

        await verifyCode(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Código incorrecto' });
    });

    it('should verify user and send confirmation email', async () => {
        User.findOne.mockResolvedValue(mockUser);
        sendConfirmationEmail.mockResolvedValue();

        await verifyCode(req, res);

        expect(mockUser.isVerified).toBe(true);
        expect(mockUser.verificationCode).toBeNull();
        expect(mockUser.save).toHaveBeenCalled();
        expect(sendConfirmationEmail).toHaveBeenCalledWith('test@mail.com');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Registro completado exitosamente' });
    });

    it('should handle errors and return 500', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        await verifyCode(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al verificar el código',
            error: expect.anything()
        }));
    });
});

describe('User Controller - loginUser', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = { body: { email: 'test@mail.com', password: '123456' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockUser = {
            _id: 'userId',
            email: 'test@mail.com',
            password: 'hashedPassword',
            isVerified: true,
            role: 'user',
            save: jest.fn().mockResolvedValue()
        };
        jest.clearAllMocks();
    });

    it('should return 400 if user not found', async () => {
        User.findOne.mockResolvedValue(null);

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
    });

    it('should handle unverified user and send verification code', async () => {
        mockUser.isVerified = false;
        User.findOne.mockResolvedValue(mockUser);
        sendVerificationEmail.mockResolvedValue();

        await loginUser(req, res);

        expect(mockUser.save).toHaveBeenCalled();
        expect(sendVerificationEmail).toHaveBeenCalledWith(mockUser.email, expect.any(Number));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
            isVerified: false
        });
    });

    it('should return 400 if password is incorrect', async () => {
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await loginUser(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
    });

    it('should login successfully and return token', async () => {
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mockedToken');

        await loginUser(req, res);

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: mockUser._id, role: mockUser.role },
            expect.any(String),
            { expiresIn: '1h' }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Inicio de sesión exitoso',
            user: mockUser,
            token: 'mockedToken'
        });
    });

    it('should handle errors and return 500', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al iniciar sesión',
            error: expect.anything()
        }));
    });
});

describe('User Controller - getProfile', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = { user: { id: 'userId' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockUser = {
            username: 'testuser',
            email: 'test@mail.com'
        };
        jest.clearAllMocks();
    });

    it('should return 404 if user not found', async () => {
        User.findById.mockResolvedValue(null);

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should return user profile data', async () => {
        User.findById.mockResolvedValue(mockUser);

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            username: 'testuser',
            email: 'test@mail.com'
        });
    });

    it('should handle errors and return 500', async () => {
        User.findById.mockRejectedValue(new Error('DB error'));

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener el perfil del usuario',
            error: expect.anything()
        }));
    });
});

describe('User Controller - updateUser', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = {
            user: { id: 'userId' },
            body: {
                username: 'newuser',
                email: 'new@mail.com',
                password: 'newpass',
                currentPassword: 'oldpass'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockUser = {
            _id: 'userId',
            username: 'olduser',
            email: 'old@mail.com',
            password: 'hashedOldPass',
            save: jest.fn().mockResolvedValue()
        };
        jest.clearAllMocks();
    });

    it('should return 404 if user not found', async () => {
        User.findById.mockResolvedValue(null);

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should return 400 if currentPassword is not provided', async () => {
        User.findById.mockResolvedValue(mockUser);
        req.body.currentPassword = undefined;

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Debes introducir tu contraseña actual para actualizar el perfil.' });
    });

    it('should return 400 if currentPassword is incorrect', async () => {
        User.findById.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await updateUser(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'hashedOldPass');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'La contraseña actual es incorrecta.' });
    });

    it('should update user with new password', async () => {
        User.findById.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('hashedNewPass');
        const updatedUser = { ...mockUser, username: 'newuser', email: 'new@mail.com', password: 'hashedNewPass' };
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        await updateUser(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', expect.objectContaining({
            username: 'newuser',
            email: 'new@mail.com',
            password: 'hashedNewPass'
        }), { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should update user without new password', async () => {
        User.findById.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        req.body.password = undefined;
        const updatedUser = { ...mockUser, username: 'newuser', email: 'new@mail.com' };
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        await updateUser(req, res);

        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', expect.objectContaining({
            username: 'newuser',
            email: 'new@mail.com'
        }), { new: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 404 if updated user not found', async () => {
        User.findById.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        User.findByIdAndUpdate.mockResolvedValue(null);

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should handle errors and return 500', async () => {
        User.findById.mockRejectedValue(new Error('DB error'));

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al actualizar el usuario',
            error: expect.anything()
        }));
    });
});

describe('User Controller - requestEmailChange', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = { user: { id: 'userId' }, body: { newEmail: 'new@mail.com' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockUser = { save: jest.fn().mockResolvedValue(), pendingEmail: null, pendingEmailCode: null };
        jest.clearAllMocks();
    });

    it('should return 400 if new email is already in use', async () => {
        User.findOne.mockResolvedValue({ email: 'new@mail.com' });

        await requestEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Ese email ya está en uso.' });
    });

    it('should save pending email and send verification code', async () => {
        User.findOne.mockResolvedValueOnce(null); // new email not in use
        User.findById.mockResolvedValue(mockUser);
        sendVerificationEmail.mockResolvedValue();

        await requestEmailChange(req, res);

        expect(mockUser.pendingEmail).toBe('new@mail.com');
        expect(mockUser.pendingEmailCode).toBeDefined();
        expect(mockUser.save).toHaveBeenCalled();
        expect(sendVerificationEmail).toHaveBeenCalledWith('new@mail.com', expect.any(String));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Código enviado al nuevo email.' });
    });

    it('should handle errors and return 500', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        await requestEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al solicitar cambio de email',
            error: expect.anything()
        }));
    });
});

describe('User Controller - confirmEmailChange', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = { user: { id: 'userId' }, body: { code: '123456' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockUser = {
            pendingEmail: 'new@mail.com',
            pendingEmailCode: '123456',
            email: 'old@mail.com',
            save: jest.fn().mockResolvedValue()
        };
        jest.clearAllMocks();
    });

    it('should return 400 if no pending email change', async () => {
        User.findById.mockResolvedValue({ pendingEmail: null, pendingEmailCode: null });

        await confirmEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'No hay cambio de email pendiente.' });
    });

    it('should return 400 if code is incorrect', async () => {
        User.findById.mockResolvedValue({ ...mockUser, pendingEmailCode: '654321' });

        await confirmEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Código incorrecto.' });
    });

    it('should update email and clear pending fields', async () => {
        User.findById.mockResolvedValue(mockUser);

        await confirmEmailChange(req, res);

        expect(mockUser.email).toBe('new@mail.com');
        expect(mockUser.pendingEmail).toBeNull();
        expect(mockUser.pendingEmailCode).toBeNull();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email actualizado correctamente.' });
    });

    it('should handle errors and return 500', async () => {
        User.findById.mockRejectedValue(new Error('DB error'));

        await confirmEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al confirmar cambio de email',
            error: expect.anything()
        }));
    });
});

describe('User Controller - verifyEmailChange', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = {
            body: {
                oldEmail: 'old@mail.com',
                newEmail: 'new@mail.com',
                verificationCode: '123456'
            }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockUser = {
            pendingEmail: 'new@mail.com',
            pendingEmailCode: '123456',
            email: 'old@mail.com',
            save: jest.fn().mockResolvedValue()
        };
        jest.clearAllMocks();
    });

    it('should return 404 if user not found', async () => {
        User.findOne.mockResolvedValue(null);

        await verifyEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should return 400 if code or email is incorrect', async () => {
        User.findOne.mockResolvedValue({ ...mockUser, pendingEmail: 'other@mail.com' });

        await verifyEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Código o email incorrecto.' });
    });

    it('should update email and clear pending fields', async () => {
        User.findOne.mockResolvedValue(mockUser);

        await verifyEmailChange(req, res);

        expect(mockUser.email).toBe('new@mail.com');
        expect(mockUser.pendingEmail).toBeNull();
        expect(mockUser.pendingEmailCode).toBeNull();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email actualizado correctamente.' });
    });

    it('should handle errors and return 500', async () => {
        User.findOne.mockRejectedValue(new Error('DB error'));

        await verifyEmailChange(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al verificar el cambio de email',
            error: expect.anything()
        }));
    });
});
