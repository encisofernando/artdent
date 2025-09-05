// models/CondIVA.js
const db = require('../config/db');


const Tareas = {

    getAll: (callback) => {
        db.query('SELECT * FROM Tareas', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

}

module.exports = Tareas;
