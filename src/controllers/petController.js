import Pet from '../models/Pet.js';
import cloudinary from '../helpers/cloudinary.js';

// Crear una nueva mascota
export const createPet = async (req, res) => {
    try {
        const { name, species, breed, birthDate, description, image } = req.body;
        const owner = req.user.id; // Cambia _id por id

        // Subir imagen a Cloudinary si es una URL local/base64
        let imageUrl = image;
        if (image && !image.startsWith('http')) {
            const uploadResult = await cloudinary.uploader.upload(image, {
                folder: 'pets',
                public_id: `${name}_${Date.now()}`
            });
            imageUrl = uploadResult.secure_url;
        }
        const newPet = new Pet({ name, species, breed, birthDate, description, image:imageUrl, owner });
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
        let updateData = { ...req.body };

        // Si se envía una nueva imagen y no es URL, subir a Cloudinary
        if (updateData.image && !updateData.image.startsWith('http')) {
            const uploadResult = await cloudinary.uploader.upload(updateData.image, {
                folder: 'pets',
                public_id: `${updateData.name || 'pet'}_${Date.now()}`
            });
            updateData.image = uploadResult.secure_url;
        }

        const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, { new: true });
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

/**
 * Obtiene todas las mascotas asociadas al usuario autenticado.
 *
 * @async
 * @function getMyPets
 * @param {import('express').Request} req - Objeto de solicitud de Express, debe contener el usuario autenticado en `req.user`.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Retorna una respuesta JSON con las mascotas del usuario o un mensaje de error.
 */
export const getMyPets = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user.id });
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tus mascotas', error });
    }
};
