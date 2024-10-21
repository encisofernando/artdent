const Provincias = require('../models/Provincias');

// Controlador para obtener todas las categorías
const getAllProvincias = (req, res) => {
    Provincias.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener categorías' });
        }
        res.status(200).json(results);
    });
};

// Controlador para obtener una categoría por ID



module.exports = {
    getAllProvincias,
 
};
