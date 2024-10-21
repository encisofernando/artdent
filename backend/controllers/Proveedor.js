const Proveedor = require('../models/Proveedor'); // Asegúrate de que la ruta sea correcta

// Controlador para obtener todos los proveedores
const getAllProveedores = (req, res) => {
    Proveedor.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener proveedores' });
        }
        res.status(200).json(results);
    });
};

// Controlador para obtener un proveedor por ID
const getProveedorById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de proveedor es requerido' });
    }

    Proveedor.getById(id, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear un nuevo proveedor
const createProveedor = (req, res) => {
    const newProveedor = req.body;

    // Validación de datos
    if (!newProveedor.RazonSocial) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Proveedor.create(newProveedor, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al crear proveedor' });
        }
        res.status(201).json(result);
    });
};

// Controlador para actualizar un proveedor
const updateProveedor = (req, res) => {
    const id = req.params.id;
    const updatedProveedor = req.body;

    console.log('ID recibido:', id);
    console.log('Datos a actualizar:', updatedProveedor);

    if (!id) {
        return res.status(400).json({ error: 'ID de proveedor es requerido' });
    }

    // Validación de datos
    if (!updatedProveedor.RazonSocial) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Proveedor.update(id, updatedProveedor, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar proveedor' });
        }
        res.status(200).json(result);
    });
};

// Controlador para eliminar un proveedor
const deleteProveedor = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de proveedor es requerido' });
    }

    Proveedor.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar proveedor' });
        }
        // Mensaje de éxito opcional
        res.status(200).json({ message: 'Proveedor eliminado con éxito', result });
    });
};

module.exports = {
    getAllProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor
};
