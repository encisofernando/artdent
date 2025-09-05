// controllers/linkUsuariosTareasController.js
const LinkUsuariosTareas = require('../models/LinkUsuariosTareas');

const getUserPermissions = (req, res) => {
    const userId = req.params.userId; // Supongamos que el ID del usuario se pasa como un parámetro de URL

    LinkUsuariosTareas.getPermissionsByUserId(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener permisos' });
        }
        res.status(200).json(results);
    });
};

module.exports = {
    getUserPermissions,
};
