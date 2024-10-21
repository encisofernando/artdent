const TipoDoc = require('../models/TipoDoc');


// Controlador para obtener todas las categorías
const getAllTipoDoc = (req, res) => {
    TipoDoc.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener categorías' });
        }
        res.status(200).json(results);
    });
};



module.exports = {
    getAllTipoDoc,
};
