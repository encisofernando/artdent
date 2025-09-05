
    const Rubros = require('../models/Rubros');



    const getAllRubros = (req, res) => {
        Rubros.getAll((err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener rubros' });
            }
            res.status(200).json(results);
        });
    };
    // Controlador para obtener una categoría por ID



    module.exports = {
    
        getAllRubros
    };
