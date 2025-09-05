const Empresa = require('../models/Empresa'); // Asegúrate de tener el modelo Empresa

// Controlador para obtener todas las empresas
const getAllEmpresas = (req, res) => {
    const idBase = req.idBase; // Obtener idBase del token

    Empresa.getAll(idBase, (err, empresas) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las empresas' });
        }
        res.status(200).json(empresas);
    });
};

// Controlador para obtener una empresa por ID
const getEmpresaById = (req, res) => {
    const idBase = req.idBase; // Obtener idBase del token

    if (!idBase) {
        return res.status(400).json({ error: 'ID de base es requerido' });
    }

    Empresa.getById(idBase, (err, result) => { // Asegúrate de que `getById` recibe un callback
        if (err) {
            return res.status(404).json({ error: err.message });
        }
        res.status(200).json(result);
    });
};


// Controlador para crear una nueva empresa
const createEmpresa = (req, res) => {
    const newEmpresa = req.body;

    console.log('Nueva Empresa:', newEmpresa);

    // Validación de datos
    if (
        !newEmpresa.RazonSocial || 
        !newEmpresa.RptDir1 ||
        !newEmpresa.CUIT || // Agregado
        !newEmpresa.NomComercial || // Agregado
        !newEmpresa.IniActividad || // Agregado
        !newEmpresa.NombreRubro || // Agregado
        !newEmpresa.Activo 
    ) {
        return res.status(400).json({ error: 'Faltan datos requeridos o son inválidos' });
    }

    Empresa.create(newEmpresa, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al crear empresa' });
        }
        res.status(201).json(result);
    });
};

// Controlador para actualizar una empresa
const updateEmpresa = (req, res) => {
    const id = req.params.id;
    const updatedEmpresa = req.body; // Asegúrate de que estás usando 'req.body' adecuadamente
  
    console.log("Body recibido en backend:", req.body);

    const idBase = req.idBase; // Obtén idBase del token



  // Convertir booleanos a enteros
  updatedEmpresa.AFIP_HabFE = updatedEmpresa.AFIP_HabFE === 'true' ? 1 : 0;
  updatedEmpresa.Activo = updatedEmpresa.Activo === 'true' ? 1 : 0;

    console.log('Actualizar Empresa - id:', id, 'idBase:', idBase, 'updatedEmpresa:', updatedEmpresa);


      if (!id) {
    return res.status(400).json({ error: 'ID de empresa  son requeridos' });
  }
   
  if (!idBase) {
    return res.status(400).json({ error: 'ID base son requeridos' });
  }
  
  console.log('Datos a actualizar', updatedEmpresa);

    if (!id) {
        return res.status(400).json({ error: 'ID de empresa es requerido' });
    }

    Empresa.update(id, idBase, updatedEmpresa, (err, result) => {
        if (err) {
            console.error('Error al actualizar la empresa:', err);
            return res.status(500).json({ error: 'Error al actualizar empresa' });
        }
    
        // Verificar cuántas filas fueron afectadas
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró la empresa o no se realizaron cambios.' });
        }
    
        res.status(200).json(result);
    });
    
};


// Exportar los controladores
module.exports = {
    getAllEmpresas,
    getEmpresaById,
    createEmpresa,
    updateEmpresa
};
