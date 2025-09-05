const Tareas = require('../models/Tareas');


const getAllTareas = (req, res) => {
    Tareas.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las tareas' });
        }
        res.status(200).json(results);
    });
};

module.exports = {
    getAllTareas
};
