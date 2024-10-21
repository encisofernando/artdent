// models/TipoDoc.js
const db = require('../config/db');

// Modelo para Categorías
const TipoDoc = {
    
    getAll: (callback) => {
        db.query('SELECT idTipoDoc, Nombre, Activo FROM TipoDoc', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },


    

}



module.exports = TipoDoc;
