const PromocionCantidad = require('../models/Promocion');

// Controlador para obtener todas las promociones
const getAllPromociones = (req, res) => {
    PromocionCantidad.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener promociones' });
        }
        res.status(200).json(results);
    });
};

// Controlador para obtener una promoción por ID
const getPromocionById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de promoción es requerido' });
    }

    PromocionCantidad.getById(id, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear una promoción
const createPromocion = (req, res) => {
    const newPromocionCantidad = req.body;

    // Validación de datos
    if (!newPromocionCantidad.Nombre) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    PromocionCantidad.create(newPromocionCantidad, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al crear promoción' });
        }
        res.status(201).json(result);
    });
};

// Controlador para actualizar una promoción
const updatePromocion = (req, res) => {
    const id = req.params.id;
    const updatedPromocionCantidad = req.body;

    console.log('ID recibido:', id);
    console.log('Datos a actualizar:', updatedPromocionCantidad);

    if (!id) {
        return res.status(400).json({ error: 'ID de promoción es requerido' });
    }

    // Validación de datos
    if (!updatedPromocionCantidad.Nombre) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    PromocionCantidad.update(id, updatedPromocionCantidad, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar promoción' });
        }
        res.status(200).json(result);
    });
};

// Controlador para eliminar una promoción
const deletePromocion = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de promoción es requerido' });
    }

    PromocionCantidad.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar promoción' });
        }
        // Mensaje de éxito opcional
        res.status(200).json({ message: 'Promoción eliminada con éxito', result });
    });
};

module.exports = {
    getAllPromociones,
    getPromocionById,
    createPromocion,
    updatePromocion,
    deletePromocion
};
