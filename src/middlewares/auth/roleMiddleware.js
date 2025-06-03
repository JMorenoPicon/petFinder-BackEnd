import Pet from '../../models/Pet.js';

export function adminRole(req, res, next) {
    // Verificamos si el usuario tiene el rol 'admin'
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Acceso restringido. Requiere privilegios de administrador.' });
    }
    next(); // Si tiene el rol 'admin', continuamos con la ejecución de la ruta
}

export function userRole(req, res, next) {
    // Verificamos si el usuario tiene el rol 'user' o 'admin'
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Acceso restringido.' });
    }
    next(); // Si tiene el rol 'user' o 'admin', continuamos con la ejecución de la ruta
}

export async function ownerUser(req, res, next) {
    // Verificamos si el usuario tiene el rol 'user' o 'admin'
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Acceso restringido.' });
    }
    // Si es admin, puede continuar sin comprobar propiedad
    if (req.user.role === 'admin') {
        return next();
    }
    // Verificamos si el usuario es el propietario de la mascota
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).send({ message: 'Mascota no encontrada.' });
        }
        if (pet.owner.toString() !== req.user.id) {
            return res.status(403).send({ message: 'No tienes permiso para modificar esta mascota.' });
        }
        next();
    } catch (error) {
        res.status(500).send({ message: `Error verificando propiedad de la mascota: ${error}` });
    }
}
