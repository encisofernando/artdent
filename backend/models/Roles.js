const db = require('../config/db');

const Roles = {
    getAll: (callback) => {
        db.query('SELECT idRol, Nombre FROM Roles', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
}

module.exports = Roles;
