// models/Categoria.js
const db = require('../config/db');

// Modelo para Categorías
const Categoria = {
    
    getAll: (callback) => {
        db.query('SELECT idCategoria, Nombre, Activo FROM Categorias', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        db.query('SELECT idCategoria AS id, Nombre, Activo FROM Categorias WHERE idCategoria = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Categoría no encontrada'));
            }
            callback(null, result[0]); // Devuelve solo una categoría
        });
    },
    
    create: (newCategoria, callback) => {
        const { Nombre, Activo } = newCategoria;
        db.query(
            'INSERT INTO Categorias (Nombre, Activo) VALUES (?, ?)',
            [Nombre, Activo],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id: result.insertId, ...newCategoria });
            }
        );
    },
    
    update: (id, updatedCategoria, callback) => {
        const { Nombre, Activo } = updatedCategoria;
        db.query(
            'UPDATE Categorias SET Nombre = ?, Activo = ? WHERE idCategoria = ?',
            [Nombre, Activo, id],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id, ...updatedCategoria });
            }
        );
    },

    delete: (id, callback) => {
        db.query('DELETE FROM Categorias WHERE idCategoria = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'Categoría eliminada', id });
        });
    }
};

module.exports = Categoria;
