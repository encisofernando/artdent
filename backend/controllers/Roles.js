const Roles = require('../models/Roles');

const getAllRoles = (req, res) => {
    Roles.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los roles' });
        }
        res.status(200).json(results);
    });
};

module.exports = {
    getAllRoles
};
