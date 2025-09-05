// Usuario.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const Empresa = require('./Empresa')

// Modelo para Usuarios
const Usuario = {
    // Generar un nuevo idBase
    generarIdBase: async () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT MAX(idBase) as maxIdBase FROM Usuarios', (err, results) => {
                if (err) {
                    return reject(err);
                }
                const nuevoIdBase = (results[0].maxIdBase || 0) + 1; // Incrementar el valor máximo
                resolve(nuevoIdBase);
            });
        });
    },

    // Obtener usuario por ID
    getById: async (idUsuario) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve(null); // Usuario no encontrado
                }
                resolve(results[0]); // Retorna el primer usuario encontrado
            });
        });
    },

 // Obtener usuario por Email
getByEmail: async (Email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT idUsuario, idBase, Email, idRol, Password FROM Usuarios WHERE Email = ?', [Email], (err, results) => {
            if (err) {
                return reject(err); // Manejar error en la consulta
            }
            if (results.length === 0) {
                return resolve(null); // Usuario no encontrado
            }
            resolve(results[0]); // Retorna el primer usuario encontrado
        });
    });
},

getEmpleadoByEmail: async (Email) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT idEmpleado, idBase, Email1, Password, idRol FROM Empleados WHERE Email1 = ?',
            [Email],
            (err, results) => {
                if (err) {
                    return reject(err); // Manejar error en la consulta
                }
                if (results.length === 0) {
                    return resolve(null); // Empleado no encontrado
                }
                resolve(results[0]); // Retorna el primer empleado encontrado
            }
        );
    });
},

    // Crear un nuevo usuario
 // Modelo de usuario
 create: async ({ Email, Password, idRol, Nombre, Imagen }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Generar nuevo idBase
            const idBase = await Usuario.generarIdBase();

            // Encriptar la contraseña
            const saltRounds = 10; // Número de rondas de sal
            const hashedPassword = await bcrypt.hash(Password, saltRounds);

            // Crear la empresa con datos de prueba
            const newEmpresa = {
                RazonSocial: "Razón Social de Prueba",
                RptDir1: "Dirección de Prueba 123",
                RptDir2: "Otra Dirección de Prueba",
                RptTel: "123456789",
                CondIva: 1,
                CUIT: "20-12345678-9",
                NomComercial: "Nombre Comercial",
                IB: "12345",
                IniActividad: new Date(), // Fecha de inicio de actividad
                NombreRubro: "Rubro de Prueba",
                Activo: false, // Activo por defecto
                Logo: null, // Si no hay logo, puedes usar null
                AFIP_PEM: null,
                AFIP_CRT: null,
                AFIP_HabFE: false,
                AFIP_PuntoVenta: null,
                AFIP_VenceCRT: null,
                idBase: idBase // Asignar el idBase del usuario aquí
            };

            // Llamar a la función de crear empresa
            Empresa.create(newEmpresa, (err, empresaResult) => {
                if (err) {
                    console.error('Error al crear la empresa:', err);
                    return reject(err); // Manejar el error si la creación de la empresa falla
                }

                // Verificar que empresaResult tiene el idEmpresa
                if (!empresaResult || !empresaResult.idEmpresa) {
                    return reject(new Error('Error al obtener el idEmpresa tras la creación.'));
                }

                // Inserción en la tabla Usuarios
                db.query(
                    'INSERT INTO Usuarios (idBase, idEmpresa, Email, Password, idRol, Nombre, Imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [idBase, empresaResult.idEmpresa, Email, hashedPassword, idRol, Nombre, Imagen],
                    (err, result) => {
                        if (err) {
                            console.error('Error al insertar en la base de datos:', err);
                            return reject(err);
                        }
                        if (!result.insertId) {
                            return reject(new Error('Error al crear usuario: ID no disponible'));
                        }

                        // Si todo va bien, resolvemos la promesa
                        resolve({
                            idUsuario: result.insertId,
                            Email,
                            idRol,
                            idBase,
                            idEmpresa: empresaResult.idEmpresa // También puedes devolver el id de la empresa
                        });
                    }
                );
            });
        } catch (error) {
            console.error('Error al encriptar la contraseña:', error);
            reject(error);
        }
    });
},




        // Validar el inicio de sesión
        validateLogin: async (Email, Password) => {
            let user = await Usuario.getByEmail(Email);
        
            if (!user) {
                user = await Usuario.getEmpleadoByEmail(Email);
                if (!user) {
                    throw new Error('Usuario no encontrado');
                }
            }
        
            console.log('Usuario encontrado:', user);
        
            // Verificar que user.Password y Password no sean null o undefined
            if (!user.Password || !Password) {
                throw new Error('La contraseña no está disponible.');
            }
        
            const isMatch = await bcrypt.compare(Password, user.Password);
            if (!isMatch) {
                throw new Error('Contraseña incorrecta');
            }
        
            return { 
                idUsuario: user.idUsuario || null,
                idEmpleado: user.idEmpleado || null,
                idBase: user.idBase, 
                idRol: user.idRol
            };
        }
        
}    

module.exports = Usuario;
