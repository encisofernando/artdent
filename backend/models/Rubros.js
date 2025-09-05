// models/CondIVA.js
const db = require('../config/db');



const Rubros = {


    getAll: (callback) => {
        db.query('SELECT idRubro, Nombre FROM Rubros', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },




}

module.exports = Rubros;
