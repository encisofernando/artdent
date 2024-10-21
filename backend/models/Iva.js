const db = require('../config/db');

// Modelo para Iva
const Iva = {

    // Obtener todos los registros de IVA
    getAll: (callback) => {
        db.query('SELECT idIva AS id, Porcentaje, Activo, idAfipFE, Nombre FROM Iva', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    // Obtener un registro de IVA por su ID
    getById: (id, callback) => {
        db.query('SELECT idIva AS id, Porcentaje, Activo, idAfipFE, Nombre FROM Iva WHERE idIva = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('IVA no encontrado'));
            }
            callback(null, result[0]); // Devuelve solo el registro encontrado
        });
    },

    // Crear un nuevo registro de IVA
    create: (newIva, callback) => {
        const { Porcentaje, Activo, idAfipFE, Nombre } = newIva;
        db.query(
            'INSERT INTO Iva (Porcentaje, Activo, idAfipFE, Nombre) VALUES (?, ?, ?, ?)',
            [Porcentaje, Activo, idAfipFE, Nombre],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id: result.insertId, ...newIva });
            }
        );
    },

    // Actualizar un registro de IVA
    update: (id, updatedIva, callback) => {
        const { Porcentaje, Activo, idAfipFE, Nombre } = updatedIva;
        db.query(
            'UPDATE Iva SET Porcentaje = ?, Activo = ?, idAfipFE = ?, Nombre = ? WHERE idIva = ?',
            [Porcentaje, Activo, idAfipFE, Nombre, id],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id, ...updatedIva });
            }
        );
    },

    // Eliminar un registro de IVA
    delete: (id, callback) => {
        db.query('DELETE FROM Iva WHERE idIva = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'IVA eliminado', id });
        });
    }
};

module.exports = Iva;
