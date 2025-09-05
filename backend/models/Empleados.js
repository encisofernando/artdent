const db = require('../config/db');
const bcrypt = require('bcrypt');


// Modelo para Empleados
const Empleado = {
    getAll: (idBase, callback) => {
        db.query('SELECT * FROM Empleados WHERE idBase = ?', [idBase], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (idEmpleado, idBase, callback) => {
        db.query('SELECT * FROM Empleados WHERE idEmpleado = ? AND idBase = ?', [idEmpleado, idBase], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Empleado no encontrado'));
            }
            callback(null, result[0]);
        });
    },

    create: async (newEmpleado, callback) => {
        const { 
            Nombre, 
            Apellido,
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
            Profesion,
            Imagen,
            FechaNac,
            Activo,
            Comentarios,
            FechaIncAct,
            FechaBaja,
            Rol,
            Perfil,
            idRol,
            idBase,
            permissions // Se asume que permissions está en newEmpleado
        } = newEmpleado;
    
            db.query(
                `SELECT idEmpresa, NomComercial FROM Empresa WHERE idBase = ?`,
                [idBase],
                (err, results) => {
                    if (err) {
                        console.error('Error al obtener el idEmpresa y NomComercial:', err);
                        return callback(err);
                    }
    
                if (results.length === 0) {
                    return callback(new Error('No se encontró empresa para el idBase proporcionado.'));
                }
    
                const { idEmpresa, NomComercial } = results[0];
    
                db.query(
                    `INSERT INTO Empleados 
                      (Nombre, Apellido, NroDoc, TpDoc, CUIT, Tel1, Email1, Celular, Direccion, CodPostal, Barrio, Localidad, CondIVA, idProvincia, Provincia, Profesion, Imagen, FechaNac, Activo, Comentarios, FechaIncAct, FechaBaja, Rol, Perfil, idRol, idBase, idEmpresa, NomComercial) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [Nombre, Apellido, NroDoc, TpDoc, CUIT, Tel1, Email1, Celular, Direccion, CodPostal, Barrio, Localidad, CondIVA, idProvincia, Provincia, Profesion, Imagen, FechaNac, Activo, Comentarios, FechaIncAct, FechaBaja, Rol, Perfil, idRol, idBase, idEmpresa, NomComercial],
                    (err, result) => {
                        if (err) {
                            console.error('Error al insertar en la base de datos:', err);
                            return callback(err);
                        }
    
                        const idEmpleado = result.insertId;
                        console.log("Empleado insertado con ID:", result.insertId);
                        // Verifica si permissions está definido y es una cadena JSON
                        if (permissions && typeof permissions === 'string') {
                            let permisos;
    
                            try {
                                permisos = JSON.parse(permissions); // Parsea la cadena JSON a un objeto
                            } catch (error) {
                                console.error('Error al parsear permisos:', error);
                                return callback(new Error('Error al procesar permisos.'));
                            }
    
                            const insertValues = [];
    
                            for (const { idTarea, permitido } of permisos) {
                                insertValues.push(`(${idEmpleado}, ${idBase}, ${idTarea}, ${permitido})`);
                            }
    
                            if (insertValues.length > 0) {
                                const query = `INSERT INTO LinkUsuariosTareas (idEmpleado, idBase, idTarea, PermisoActivo) VALUES ${insertValues.join(', ')}`;
    
                                db.query(query, (err) => {
                                    if (err) {
                                        console.error('Error al insertar permisos:', err);
                                        return callback(err);
                                    }
                                    callback(null, { idEmpleado, ...newEmpleado });
                                });
                            } else {
                                callback(null, { idEmpleado, ...newEmpleado });
                            }
                        } else {
                            // Si no hay permisos o no son válidos, simplemente devolver el empleado creado
                            callback(null, { idEmpleado, ...newEmpleado });
                        }
                    }
                );
            }
        );
    },
    

    update: (id, idBase, updatedEmpleado, callback) => {
        const { 
            Nombre, 
            Apellido,
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
            Profesion,
            FechaNac,
            Activo,
            Comentarios,
            FechaIncAct,
            idRol,
            Rol,
            FechaBaja
        } = updatedEmpleado;

        db.query(
            `UPDATE Empleados SET 
                Nombre = ?, 
                Apellido = ?, 
                NroDoc = ?, 
                TpDoc = ?, 
                CUIT = ?, 
                Tel1 = ?, 
                Email1 = ?,
                Celular = ?,
                Direccion = ?,
                CodPostal = ?, 
                Barrio = ?, 
                Localidad = ?, 
                CondIVA = ?,
                idProvincia = ?, 
                Provincia = ?,
                Profesion = ?, 
                FechaNac = ?, 
                Activo = ?,
                Comentarios = ?,
                FechaIncAct = ?, 
                idRol = ?,
                Rol = ?,
                FechaBaja = ?
            WHERE idEmpleado = ? AND idBase = ?`,
            [Nombre, Apellido, NroDoc, TpDoc, CUIT, Tel1, Email1, Celular, Direccion, CodPostal, Barrio, Localidad, CondIVA, idProvincia, Provincia, Profesion, FechaNac, Activo, Comentarios, FechaIncAct, idRol, Rol, FechaBaja, id, idBase],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                callback(null, { id, ...updatedEmpleado });
            }
        );
    },



// Función para actualizar solo la contraseña del empleado
    updatePassword : (idEmpleado, hashedPassword, callback) => {
    db.query(
        `UPDATE Empleados SET Password = ? WHERE idEmpleado = ?`,
        [hashedPassword, idEmpleado],
        (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { idEmpleado, Password: hashedPassword });
        }
    );
},


    delete: (id, callback) => {
        db.query('DELETE FROM Empleados WHERE idEmpleado = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'Empleado eliminado', id });
        });
    },

    toggle: (id, callback) => {
        // Cambiar el estado de 'Activo' de la categoría
        db.query('UPDATE Empleados SET Activo = NOT Activo WHERE idEmpleado = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.affectedRows === 0) {
                return callback(new Error('Empleado no encontrada'));
            }
            callback(null, { message: 'Estado de empleado cambiado', id });
        });
    },
};

module.exports = Empleado;
