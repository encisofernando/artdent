
const CondIVA = require('../models/CondicionIVA');



const getAllCondIVA = (req, res) => {
    CondIVA.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener categorías' });
        }
        res.status(200).json(results);
    });
};
// Controlador para obtener una categoría por ID



module.exports = {
  
    getAllCondIVA
};
