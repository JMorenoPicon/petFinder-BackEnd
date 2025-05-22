import Pet from '../models/Pet.js';

// Crear una nueva mascota
export const createPet = async (req, res) => {
    try {
        const { name, species, breed, birthDate, description, image } = req.body;
        const owner = req.user.id; // Cambia _id por id
        const newPet = new Pet({ name, species, breed, birthDate, description, image, owner });
        await newPet.save();
        res.status(201).json(newPet);
    } catch (error) {
        res.status(500).json({ message: `Error al crear la mascota: ${error}`, error });
    }
};

// Obtener todas las mascotas
export const getPets = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las mascotas', error });
    }
};

// Obtener una mascota por ID
export const getPetById = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });
        res.status(200).json(pet);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la mascota', error });
    }
};

// Actualizar una mascota
export const updatePet = async (req, res) => {
    try {
        const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPet) return res.status(404).json({ message: 'Mascota no encontrada' });
        res.status(200).json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la mascota', error });
    }
};

// Eliminar una mascota
export const deletePet = async (req, res) => {
    try {
        const deletedPet = await Pet.findByIdAndDelete(req.params.id);
        if (!deletedPet) return res.status(404).json({ message: 'Mascota no encontrada' });
        res.status(200).json({ message: 'Mascota eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la mascota', error });
    }
};

/**
 * GET /api/v1/pets/adoptable
 * Devuelve las mascotas disponibles para adopción.
 */
export const getAdoptablePets = async (req, res) => {
    try {
        const pets = await Pet.find({ status: 'available' }).sort({ createdAt: -1 }).limit(12);
        res.status(200).json(pets);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener mascotas en adopción', error: err });
    }
};

/**
 * GET /api/v1/pets/lost
 * Devuelve los avisos de mascotas perdidas.
 */
export const getLostPets = async (req, res) => {
    try {
        const pets = await Pet.find({ status: 'lost' }).sort({ createdAt: -1 }).limit(12);
        res.status(200).json(pets);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener mascotas perdidas', error: err });
    }
};
