import { createPet, getPets, getPetById, updatePet, deletePet, getAdoptablePets, getLostPets, getFoundPets, getMyPets, markPetAsFound } from '../../../src/controllers/petController.js';
import Pet from '../../../src/models/Pet.js';
import cloudinary from '../../../src/helpers/cloudinary.js';

jest.mock('../../../src/models/Pet.js');
jest.mock('../../../src/helpers/cloudinary.js', () => ({
    uploader: { upload: jest.fn() }
}));

describe('Pet Controller - createPet', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: 'Max',
                species: 'dog',
                breed: 'labrador',
                birthDate: '2020-01-01',
                description: 'desc',
                city: 'city',
                image: 'http://img',
                status: 'available'
            },
            user: { id: 'userId' }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return 400 if required field is missing', async () => {
        req.body.name = '';
        await createPet(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('El campo') });
    });

    it('should return 400 if birthDate is in the future', async () => {
        req.body.birthDate = '2999-01-01';
        await createPet(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'La fecha de nacimiento no puede ser futura.' });
    });

    it('should upload image if not a URL and create pet', async () => {
        req.body.image = 'base64img';
        cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'http://cloudinary.com/img' });
        Pet.prototype.save = jest.fn().mockResolvedValue();
        await createPet(req, res);
        expect(cloudinary.uploader.upload).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should create pet with image URL', async () => {
        Pet.prototype.save = jest.fn().mockResolvedValue();
        await createPet(req, res);
        expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle errors and return 500', async () => {
        Pet.prototype.save = jest.fn().mockRejectedValue(new Error('fail'));
        await createPet(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Error al crear la mascota') }));
    });
});

describe('Pet Controller - getPets', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return all pets', async () => {
        const pets = [{ name: 'Max' }, { name: 'Luna' }];
        Pet.find.mockResolvedValue(pets);

        await getPets(req, res);

        expect(Pet.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pets);
    });

    it('should handle errors and return 500', async () => {
        Pet.find.mockRejectedValue(new Error('fail'));

        await getPets(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener las mascotas'
        }));
    });
});

describe('Pet Controller - getPetById', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { id: 'petId' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return pet by id', async () => {
        const pet = { name: 'Max', populate: jest.fn().mockResolvedValue() };
        Pet.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(pet)
        });

        await getPetById(req, res);

        expect(Pet.findById).toHaveBeenCalledWith('petId');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pet);
    });

    it('should return 404 if pet not found', async () => {
        Pet.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
        });

        await getPetById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mascota no encontrada' });
    });

    it('should handle errors and return 500', async () => {
        Pet.findById.mockImplementation(() => { throw new Error('fail'); });

        await getPetById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener la mascota'
        }));
    });
});

describe('Pet Controller - updatePet', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 'petId' },
            body: {
                name: 'Max',
                species: 'dog',
                breed: 'labrador',
                birthDate: '2020-01-01',
                description: 'desc',
                city: 'city',
                image: 'http://img',
                status: 'available'
            }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return 400 if required field is missing', async () => {
        req.body.name = '';
        await updatePet(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('El campo') });
    });

    it('should return 400 if birthDate is in the future', async () => {
        req.body.birthDate = '2999-01-01';
        await updatePet(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'La fecha de nacimiento no puede ser futura.' });
    });

    it('should upload image if not a URL and update pet', async () => {
        req.body.image = 'base64img';
        cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'http://cloudinary.com/img' });
        Pet.findByIdAndUpdate.mockResolvedValue({ name: 'Max' });
        await updatePet(req, res);
        expect(cloudinary.uploader.upload).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ name: 'Max' });
    });

    it('should update pet with image URL', async () => {
        Pet.findByIdAndUpdate.mockResolvedValue({ name: 'Max' });
        await updatePet(req, res);
        expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ name: 'Max' });
    });

    it('should return 404 if pet not found', async () => {
        Pet.findByIdAndUpdate.mockResolvedValue(null);
        await updatePet(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mascota no encontrada' });
    });

    it('should handle errors and return 500', async () => {
        Pet.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
        await updatePet(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al actualizar la mascota'
        }));
    });
});

describe('Pet Controller - deletePet', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { id: 'petId' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should delete pet and return success message', async () => {
        Pet.findByIdAndDelete.mockResolvedValue({ name: 'Max' });

        await deletePet(req, res);

        expect(Pet.findByIdAndDelete).toHaveBeenCalledWith('petId');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mascota eliminada exitosamente' });
    });

    it('should return 404 if pet not found', async () => {
        Pet.findByIdAndDelete.mockResolvedValue(null);

        await deletePet(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mascota no encontrada' });
    });

    it('should handle errors and return 500', async () => {
        Pet.findByIdAndDelete.mockRejectedValue(new Error('fail'));

        await deletePet(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al eliminar la mascota'
        }));
    });
});

describe('Pet Controller - getAdoptablePets', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return adoptable pets', async () => {
        const pets = [{ name: 'Max' }, { name: 'Luna' }];
        // Mock chain: find().sort().limit()
        const limitMock = jest.fn().mockResolvedValue(pets);
        const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
        Pet.find.mockReturnValue({ sort: sortMock });

        await getAdoptablePets(req, res);

        expect(Pet.find).toHaveBeenCalledWith({ status: 'available' });
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(limitMock).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pets);
    });

    it('should handle errors and return 500', async () => {
        // Simula que Pet.find lanza un error al llamar a sort()
        Pet.find.mockImplementation(() => { throw new Error('fail'); });

        await getAdoptablePets(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener mascotas en adopción'
        }));
    });
});

describe('Pet Controller - getLostPets', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return lost pets', async () => {
        const pets = [{ name: 'Max' }, { name: 'Luna' }];
        // Mock chain: find().sort().limit()
        const limitMock = jest.fn().mockResolvedValue(pets);
        const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
        Pet.find.mockReturnValue({ sort: sortMock });

        await getLostPets(req, res);

        expect(Pet.find).toHaveBeenCalledWith({ status: 'lost' });
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(limitMock).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pets);
    });

    it('should handle errors and return 500', async () => {
        Pet.find.mockImplementation(() => { throw new Error('fail'); });

        await getLostPets(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener mascotas perdidas'
        }));
    });
});

describe('Pet Controller - getFoundPets', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return found pets', async () => {
        const pets = [{ name: 'Max' }, { name: 'Luna' }];
        // Mock chain: find().sort().limit()
        const limitMock = jest.fn().mockResolvedValue(pets);
        const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
        Pet.find.mockReturnValue({ sort: sortMock });

        await getFoundPets(req, res);

        expect(Pet.find).toHaveBeenCalledWith({ status: 'found' });
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(limitMock).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pets);
    });

    it('should handle errors and return 500', async () => {
        Pet.find.mockImplementation(() => { throw new Error('fail'); });

        await getFoundPets(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener mascotas encontradas'
        }));
    });
});

describe('Pet Controller - getMyPets', () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: 'userId' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return pets for the authenticated user', async () => {
        const pets = [{ name: 'Max' }, { name: 'Luna' }];
        Pet.find.mockResolvedValue(pets);

        await getMyPets(req, res);

        expect(Pet.find).toHaveBeenCalledWith({ owner: 'userId' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(pets);
    });

    it('should handle errors and return 500', async () => {
        Pet.find.mockRejectedValue(new Error('fail'));

        await getMyPets(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener tus mascotas'
        }));
    });
});

describe('Pet Controller - markPetAsFound', () => {
    let req, res, mockPet;

    beforeEach(() => {
        req = {
            params: { id: 'petId' },
            user: { id: 'userId' },
            body: {
                foundAt: '2024-06-01T12:00:00Z',
                foundLocationLat: 40.4168,
                foundLocationLng: -3.7038
            }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockPet = {
            owner: { toString: () => 'userId' },
            save: jest.fn().mockResolvedValue(),
        };
        jest.clearAllMocks();
    });

    it('should return 404 if pet not found', async () => {
        Pet.findById.mockResolvedValue(null);

        await markPetAsFound(req, res);

        expect(Pet.findById).toHaveBeenCalledWith('petId');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mascota no encontrada' });
    });

    it('should return 403 if user is not the owner', async () => {
        Pet.findById.mockResolvedValue({ owner: { toString: () => 'otherUser' } });

        await markPetAsFound(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'No tienes permiso para modificar esta mascota' });
    });

    it('should mark pet as found and return pet', async () => {
        Pet.findById.mockResolvedValue(mockPet);

        await markPetAsFound(req, res);

        expect(mockPet.save).toHaveBeenCalled();
        expect(mockPet.foundAt).toBe(req.body.foundAt);
        expect(mockPet.foundLocationLat).toBe(req.body.foundLocationLat);
        expect(mockPet.foundLocationLng).toBe(req.body.foundLocationLng);
        expect(mockPet.status).toBe('found');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockPet);
    });

    it('should handle errors and return 500', async () => {
        Pet.findById.mockRejectedValue(new Error('fail'));

        await markPetAsFound(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al marcar la mascota como encontrada'
        }));
    });
});
