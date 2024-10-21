const express = require('express');
const db = require('./config/db');
const cors = require('cors'); // Importar CORS
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const articuloController = require('./controllers/Articulos'); // Importar el controlador
const categoriaController = require('./controllers/Categoria'); // Importar el controlador
const ivaController = require('./controllers/Iva'); // Importar el controlador
const promocionController = require('./controllers/Promocion')
const proveedorController = require('./controllers/Proveedor')
const clienteController = require('./controllers/Clientes');
const tipoDocController = require('./controllers/TipoDoc');
const provinciasController = require('./controllers/Provincias');
const condicionIVAController = require('./controllers/CondicionIVA');


const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors()); // Habilitar CORS
app.use(express.json()); // Para poder parsear JSON en las solicitudes

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Ruta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para el archivo
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Rutas para artículos
app.get('/articulos', articuloController.getAllArticulos); // Obtener todos los artículos
app.get('/articulos/:id', articuloController.getArticuloById); // Obtener un artículo por ID
app.post('/articulos', upload.single('Imagen'), articuloController.createArticulo);
app.put('/articulos/:id', upload.single('Imagen'), articuloController.updateArticulo); // Actualizar un artículo con imagen
app.delete('/articulos/:id', articuloController.deleteArticulo); // Eliminar un artículo

//Rutas de categorias
app.get('/categoria', categoriaController.getAllCategorias); // Obtener todos las categorias
app.get('/categoria/:id', categoriaController.getCategoriaById); // Obtener un artículo por ID
app.post('/categoria', categoriaController.createCategoria); // Crear un nuevo artículo
app.put('/categoria/:id', categoriaController.updateCategoria); // Actualizar un artículo
app.delete('/categoria/:id', categoriaController.deleteCategoria); // Eliminar un artículo


//Rutas de iva
app.get('/iva', ivaController.getAllIva); // Obtener todos las categorias
app.get('/iva/:id', ivaController.getIvaById); // Obtener un artículo por ID
app.post('/iva', ivaController.createIva); // Crear un nuevo artículo
app.put('/iva/:id', ivaController.updateIva); // Actualizar un artículo
app.delete('/iva/:id', ivaController.deleteIva); // Eliminar un artículo


//Rutas de Promocion
app.get('/promocion', promocionController.getAllPromociones); // Obtener todos las categorias
app.get('/promocion/:id', promocionController.getPromocionById); // Obtener un artículo por ID
app.post('/promocion', promocionController.createPromocion); // Crear un nuevo artículo
app.put('/promocion/:id', promocionController.updatePromocion); // Actualizar un artículo
app.delete('/promocion/:id', promocionController.deletePromocion); // Eliminar un artículo

//Rutas de Proovedor
app.get('/proveedor', proveedorController.getAllProveedores); // Obtener todos las categorias
app.get('/proveedor/:id', proveedorController.getProveedorById); // Obtener un artículo por ID
app.post('/proveedor', proveedorController.createProveedor); // Crear un nuevo artículo
app.put('/proveedor/:id', proveedorController.updateProveedor); // Actualizar un artículo
app.delete('/proveedor/:id', proveedorController.deleteProveedor); // Eliminar un artículo

app.get('/clientes', clienteController.getAllClientes); // Obtener todos las categorias
app.get('/clientes/:id', clienteController.getClienteById); // Obtener un artículo por ID
app.post('/clientes', clienteController.createCliente); // Crear un nuevo artículo
app.put('/clientes/:id', clienteController.updateCliente); // Actualizar un artículo
app.delete('/clientes/:id', clienteController.deleteCliente); // Eliminar un artículo

app.get('/tipodoc', tipoDocController.getAllTipoDoc); // Obtener todos las categorias

app.get('/condicioniva', condicionIVAController.getAllCondIVA); // Obtener todos las categorias


app.get('/provincias', provinciasController.getAllProvincias); // Obtener todos las categorias


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
