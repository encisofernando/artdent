const db = require('../config/db');

// Modelo para Empresas
const Empresa = {
    getAll: (idBase, callback) => {
        db.query('SELECT * FROM Empresa WHERE idBase = ?', [idBase], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (idBase, callback) => {
        db.query('SELECT * FROM Empresa WHERE idBase = ?', [idBase], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Empresa no encontrada'));
            }
            callback(null, result[0]); // Devuelve solo una empresa
        });
    },
    
    
    create: (newEmpresa, callback) => {
        const { 
            RazonSocial, 
            RptDir1,
            RptDir2,
            RptTel,
            CondIva,
            CUIT,
            NomComercial,
            IB,
            IniActividad,
            NombreRubro,
            Activo,
            Logo,
            AFIP_PEM,
            AFIP_CRT,
            AFIP_HabFE,
            AFIP_PuntoVenta,
            AFIP_VenceCRT,
            idBase
        } = newEmpresa;

        // Inserción en Empresas
        db.query(
            `INSERT INTO Empresa 
              (RazonSocial, RptDir1, RptDir2, RptTel, CondIva, CUIT, NomComercial, IB, IniActividad, NombreRubro, Activo, Logo, AFIP_PEM, AFIP_CRT, AFIP_HabFE, AFIP_PuntoVenta, AFIP_VenceCRT, idBase ) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [RazonSocial, RptDir1, RptDir2, RptTel, CondIva, CUIT, NomComercial, IB, IniActividad, NombreRubro, Activo, Logo, AFIP_PEM, AFIP_CRT, AFIP_HabFE, AFIP_PuntoVenta, AFIP_VenceCRT, idBase],
            (err, result) => {
                if (err) {
                    console.error('Error al insertar en la base de datos:', err);
                    return callback(err);
                }
                callback(null, { idEmpresa: result.insertId, ...newEmpresa });
            }
        );
    },


    update: (id, idBase, updatedEmpresa, callback) => {
        const { 
            RazonSocial, 
            RptDir1,
            RptDir2,
            RptTel,
            CondIva,
            CUIT,
            NomComercial,
            IB,
            IniActividad,
            NombreRubro,
            Activo,
            Logo,
            AFIP_PEM,
            AFIP_CRT,
            AFIP_HabFE,
            AFIP_PuntoVenta,
            AFIP_VenceCRT
        } = updatedEmpresa;
    
    
        db.query(
            `UPDATE Empresa SET 
                RazonSocial = ?, 
                RptDir1 = ?, 
                RptDir2 = ?, 
                RptTel = ?, 
                CondIva = ?, 
                CUIT = ?, 
                NomComercial = ?, 
                IB = ?, 
                IniActividad = ?, 
                NombreRubro = ?, 
                Activo = ?, 
                Logo = ?, 
                AFIP_PEM = ?, 
                AFIP_CRT = ?, 
                AFIP_HabFE = ?, 
                AFIP_PuntoVenta = ?, 
                AFIP_VenceCRT = ? 
            WHERE IdEmpresa = ? AND idBase = ?`, // Cambiar a IdEmpresa
            [RazonSocial, RptDir1, RptDir2, RptTel, CondIva, CUIT, NomComercial, IB, IniActividad, NombreRubro, Activo, Logo, AFIP_PEM, AFIP_CRT, AFIP_HabFE, AFIP_PuntoVenta, AFIP_VenceCRT, id,  idBase],
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                console.log('Filas afectadas:', result.affectedRows); // Imprimir el número de filas afectadas
                callback(null, { id, ...updatedEmpresa });
            }
        );
    }
    
    
};

module.exports = Empresa;
