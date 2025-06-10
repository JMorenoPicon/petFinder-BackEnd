import { adminRole, userRole, ownerUser } from '../../../src/middlewares/auth/roleMiddleware.js';
import Pet from '../../../src/models/Pet.js';

jest.mock('../../../src/models/Pet.js');

describe('roleMiddleware - adminRole', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { role: 'user' } };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 403 if user is not admin', () => {
        adminRole(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ message: 'Acceso restringido. Requiere privilegios de administrador.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
        req.user.role = 'admin';
        adminRole(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});

describe('roleMiddleware - userRole', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { role: 'user' } };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 403 if user is neither user nor admin', () => {
        req.user.role = 'guest';
        userRole(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ message: 'Acceso restringido.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is user', () => {
        userRole(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
        req.user.role = 'admin';
        userRole(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});

describe('roleMiddleware - ownerUser', () => {
    let req, res, next, mockPet;

    beforeEach(() => {
        req = { user: { id: 'userId', role: 'user' }, params: { id: 'petId' } };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        next = jest.fn();
        mockPet = { owner: { toString: () => 'userId' } };
        jest.clearAllMocks();
    });

    it('should return 403 if user role is not user or admin', async () => {
        req.user.role = 'guest';
        await ownerUser(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ message: 'Acceso restringido.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', async () => {
        req.user.role = 'admin';
        await ownerUser(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 404 if pet not found', async () => {
        Pet.findById.mockResolvedValue(null);
        await ownerUser(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Mascota no encontrada.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not the owner', async () => {
        Pet.findById.mockResolvedValue({ owner: { toString: () => 'otherUser' } });
        await ownerUser(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ message: 'No tienes permiso para modificar esta mascota.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is the owner', async () => {
        Pet.findById.mockResolvedValue(mockPet);
        await ownerUser(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should handle errors and return 500', async () => {
        Pet.findById.mockRejectedValue(new Error('fail'));
        await ownerUser(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: expect.stringContaining('Error verificando propiedad de la mascota') });
        expect(next).not.toHaveBeenCalled();
    });
});
