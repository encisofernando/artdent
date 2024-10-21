const Categoria = require('../models/Categoria');

// Controlador para obtener todas las categorías
const getAllCategorias = (req, res) => {
    Categoria.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener categorías' });
        }
        res.status(200).json(results);
    });
};

// Controlador para obtener una categoría por ID
const getCategoriaById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de categoría es requerido' });
    }

    Categoria.getById(id, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear una categoría
const createCategoria = (req, res) => {
    const newCategoria = req.body;

    // Validación de datos
    if (!newCategoria.Nombre || typeof newCategoria.Activo !== 'boolean') {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Categoria.create(newCategoria, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al crear categoría' });
        }
        res.status(201).json(result);
    });
};

// Controlador para actualizar una categoría
const updateCategoria = (req, res) => {
    const id = req.params.id;
    const updatedCategoria = req.body;

    console.log('ID recibido:', id);
    console.log('Datos a actualizar:', updatedCategoria);

    if (!id) {
        return res.status(400).json({ error: 'ID de categoría es requerido' });
    }

    // Validación de datos
    if (!updatedCategoria.Nombre || typeof updatedCategoria.Activo !== 'boolean') {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Categoria.update(id, updatedCategoria, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar categoría' });
        }
        res.status(200).json(result);
    });
};

// Controlador para eliminar una categoría
const deleteCategoria = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de categoría es requerido' });
    }

    Categoria.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar categoría' });
        }
        // Mensaje de éxito opcional
        res.status(200).json({ message: 'Categoría eliminada con éxito', result });
    });
};

module.exports = {
    getAllCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria
};
