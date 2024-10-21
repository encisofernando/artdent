const Articulo = require('../models/Articulos');


// Controlador para obtener todos los artículos
const getAllArticulos = (req, res) => {
    Articulo.getAll((err, articulos) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los artículos' });
        }
        res.status(200).json(articulos);
    });
};


// Controlador para obtener un artículo por ID
const getArticuloById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de artículo es requerido' });
    }

    Articulo.getById(id, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear un artículo
const createArticulo = (req, res) => {
    // Crear una copia del objeto del nuevo artículo con los datos recibidos
    const newArticulo = req.body;

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
const updateArticulo = (req, res) => {
    const id = req.params.id;
    const updatedArticulo = req.body;

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
    updatedArticulo.CostoDolar = updatedArticulo.HabCostoDolar === 1 ? 
        parseFloat(updatedArticulo.CostoDolar) : null;
    updatedArticulo.FechaElab = updatedArticulo.AplicaElab === 1 ? 
        updatedArticulo.FechaElab : null;
    updatedArticulo.FechaVto = updatedArticulo.AplicaVto === 1 ? 
        updatedArticulo.FechaVto : null;

    updatedArticulo.HabPrecioManual = updatedArticulo.HabPrecioManual === 1 ? 1 : 0;
    updatedArticulo.NoAplicaStock = updatedArticulo.NoAplicaStock === 1 ? 1 : 0;
    updatedArticulo.NoAplicarDescuento = updatedArticulo.NoAplicarDescuento === 1 ? 1 : 0;
    updatedArticulo.EmailPorBajoStock = updatedArticulo.EmailPorBajoStock === 1 ? 1 : 0;
    updatedArticulo.HabNroSerie = updatedArticulo.HabNroSerie === 1 ? 1 : 0;

    // Obtener el artículo actual para manejar la imagen
    Articulo.getById(id, (err, articuloActual) => {
        if (err || !articuloActual) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        // Manejar la imagen
        if (req.file) {
            const path = require('path');
            const PORT = process.env.PORT || 3000; // Usa el puerto del entorno o 3000 por defecto

            // Nueva imagen cargada
            updatedArticulo.Imagen = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Eliminar la imagen antigua si existe
    if (articuloActual.Imagen) {
        const fs = require('fs');
        // Obtener solo el nombre del archivo
        const oldFileName = articuloActual.Imagen.split('/').pop();
        const filePath = path.join(__dirname, `../uploads/${oldFileName}`);
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error al eliminar la imagen antigua: ", err);
            }
        });
    }
} else if (updatedArticulo.removeImagen === 'true') {
    // Eliminar imagen si el usuario lo solicitó
    updatedArticulo.Imagen = null;

    // Eliminar la imagen del servidor si existe
    if (articuloActual.Imagen) {
        const fs = require('fs');
        const oldFileName = articuloActual.Imagen.split('/').pop();
        const filePath = path.join(__dirname, `../uploads/${oldFileName}`);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error al eliminar la imagen: ", err);
            }
        });
    }
}

        // Eliminar el campo removeImagen del objeto
        delete updatedArticulo.removeImagen;

        // Actualizar el artículo en la base de datos
        Articulo.update(id, updatedArticulo, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al actualizar artículo' });
            }

            res.status(200).json(result);
        });
    });
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
