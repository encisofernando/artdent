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
const rolesController = require('./controllers/Roles');
const usuarioController = require('./controllers/Usuario');
const empresaController = require('./controllers/Empresa');
const empleadosController = require('./controllers/Empleados');
const authMiddleware = require('./middlewares/authMiddleware'); // Asegúrate de importar el middleware
const rubrosController = require('./controllers/Rubros');
const tareaController = require('./controllers/Tareas');
const linkUsuariosTareas = require('./controllers/LinkUsuariosTareas');




const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors()); // Habilitar CORS
app.use(express.urlencoded({ extended: true })); // Para procesar FormData sin archivos
app.use(express.json()); // Para manejar JSON en el cuerpo de la solicitud


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
app.get('/articulos', authMiddleware, articuloController.getAllArticulos); // Obtener todos los artículos
app.get('/articulos/:id', authMiddleware, articuloController.getArticuloById); // Obtener un artículo por ID
app.post('/articulos', authMiddleware, upload.single('Imagen'), articuloController.createArticulo);
app.put('/articulos/:id', authMiddleware, upload.single('Imagen'), articuloController.updateArticulo); // Actualizar un artículo con imagen
app.delete('/articulos/:id', articuloController.deleteArticulo); // Eliminar un artículo

//Rutas de categorias
app.get('/categoria', categoriaController.getAllCategorias); // Obtener todos las categorias
app.get('/categoria/:id', categoriaController.getCategoriaById); // Obtener un artículo por ID
app.post('/categoria', categoriaController.createCategoria); // Crear un nuevo artículo
app.put('/categoria/:id', categoriaController.updateCategoria); // Actualizar un artículo
app.delete('/categoria/:id', categoriaController.deleteCategoria); // Eliminar un artículo
app.patch('/categoria/:id/toggle', categoriaController.toggleCategoria); // Alternar estado de la categoría




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
app.patch('/proveedor/:id/toggle', proveedorController.toggleProveedor); // Alternar estado de la categoría


app.get('/clientes', clienteController.getAllClientes); // Obtener todos las categorias
app.get('/clientes/:id', clienteController.getClienteById); // Obtener un artículo por ID
app.post('/clientes', clienteController.createCliente); // Crear un nuevo artículo
app.put('/clientes/:id', clienteController.updateCliente); // Actualizar un artículo
app.delete('/clientes/:id', clienteController.deleteCliente); // Eliminar un artículo

app.get('/tipodoc', tipoDocController.getAllTipoDoc); // Obtener todos las categorias

app.get('/condicioniva', condicionIVAController.getAllCondIVA); // Obtener todos las categorias

app.get('/roles', rolesController.getAllRoles); // Obtener todos los roles

app.get('/rubros', rubrosController.getAllRubros); // Obtener todos las categorias



app.get('/provincias', provinciasController.getAllProvincias); // Obtener todos las categorias

app.post('/usuarios/register', upload.single('Imagen'), usuarioController.registerUsuario);

// Obtener un usuario por ID
app.get('/usuarios/:idUsuario', authMiddleware, usuarioController.getUsuario);

// Iniciar sesión
app.post('/usuarios/login', usuarioController.login);

//Ruta de Empresas
app.get('/empresas', authMiddleware, empresaController.getAllEmpresas); // Obtener todos las categorias
app.get('/empresas/:id', authMiddleware, empresaController.getEmpresaById); // Obtener un artículo por ID
app.post('/empresas', authMiddleware, empresaController.createEmpresa); // Crear un nuevo artículo
app.put('/empresas/:id', authMiddleware,  upload.none(), empresaController.updateEmpresa); // Actualizar un artículo

//Ruta de Empleados
app.get('/empleados', authMiddleware, empleadosController.getAllEmpleados); // Obtener todos los empleados
app.get('/empleados/:id', authMiddleware, empleadosController.getEmpleadoById); // Obtener un empleado por ID
app.post('/empleados', authMiddleware,  upload.single('Imagen'), empleadosController.createEmpleado); // Crear un nuevo empleado
app.put('/empleados/:id', authMiddleware, empleadosController.updateEmpleado); // Actualizar un empleado
app.delete('/empleados/:id', empleadosController.deleteEmpleado); // Eliminar un artículo
app.patch('/empleados/:id/toggle', empleadosController.toggleEmpleado); // Alternar estado de la categoría


app.get('/tareas', tareaController.getAllTareas)
app.get('/empleados/:userId/permisos', linkUsuariosTareas.getUserPermissions); // Nueva ruta para permisos
app.post('/empleados/crearcontrasena', empleadosController.crearContraseña);




// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
