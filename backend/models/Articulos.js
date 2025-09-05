const db = require('../config/db');

// Modelo para Articulos
const Articulo = {
    getAll: (idBase, callback) => {
        db.query('SELECT * FROM Articulos WHERE idBase = ?', [idBase], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    
    

    getById: (id, idBase, callback) => {
        db.query('SELECT * FROM Articulos WHERE idArticulo = ? AND idBase = ?', [id, idBase], (err, result) => {
            if (err) {
                return callback(err);
            }
            if (result.length === 0) {
                return callback(new Error('Artículo no encontrado'));
            }
            callback(null, result[0]); // Devuelve solo un artículo
        });
    },
    

    create: (newArticulo, callback) => {
        const { 
            CodigoBarra, 
            Nombre, 
            Stock, 
            Costo, 
            PrecioPublico, 
            Iva, 
            Ubicacion,
            idCategoria,
            idPromocionCantidad,
            idProveedor1,  // Proveedor principal
            idProveedor2,  // Proveedor auxiliar
            StockMin,
            Ganancia,
            Lote,
            Descripcion,
            activo,
            HabPrecioManual,
            NoAplicaStock,
            NoAplicarDescuento,
            EmailPorBajoStock,
            HabNroSerie,
            AplicaElab,
            FechaElab,
            AplicaVto,
            FechaVto,
            HabCostoDolar,
            CostoDolar,
            Codigo,
            Imagen,
            idBase
        } = newArticulo;
    
        // Verificar si la categoría existe
        db.query(
            'SELECT COUNT(*) AS count FROM Categorias WHERE idCategoria = ?',
            [idCategoria],
            (err, resultsCategoria) => {
                if (err) {
                    return callback(err);
                }
    
                if (resultsCategoria[0].count === 0) {
                    return callback(new Error('El idCategoria no existe en la tabla Categorias.'));
                }
    
                // Verificar si el proveedor principal existe
                db.query(
                    'SELECT COUNT(*) AS count FROM Proveedores WHERE idProveedor = ?',
                    [idProveedor1], // Cambiar a idProveedor1
                    (err, resultsProveedor1) => {
                        if (err) {
                            return callback(err);
                        }
    
                        if (resultsProveedor1[0].count === 0) {
                            return callback(new Error('El idProveedor1 no existe en la tabla Proveedores.'));
                        }
    
                        // Verificar si el proveedor auxiliar existe
                        db.query(
                            'SELECT COUNT(*) AS count FROM Proveedores WHERE idProveedor = ?',
                            [idProveedor2], // Cambiar a idProveedor2
                            (err, resultsProveedor2) => {
                                if (err) {
                                    return callback(err);
                                }
    
                                if (resultsProveedor2[0].count === 0) {
                                    return callback(new Error('El idProveedor2 no existe en la tabla Proveedores.'));
                                }
    
                                // Verificar si la promoción existe
                                db.query(
                                    'SELECT COUNT(*) AS count FROM PromocionCantidad WHERE idPromocionCantidad = ?',
                                    [idPromocionCantidad],
                                    (err, resultsPromocion) => {
                                        if (err) {
                                            return callback(err);
                                        }
    
                                        if (resultsPromocion[0].count === 0) {
                                            return callback(new Error('El idPromocion no existe en la tabla Promociones.'));
                                        }
                                        
                                        
                                        
    
                                        // Inserción en Articulos
                                        db.query(
                                            `INSERT INTO Articulos 
                                              (CodigoBarra, Nombre, Stock, Costo, PrecioPublico, Iva, Ubicacion, 
                                               idCategoria, idPromocionCantidad, idProveedor1, idProveedor2, 
                                               StockMin, Ganancia, Lote, Descripcion, activo, HabPrecioManual, 
                                               NoAplicaStock, NoAplicarDescuento, EmailPorBajoStock, 
                                               HabNroSerie, AplicaElab, FechaElab, AplicaVto, FechaVto, HabCostoDolar,
                                               CostoDolar, Codigo, Imagen, idBase) 
                                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                            [
                                              CodigoBarra, 
                                              Nombre, 
                                              Stock, 
                                              Costo, 
                                              PrecioPublico, 
                                              Iva, 
                                              Ubicacion,
                                              idCategoria,
                                              idPromocionCantidad,
                                              idProveedor1,
                                              idProveedor2,
                                              StockMin,
                                              Ganancia,
                                              Lote,
                                              Descripcion,
                                              activo,
                                              HabPrecioManual,
                                              NoAplicaStock,
                                              NoAplicarDescuento,
                                              EmailPorBajoStock,
                                              HabNroSerie,
                                              AplicaElab,
                                              FechaElab,
                                              AplicaVto,
                                              FechaVto,
                                              HabCostoDolar,
                                              CostoDolar,
                                              Codigo,
                                              Imagen,
                                              idBase
                                            ],
                                            (err, result) => {
                                                if (err) {
                                                    console.error('Error al insertar en la base de datos:', err); // Agrega este log
                                                    return callback(err);
                                                }
                                                callback(null, { id: result.insertId, ...newArticulo });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    },
    

    update: (id, idBase, updatedArticulo, callback) => {
        const { 
          CodigoBarra, 
          Nombre, 
          Stock, 
          Costo, 
          PrecioPublico, 
          Iva, 
          Ubicacion,
          idCategoria,
          idPromocionCantidad,
          idProveedor1,
          idProveedor2,
          StockMin,
          Ganancia,
          Lote,
          Descripcion,
          activo,
          HabPrecioManual,
          NoAplicaStock,
          NoAplicarDescuento,
          EmailPorBajoStock,
          HabNroSerie,
          AplicaElab,
          FechaElab,
          AplicaVto,
          FechaVto,
          HabCostoDolar,
          CostoDolar,
          Codigo,
          Imagen
        } = updatedArticulo;
      
        db.query(
          `UPDATE Articulos SET 
              CodigoBarra = ?, 
              Nombre = ?, 
              Stock = ?, 
              Costo = ?, 
              PrecioPublico = ?, 
              Iva = ?, 
              Ubicacion = ?, 
              idCategoria = ?, 
              idPromocionCantidad = ?, 
              idProveedor1 = ?, 
              idProveedor2 = ?, 
              StockMin = ?, 
              Ganancia = ?, 
              Lote = ?, 
              Descripcion = ?, 
              activo = ?, 
              HabPrecioManual = ?, 
              NoAplicaStock = ?, 
              NoAplicarDescuento = ?, 
              EmailPorBajoStock = ?, 
              HabNroSerie = ?, 
              AplicaElab = ?, 
              FechaElab = ?, 
              AplicaVto = ?, 
              FechaVto = ?, 
              HabCostoDolar = ?, 
              CostoDolar = ?, 
              Codigo = ?,
              Imagen = ?
         WHERE idArticulo = ? AND idBase = ?`,
          [
            CodigoBarra, 
            Nombre, 
            Stock, 
            Costo, 
            PrecioPublico, 
            Iva, 
            Ubicacion,
            idCategoria,
            idPromocionCantidad,
            idProveedor1,
            idProveedor2,
            StockMin,
            Ganancia,
            Lote,
            Descripcion,
            activo,
            HabPrecioManual,
            NoAplicaStock,
            NoAplicarDescuento,
            EmailPorBajoStock,
            HabNroSerie,
            AplicaElab,
            FechaElab,
            AplicaVto,
            FechaVto,
            HabCostoDolar,
            CostoDolar,
            Codigo,
            Imagen, 
            id,
            idBase
          ],
          (err, result) => {
            if (err) {
              return callback(err);
            }
            callback(null, { id, ...updatedArticulo });
          }
        );
      },
      

    delete: (id, callback) => {
        db.query('DELETE FROM Articulos WHERE idArticulo = ?', [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, { message: 'Articulo eliminado', id });
        });
    }
};

module.exports = Articulo;
