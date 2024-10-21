const db = require('../config/db');

// Modelo para Promociones por Cantidad
const Promocion = {
    
    getAll: (callback) => {
        db.query('SELECT idPromocionCantidad, Nombre FROM PromocionCantidad', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        db.query('SELECT idPromocionCantidad AS id, Nombre FROM PromocionCantidad WHERE idPromocionCantidad = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Promoción por cantidad no encontrada'));
            }
            callback(null, result[0]); // Devuelve solo una promoción
        });
    },
    
    create: (newPromocionCantidad, callback) => {
        const { Nombre } = newPromocionCantidad;
        db.query(
            'INSERT INTO PromocionCantidad (Nombre) VALUES (?)',
            [Nombre],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id: result.insertId, ...newPromocionCantidad });
            }
        );
    },
    
    update: (id, updatedPromocionCantidad, callback) => {
        const { Nombre } = updatedPromocionCantidad;
        db.query(
            'UPDATE PromocionCantidad SET Nombre = ? WHERE idPromocionCantidad = ?',
            [Nombre, id],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id, ...updatedPromocionCantidad });
            }
        );
    },

    delete: (id, callback) => {
        db.query('DELETE FROM PromocionCantidad WHERE idPromocionCantidad = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'Promoción eliminada', id });
        });
    }
};

module.exports = Promocion;
