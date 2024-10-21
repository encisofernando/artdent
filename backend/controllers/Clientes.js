const Cliente = require('../models/Clientes'); // Asegúrate de tener el modelo Clientes

// Controlador para obtener todos los clientes
const getAllClientes = (req, res) => {
    Cliente.getAll((err, clientes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los clientes' });
        }
        res.status(200).json(clientes);
    });
};

// Controlador para obtener un cliente por ID
const getClienteById = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de cliente es requerido' });
    }

    Cliente.getById(id, (err, result) => {
        if (err) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.status(200).json(result);
    });
};

// Controlador para crear un cliente
const createCliente = (req, res) => {
    const newCliente = req.body;

    console.log('Nuevo Cliente:', newCliente);

    // Validación de datos
    if (
        !newCliente.Nombre || 
        !newCliente.Apellido ||
        !newCliente.NroDoc || // Agregado
        !newCliente.CUIT || // Agregado
        !newCliente.CodPostal || // Agregado
        !newCliente.Barrio || // Agregado
        !newCliente.Localidad || // Agregado
        !newCliente.Provincia || // Agregado
        !newCliente.FechaNac 
     
    ) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Cliente.create(newCliente, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al crear cliente' });
        }
        res.status(201).json(result);
    });
};

// Controlador para actualizar un cliente
const updateCliente = (req, res) => {
    const id = req.params.id;
    const updatedCliente = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID de cliente es requerido' });
    }

    Cliente.update(id, updatedCliente, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar cliente' });
        }
        res.status(200).json(result);
    });
};

// Controlador para eliminar un cliente
const deleteCliente = (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'ID de cliente es requerido' });
    }

    Cliente.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar cliente' });
        }
        res.status(200).json(result);
    });
};

module.exports = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};
