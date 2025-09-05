const db = require('../config/db');

// Modelo para Clientes
const Cliente = {
    getAll: (callback) => {
        db.query('SELECT * FROM Clientes', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (idCliente, callback) => {
        db.query('SELECT * FROM Clientes WHERE idCliente = ?', [idCliente], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Cliente no encontrado'));
            }
            callback(null, result[0]); // Devuelve solo un cliente
        });
    },

    create: (newCliente, callback) => {
        const { 
            Nombre, 
            Apellido,
            NroDoc,
            TpDoc, // ID del tipo de documento
            CUIT,
            Tel1,
            Email1,
            Celular,
            Direccion,
            CodPostal,
            Barrio,
            Localidad,
            CondIVA,
            idProvincia, // ID de la provincia
            Provincia,
            ActividadComercial,
            Profesion,
            FechaNac,
            FechaInicioAct,
            Activo,
            CC,
            CC_Bloq,
            Comentarios
        } = newCliente;

        // Inserción en Clientes
        db.query(
            `INSERT INTO Clientes 
              (Nom1, Nom2, NroDoc, TpDoc, CUIT, Tel1, Email1, Celular, Direccion, CodPostal, Barrio, Localidad, CondIVA, idProvincia, Provincia, ActividadComercial, Profesion, FechaNac, FechaInicioAct, Activo, CC, CC_Bloq, Comentarios) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Nombre, Apellido, NroDoc, TpDoc, CUIT, Tel1, Email1, Celular, Direccion , CodPostal, Barrio, Localidad, CondIVA, idProvincia, Provincia, ActividadComercial, Profesion, FechaNac, FechaInicioAct, Activo, CC, CC_Bloq, Comentarios],
            (err, result) => {
                if (err) {
                    console.error('Error al insertar en la base de datos:', err);
                    return callback(err);
                }
                callback(null, { idCliente: result.insertId, ...newCliente });
            }
        );
    },

    update: (id, updatedCliente, callback) => {
        const { 
            Nom1, 
            Nom2,
            NroDoc,
            TpDoc,
            CUIT,
            Tel1, 
            Email1, 
            Celular,
            Direccion,
            CodPostal,
            Barrio,
            Localidad,
            CondIVA,
            idProvincia,
            Provincia,
            ActividadComercial,
            Profesion,
            FechaNac,
            FechaInicioAct,
            Activo,
            CC,
            CC_Bloq,
            Comentarios
        } = updatedCliente;

        db.query(
            `UPDATE Clientes SET 
                Nom1 = ?, 
                Nom2 = ?, 
                NroDoc = ?, 
                TpDoc = ?, 
                CUIT = ?, 
                Tel1 = ?, 
                Email1 = ?,
                Celular = ?,
                Direccion =?,
                CodPostal = ?, 
                Barrio = ?, 
                Localidad = ?, 
                CondIVA = ?,
                idProvincia = ?, 
                Provincia = ?,
                ActividadComercial = ?, 
                Profesion = ?, 
                FechaNac = ?, 
                FechaInicioAct = ?,
                Activo = ?,
                CC = ?,
                CC_Bloq = ?,
                Comentarios = ?
            WHERE idCliente = ?`,
            [Nom1, Nom2, NroDoc, TpDoc, CUIT, Tel1, Email1, Celular, Direccion, CodPostal, Barrio, Localidad, CondIVA, idProvincia, Provincia, ActividadComercial, Profesion, FechaNac,  FechaInicioAct, Activo, CC, CC_Bloq, Comentarios, id],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id, ...updatedCliente });
            }
        );
    },

    delete: (id, callback) => {
        db.query('DELETE FROM Clientes WHERE idCliente = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'Cliente eliminado', id });
        });
    }
};

module.exports = Cliente;
