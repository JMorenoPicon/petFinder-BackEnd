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
