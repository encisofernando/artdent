const Articulo = require('../models/Articulos');
const moment = require('moment');




// Controlador para obtener todos los artículos
const getAllArticulos = (req, res) => {
    const idBase = req.idBase; // Obtén idBase del token
    Articulo.getAll(idBase, (err, articulos) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los artículos' });
        }
        res.status(200).json(articulos);
    });
};


// Controlador para obtener un artículo por ID
const getArticuloById = (req, res) => {
    const idBase = req.idBase; // Obtener idBase del token
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de artículo es requerido' });
    }

    Articulo.getById(id, idBase, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear un artículo
    const createArticulo = (req, res) => {
        console.log('idBase desde el request:', req.idBase); // Esto debería mostrar el idBase

        const newArticulo = { ...req.body, idBase: req.idBase }; // Añadir idBase aquí

        console.log("Datos recibidos:", req.body);

        console.log(newArticulo)
        // Validación de datos
        if (
            !newArticulo.CodigoBarra || 
            !newArticulo.Nombre || 
            !newArticulo.Ubicacion
        ) {
            return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
        }

        // Si hay un archivo de imagen subido, generar la URL de la imagen
        if (req.file) {
            newArticulo.Imagen = `http://localhost:3000/uploads/${req.file.filename}`;
        }
        

        // Función auxiliar para convertir valores vacíos o 'null' a null
        const parseNull = (value) => {
            if (!value || value.toLowerCase() === 'null' || value.trim() === '') {
                return null;
            }
            return value;
        };

        // Convertir las fechas vacías o 'null' string a null
        newArticulo.FechaElab = parseNull(newArticulo.FechaElab);
        newArticulo.FechaVto = parseNull(newArticulo.FechaVto);
        newArticulo.CostoDolar = parseNull(newArticulo.CostoDolar)


        // Llamada al modelo para crear el artículo en la base de datos
        Articulo.create(newArticulo, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al crear artículo' });
            }

            // Respuesta con el artículo creado
            res.status(201).json(result);
        });
    };

// Controlador para actualizar un artículo
const updateArticulo = async (req, res) => {
    const id = req.params.id;
    const updatedArticulo = req.body;
    const idBase = req.idBase; // Obtén idBase del token

    console.log('Artículo para editar lo que se trae: ', updatedArticulo);

    // Convertir los valores a número si son cadenas
    updatedArticulo.Stock = parseFloat(updatedArticulo.Stock);
    updatedArticulo.Costo = parseFloat(updatedArticulo.Costo);
    updatedArticulo.PrecioPublico = parseFloat(updatedArticulo.PrecioPublico);

    // Validación del IVA
    if (!updatedArticulo.Iva || isNaN(updatedArticulo.Iva)) {
        return res.status(400).json({ error: 'El IVA es requerido y debe ser un número' });
    }
    updatedArticulo.Iva = parseFloat(updatedArticulo.Iva).toFixed(4); // IVA con 4 decimales

    if (!id) {
        return res.status(400).json({ error: 'ID de artículo es requerido' });
    }

    // Manejo de checkboxes
    updatedArticulo.CostoDolar = updatedArticulo.HabCostoDolar === '1' 
        ? parseFloat(updatedArticulo.CostoDolar) 
        : null;

    // Desformatear las fechas
    const fechaElabInput = updatedArticulo.FechaElab;
    const fechaVtoInput = updatedArticulo.FechaVto;

    // Validar la fecha de elaboración
    if (updatedArticulo.AplicaElab === '1') {
        const fechaElab = moment(fechaElabInput, 'YYYY-MM-DD', true);
        if (!fechaElab.isValid()) {
            return res.status(400).json({ error: 'Fecha de elaboración no es válida' });
        }
        updatedArticulo.FechaElab = fechaElab.format('YYYY-MM-DD'); 
    } else {
        updatedArticulo.FechaElab = null; 
    }

    // Validar la fecha de vencimiento
    if (updatedArticulo.AplicaVto === '1') {
        const fechaVto = moment(fechaVtoInput, 'YYYY-MM-DD', true);
        if (!fechaVto.isValid()) {
            return res.status(400).json({ error: 'Fecha de vencimiento no es válida' });
        }
        updatedArticulo.FechaVto = fechaVto.format('YYYY-MM-DD'); 
    } else {
        updatedArticulo.FechaVto = null; 
    }

    try {
        // Verifica si el artículo existe y pertenece al idBase del usuario
        const result = await new Promise((resolve, reject) => {
            Articulo.getById(id, idBase, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        console.log('Resultado de getById:', result); // Log para verificar resultados

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado o no autorizado' });
        }
        const articuloActual = result[0]; // Accede al primer artículo

        // Función para eliminar la imagen del servidor
        const deleteImage = (imagePath) => {
            if (imagePath) {
                const path = require('path');
                const fs = require('fs');

                const oldFileName = imagePath.split('/').pop();
                const filePath = path.join(__dirname, `../uploads/${oldFileName}`);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error al eliminar la imagen: ", err);
                    }
                });
            }
        };

        // Manejar la nueva imagen si hay un archivo subido
        if (req.file) {
            const PORT = process.env.PORT || 3000;
            updatedArticulo.Imagen = `http://localhost:${PORT}/uploads/${req.file.filename}`;
            // Eliminar la imagen antigua
            deleteImage(articuloActual.Imagen);
        } else if (updatedArticulo.removeImagen === 'true') {
            // Eliminar imagen si el usuario lo solicitó
            updatedArticulo.Imagen = null;
            deleteImage(articuloActual.Imagen);
        }

        // Eliminar el campo removeImagen del objeto
        delete updatedArticulo.removeImagen;

        // Actualizar el artículo en la base de datos
        await new Promise((resolve, reject) => {
            Articulo.update(id, idBase, updatedArticulo, (err, result) => {
                if (err) {
                    return reject(err); // Rechaza la promesa si hay un error
                }
                resolve(result); // Resuelve la promesa con el resultado
            });
        });

        // Responde con el artículo actualizado
        res.json({ message: 'Artículo actualizado exitosamente', updatedArticulo });

    } catch (err) {
        // Maneja el error
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el artículo' });
    }
};



// Controlador para eliminar un artículo
const deleteArticulo = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de artículo es requerido' });
    }

    Articulo.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar artículo' });
        }
        res.status(200).json(result);
    });
};

module.exports = {
    getAllArticulos,
    getArticuloById,
    createArticulo,
    updateArticulo,
    deleteArticulo
};
