// models/CondIVA.js
const db = require('../config/db');



const CondIVA = {


    getAll: (callback) => {
        db.query('SELECT idCondIVA, Nombre, Activo FROM CondIVA', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },




}

module.exports = CondIVA;
