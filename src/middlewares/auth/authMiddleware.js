import jwt from 'jsonwebtoken';
import config from '../../config.js';  // Para obtener la clave secreta JWT

export function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Obtener el token del header

    if (!token) {
        return res.status(401).send({ message: 'No se proporcionó token' }); // Si no hay token, devolver error
    }

    try {
        const decoded = jwt.verify(token, config.security.JWT_SECRET); // Verificar el token
        req.user = decoded; // Decodificar el token y agregar el usuario al request
        next(); // Pasar al siguiente middleware o ruta
    } catch (error) {
        res.status(401).send({ message: `Token inválido o expirado, error: ${error}` }); // Si el token no es válido, devolver error
    }
}
