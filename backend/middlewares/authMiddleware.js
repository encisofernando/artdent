// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');


const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.log('Token no proporcionado');
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token inválido', err);
            return res.status(401).json({ message: 'Token inválido' });
        }
        console.log('Decoded token:', decoded); // Depuración para ver el contenido del token

        req.idUsuario = decoded.idUsuario; 
        req.idEmpleado = decoded.idEmpleado; // Asegúrate de agregar el idEmpleado también
        req.idBase = decoded.idBase; 
        req.idRol = decoded.idRol; 

        console.log('idUsuario en authMiddleware:', req.idUsuario); // Verificar si el idBase está presente
        console.log('idBase en authMiddleware:', req.idBase); // Verificar si el idBase está presente
        console.log('idRol en authMiddleware:', req.idRol); // Verificar si el idBase está presente

        next();
    });
};

module.exports = authMiddleware;
