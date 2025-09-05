// models/LinkUsuariosTareas.js
const db = require('../config/db');

const LinkUsuariosTareas = {
    getPermissionsByUserId: (userId, callback) => {
        db.query(
            'SELECT Tareas.Nombre, LinkUsuariosTareas.PermisoActivo FROM LinkUsuariosTareas JOIN Tareas ON LinkUsuariosTareas.idTarea = Tareas.idTarea WHERE LinkUsuariosTareas.idEmpleado = ?',
            [userId],
            (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            }
        );
    },
};

module.exports = LinkUsuariosTareas;
