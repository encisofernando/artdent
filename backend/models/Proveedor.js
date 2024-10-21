const db = require('../config/db');

// Modelo para Proveedores
const Proveedor = {
    
    getAll: (callback) => {
        db.query('SELECT idProveedor, RazonSocial FROM Proveedores', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        db.query('SELECT idProveedor, RazonSocial FROM Proveedores WHERE idProveedor = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Proveedor no encontrado'));
            }
            callback(null, result[0]); // Devuelve solo un proveedor
        });
    },
    
    create: (newProveedor, callback) => {
        const { RazonSocial } = newProveedor;
        db.query(
            'INSERT INTO Proveedores (RazonSocial) VALUES (?)',
            [RazonSocial],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id: result.insertId, ...newProveedor });
            }
        );
    },
    
    update: (id, updatedProveedor, callback) => {
        const { RazonSocial } = updatedProveedor;
        db.query(
            'UPDATE Proveedores SET RazonSocial = ? WHERE idProveedor = ?',
            [RazonSocial, id],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id, ...updatedProveedor });
            }
        );
    },

    delete: (id, callback) => {
        db.query('DELETE FROM Proveedores WHERE idProveedor = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'Proveedor eliminado', id });
        });
    }
};

module.exports = Proveedor;
