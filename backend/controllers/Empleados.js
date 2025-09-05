const Empleado = require('../models/Empleados'); 
const Email = require('./Email')
const {  crearToken, JWT_SECRET } = require('../config/jwt'); // Asegúrate de importar la configuración
const jwt = require('jsonwebtoken'); // Importa el paquete de jwt para verificar el token
const bcrypt = require('bcrypt'); // Para cifrar la nueva contraseña


// Obtener todos los empleados
const getAllEmpleados = (req, res) => {
    const idBase = req.idBase; // Obtén idBase del token

    Empleado.getAll(idBase, (err, empleados) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los empleados' });
        }
        res.status(200).json(empleados);
    });
};

// Obtener un empleado por ID
const getEmpleadoById = (req, res) => {
    const idBase = req.idBase; // Obtener idBase del token

    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de empleado es requerido' });
    }

    Empleado.getById(id, idBase, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.status(200).json(result);
    });
};

// Crear un empleado
const createEmpleado = (req, res) => {
    console.log('Inicio de la creación de empleado');

    console.log('idBase desde el request:', req.idBase);
    console.log("Archivo recibido:", req.file);

    const newEmpleado = { 
        ...req.body, 
        idBase: req.idBase,
        idRol: parseInt(req.body.idRol, 10)
    };

    console.log("Datos a crear:", newEmpleado);
    console.log("Valor de req.body.Rol:", req.body.Rol);
    console.log("Valor de req.body.idRol:", req.body.idRol);

    if (req.file) {
        newEmpleado.Imagen = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    let permisos;
    if (Array.isArray(newEmpleado.permissions)) {
        permisos = newEmpleado.permissions;
    } else if (typeof newEmpleado.permissions === 'string') {
        try {
            permisos = JSON.parse(newEmpleado.permissions);
        } catch (error) {
            console.error('Error al parsear permisos:', error);
            return res.status(400).json({ error: 'Permisos no válidos.' });
        }
    } else {
        console.error('Permisos no válidos:', newEmpleado.permissions);
        return res.status(400).json({ error: 'Permisos no válidos.' });
    }

    // Llama a la función de creación de empleado
    Empleado.create(newEmpleado, (error, empleadoCreado) => {
        if (error) {
            console.error('Error al crear empleado:', error);
            return res.status(500).json({ error: 'Error al crear empleado' });
        }

        console.log('Empleado creado exitosamente:', empleadoCreado);

        const payload = { 
            idEmpleado: empleadoCreado.idEmpleado, 
            Email1: empleadoCreado.Email1,
            idBase: newEmpleado.idBase, 
            idRol: newEmpleado.idRol 
        };

        // Generar un token para el nuevo empleado
        const token = crearToken(payload);
        const link = `http://localhost:5000/crearcontrasena?token=${token}`;

        // Enviar el correo al nuevo empleado
        Email.enviarEmailCreacionContraseña(empleadoCreado.Email1, link)
            .then(() => {
                // Responder con el empleado creado solo después de enviar el correo
                return res.status(200).json(empleadoCreado);
            })
            .catch((error) => {
                console.error('Error al enviar correo:', error);
                return res.status(500).json({ error: 'Error al enviar correo' });
            });
    });
};





// Actualizar un empleado
const updateEmpleado = (req, res) => {
    const id = req.params.id;
    const updatedEmpleado = req.body;
    const idBase = req.idBase;

    console.log("ID:", id);
    console.log("ID Base:", idBase);
    console.log("Datos a actualizar:", updatedEmpleado);
    
    if (!id) {
        return res.status(400).json({ error: 'ID de empleado es requerido' });
    }

    Empleado.update(id, idBase, updatedEmpleado, (err, result) => {
        if (err) {
            console.error("Error al actualizar empleado:", err);
            return res.status(500).json({ error: 'Error al actualizar empleado' });
        }
        res.status(200).json(result);
    });
};


// Eliminar un empleado
const deleteEmpleado = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de empleado es requerido' });
    }

    Empleado.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar empleado' });
        }
        res.status(200).json(result);
    });
};

const toggleEmpleado = (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: 'ID de empleado es requerido' });
    }

    Empleado.toggle(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cambiar el estado del empleado' });
        }
        res.status(200).json(result);
    });
};

// Crear contraseña
const crearContraseña = async (req, res) => {
    console.log("Iniciando creación de contraseña..."); // Log para inicio de la función
    const { token, nuevaContraseña } = req.body;

    if (!token || !nuevaContraseña) {
        console.log("Error: Token o nueva contraseña no proporcionados."); // Log de error
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    try {
        console.log("Verificando el token..."); // Log para verificar el token
        const decoded = jwt.verify(token, JWT_SECRET); // Asegúrate de que 'JWT_SECRET' sea tu clave real
        console.log("Token verificado:", decoded); // Log del token verificado

        // Hashear la nueva contraseña
        console.log("Hasheando la nueva contraseña..."); // Log para inicio de hash
        const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
        console.log("Contraseña hasheada:", hashedPassword); // Log de contraseña hasheada

        Empleado.updatePassword(decoded.idEmpleado, hashedPassword, (err, result) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err); // Log de error específico
                return res.status(500).json({ message: 'Error interno del servidor' });
            }
            console.log("Contraseña actualizada exitosamente para el empleado:", decoded.idEmpleado); // Log de éxito
            return res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
        });

    } catch (error) {
        console.error('Error al crear contraseña:', error); // Log de error general
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};


module.exports = {
    getAllEmpleados,
    getEmpleadoById,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    toggleEmpleado,
    crearContraseña
};
