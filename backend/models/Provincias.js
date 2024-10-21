// models/TipoDoc.js
const db = require('../config/db');

// Modelo para Categorías
const Provincias = {
    
    getAll: (callback) => {
        db.query('SELECT idProvincia, Nombre FROM Provincias', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },


}

module.exports = Provincias;
