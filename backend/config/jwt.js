// jwt.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./clavejwt');

const crearToken = (usuario) => {
    const payload = {
        idUsuario: usuario.idUsuario || null, // Asegúrate de que estás pasando el id del usuario
        idEmpleado: usuario.idEmpleado || null, // Asegúrate de que estás pasando el id del empleado
        idBase: usuario.idBase,  // Asegúrate de que estás pasando el idBase
        idRol: usuario.idRol  
    };

    console.log("Payload: ", payload)
    console.log('Usuario en crearToken:', usuario);


    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
};

module.exports = { crearToken, JWT_SECRET };
