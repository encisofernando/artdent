const Iva = require('../models/Iva');

// Controlador para obtener todos los registros de IVA
const getAllIva = (req, res) => {
    Iva.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener IVAs' });
        }
        res.status(200).json(results);
    });
};

// Controlador para obtener un IVA por ID
const getIvaById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de IVA es requerido' });
    }

    Iva.getById(id, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'IVA no encontrado' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear un nuevo registro de IVA
const createIva = (req, res) => {
    const newIva = req.body;

    // Validación de datos
    if (!newIva.Porcentaje || typeof newIva.Porcentaje !== 'number' || !newIva.Nombre) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Iva.create(newIva, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al crear IVA' });
        }
        res.status(201).json(result);
    });
};

// Controlador para actualizar un registro de IVA
const updateIva = (req, res) => {
    const id = req.params.id;
    const updatedIva = req.body;

    console.log('ID recibido:', id);
    console.log('Datos a actualizar:', updatedIva);

    if (!id) {
        return res.status(400).json({ error: 'ID de IVA es requerido' });
    }

    // Validación de datos
    if (!updatedIva.Porcentaje || typeof updatedIva.Porcentaje !== 'number' || !updatedIva.Nombre) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Iva.update(id, updatedIva, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar IVA' });
        }
        res.status(200).json(result);
    });
};

// Controlador para eliminar un registro de IVA
const deleteIva = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de IVA es requerido' });
    }

    Iva.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar IVA' });
        }
        res.status(200).json({ message: 'IVA eliminado con éxito', result });
    });
};

module.exports = {
    getAllIva,
    getIvaById,
    createIva,
    updateIva,
    deleteIva
};
