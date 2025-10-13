import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Grid,
  TablePagination,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel, // Asegurado que esté importado
} from "@mui/material";
import { Formik, FieldArray } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
//import { getAllClientes } from "../../config/ClienteDB"; // Asegúrate de que la ruta sea correcta

// Mock de clientes para el Autocomplete
const clientes = [
  { id: 0, dni: "99999999", cuit: "20-99999999-9", nombre: "Consumidor Final" }, // Cliente predefinido
  { id: 1, dni: "12345678", cuit: "20-12345678-9", nombre: "Cliente A" },
  { id: 2, dni: "87654321", cuit: "23-87654321-0", nombre: "Cliente B" },
  { id: 3, dni: "11223344", cuit: "27-11223344-5", nombre: "Cliente C" },
  // Agrega más clientes según tus necesidades
];

// Mock de productos para el Autocomplete
const productos = [
  {
    id: 1,
    codigoBarra: "1234567890123",
    descripcion: "Producto A",
    precioUnitario: 10.5,
    impuesto: 21, // Impuesto en porcentaje
  },
  {
    id: 2,
    codigoBarra: "9876543210987",
    descripcion: "Producto B",
    precioUnitario: 20.0,
    impuesto: 10.5,
  },
  {
    id: 3,
    codigoBarra: "4567890123456",
    descripcion: "Producto C",
    precioUnitario: 15.75,
    impuesto: 21,
  },
  // Agrega más productos según tus necesidades
];

// Opciones de descuento
const descuentos = [
  { value: 0, label: "Sin Descuento" },
  { value: 5, label: "5%" },
  { value: 10, label: "10%" },
  { value: 15, label: "15%" },
  // Agrega más opciones según tus necesidades
];

// Opciones de percepción
const percepciones = [
  { value: 0, label: "Sin Percepción" },
  { value: 1, label: "1%" },
  { value: 1.5, label: "1.5%" },
  { value: 2, label: "2%" },
];

const FacturacionElectronica = () => {
  // Estados para la paginación
  const [page, setPage] = useState(0);
  const rowsPerPage = 4; // Configurado a 4 artículos por página

  // Estados para los diálogos
  const [openBuscarCliente, setOpenBuscarCliente] = useState(false);
  const [openFichaCliente, setOpenFichaCliente] = useState(false);
  const [openCC, setOpenCC] = useState(false);
  const [openPago, setOpenPago] = useState(false);
  const [openInfoImpuestos, setOpenInfoImpuestos] = useState(false);

  // Estado para el término de búsqueda en Buscar Cliente
  const [buscarClienteTermino, setBuscarClienteTermino] = useState("");

  // Estados para los métodos de pago
  const [metodoPago, setMetodoPago] = useState("");
  const [pagos, setPagos] = useState([]);

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para obtener la fecha y hora actual en formato YYYY-MM-DDTHH:MM
  const getInitialDateTime = () => {
    const now = new Date();
    const formatted = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    return formatted;
  };

  // Valores iniciales del formulario
  const initialValues = {
    cliente: clientes[0], // Inicialmente se selecciona "Consumidor Final"
    tipoComprobante: "",
    numeroComprobante: "",
    fechaEmision: getInitialDateTime(),
    conceptos: [],
    selectedProducto: null, // Para el Autocomplete de productos
    cantidadProducto: "", // Para la cantidad de productos a agregar
    condicionVenta: "contado", // Valor inicial
    observaciones: "",
    recargo: 0,
    descuento: 0,
    percepcion: 0,
  };

  // Esquema de validación del formulario
  const facturaSchema = yup.object().shape({
    cliente: yup
      .object()
      .nullable()
      .required("Selecciona un cliente"),
    tipoComprobante: yup
      .string()
      .oneOf(
        ["facturacionElectronicaC", "facturaX"],
        "Selecciona un tipo de comprobante válido"
      )
      .required("El tipo de comprobante es requerido"),
    numeroComprobante: yup
      .string()
      .required("El número de comprobante es requerido"),
    fechaEmision: yup
      .date()
      .required("La fecha de emisión es requerida"),
    conceptos: yup
      .array()
      .of(
        yup.object().shape({
          codigoBarra: yup.string().required("Código de Barra es requerido"),
          descripcion: yup.string().required("Descripción es requerida"),
          precioUnitario: yup
            .number()
            .positive("Debe ser un número positivo")
            .required("Precio Unitario es requerido"),
          cantidad: yup
            .number()
            .integer("Debe ser un número entero")
            .positive("Debe ser un número positivo")
            .required("Cantidad es requerida"),
          subtotal: yup
            .number()
            .positive("Debe ser un número positivo")
            .required("Subtotal es requerido"),
          impuesto: yup
            .number()
            .oneOf([10.5, 21], "Impuesto válido es 10.5% o 21%")
            .required("Impuesto es requerido"),
        })
      )
      .min(1, "Debe haber al menos un concepto"),
    condicionVenta: yup
      .string()
      .oneOf(["contado", "cuentaCorriente"], "Selecciona una condición de venta válida")
      .required("La condición de venta es requerida"),
    observaciones: yup.string(),
    recargo: yup.number().min(0, "Recargo no puede ser negativo"),
    descuento: yup.number().min(0, "Descuento no puede ser negativo"),
    percepcion: yup
      .number()
      .oneOf([0, 1, 1.5, 2], "Selecciona una percepción válida")
      .required("Percepción es requerida"),
  });

  // Manejar el envío del formulario
  const handleFormSubmit = (values, { resetForm, setFieldValue }) => {
    console.log("Datos del formulario:", values);
    // Aquí puedes agregar la lógica para enviar los datos a la API de AFIP

    // Abrir el diálogo de pago
    setOpenPago(true);

    // Si el método de pago es Tarjeta, aplicar recargo automáticamente
    if (metodoPago === "tarjeta") {
      setFieldValue("recargo", 5); // Por ejemplo, 5% de recargo
    } else {
      setFieldValue("recargo", 0);
    }
  };

  // Manejar los atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F4") {
        event.preventDefault();
        setOpenBuscarCliente(true);
      }
      if (event.key === "F7") {
        event.preventDefault();
        if (document.getElementById("ver-ficha-cliente-btn")) {
          document.getElementById("ver-ficha-cliente-btn").click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtrar clientes según el término de búsqueda
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.dni.includes(buscarClienteTermino) ||
    cliente.cuit.includes(buscarClienteTermino) ||
    cliente.nombre.toLowerCase().includes(buscarClienteTermino.toLowerCase())
  );

  return (
    <Box m="20px">
      <Header
        title="FACTURACIÓN ELECTRÓNICA"
        subtitle="Completa los datos de la factura"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={facturaSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          resetForm,
        }) => (
          <form onSubmit={handleSubmit}>
            {/* Información Principal del Formulario */}
            <Box
              display="grid"
              gap="15px" // Espaciado entre los inputs
              gridTemplateColumns="repeat(4, 1fr)" // Cuatro columnas para acomodar los botones
            >
              {/* Campo de búsqueda de cliente (DNI / CUIT / Nombre) */}
              <TextField

                label="Cliente"
                variant="filled"
                name="cliente"
                size="small"
                value={values.cliente ? `${values.cliente.cuit} - ${values.cliente.nombre}` : ""}
                InputProps={{
                  readOnly: true,
                }}
                onClick={() => setOpenBuscarCliente(true)}
                error={!!touched.cliente && !!errors.cliente}
                helperText={touched.cliente && errors.cliente}
                fullWidth
                sx={{ gridColumn: "span 2", cursor: "pointer" }}
              />

              {/* Botón Buscar Cliente */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={() => setOpenBuscarCliente(true)}
                sx={{ gridColumn: "span 1" }}
              >
                Buscar Cliente (F4)
              </Button>

              {/* Botones Ver Ficha Cliente, Ver CC y Quitar Cliente */}
              <Box display="flex" alignItems="center" gridColumn="span 1" gap="10px">
                <Button
                  id="ver-ficha-cliente-btn"
                  variant="outlined"
                  color="info"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setOpenFichaCliente(true)}
                  disabled={!values.cliente}
                >
                  Ver Ficha Cliente
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setOpenCC(true)}
                  disabled={!values.cliente}
                >
                  Ver CC
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setFieldValue("cliente", clientes[0])} // Restablece a "Consumidor Final"
                  disabled={values.cliente.id === 0} // Deshabilita si ya es "Consumidor Final"
                >
                  Quitar Cliente
                </Button>
              </Box>

              {/* Tipo de Comprobante como Select */}
              <TextField
                select
                fullWidth
                size="small"
                variant="filled"
                label="Tipo de Comprobante"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.tipoComprobante}
                name="tipoComprobante"
                error={!!touched.tipoComprobante && !!errors.tipoComprobante}
                helperText={touched.tipoComprobante && errors.tipoComprobante}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="facturacionElectronicaC">Facturación Electrónica C</MenuItem>
                <MenuItem value="facturaX">Factura X</MenuItem>
              </TextField>

              {/* Número de Comprobante */}
              <TextField
                fullWidth
                size="small"
                variant="filled"
                type="text"
                label="Número de Comprobante"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.numeroComprobante}
                name="numeroComprobante"
                error={!!touched.numeroComprobante && !!errors.numeroComprobante}
                helperText={touched.numeroComprobante && errors.numeroComprobante}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Fecha de Emisión con fecha y hora actual */}
              <TextField
                fullWidth
                size="small"
                variant="filled"
                type="datetime-local"
                label="Fecha de Emisión"
                InputLabelProps={{ shrink: true }}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fechaEmision}
                name="fechaEmision"
                error={!!touched.fechaEmision && !!errors.fechaEmision}
                helperText={touched.fechaEmision && errors.fechaEmision}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Condición de Venta (Mutuamente Exclusiva) */}
              <FormControl component="fieldset" sx={{ gridColumn: "span 2" }}>
                <RadioGroup
                  row
                  name="condicionVenta"
                  value={values.condicionVenta}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="contado"
                    control={<Radio />}
                    label="CONTADO"
                  />
                  <FormControlLabel
                    value="cuentaCorriente"
                    control={<Radio />}
                    label="CUENTA CORRIENTE"
                  />
                </RadioGroup>
                {touched.condicionVenta && errors.condicionVenta && (
                  <Typography color="error" variant="caption">
                    {errors.condicionVenta}
                  </Typography>
                )}
              </FormControl>

              {/* Observaciones */}
              <TextField
                fullWidth
                size="small"
                variant="filled"
                
                rows={2}
                label="Observaciones"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.observaciones}
                name="observaciones"
                error={!!touched.observaciones && !!errors.observaciones}
                helperText={touched.observaciones && errors.observaciones}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>

            {/* Buscador y Agregar Producto */}
            <Box mt="20px" mb="20px">
              <Typography variant="h6" gutterBottom>
                Agregar Producto
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Autocomplete
                  size="small"
                    options={productos}
                    getOptionLabel={(option) =>
                      `${option.codigoBarra} - ${option.descripcion}`
                    }
                    onChange={(event, newValue) => {
                      setFieldValue("selectedProducto", newValue);
                    }}
                    value={values.selectedProducto}
                    renderInput={(params) => (
                      <TextField
                      size="small"
                        {...params}
                        label="Buscar Producto"
                        variant="filled"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="filled"
                    type="number"
                    label="Cantidad"
                    name="cantidadProducto"
                    value={values.cantidadProducto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    inputProps={{ min: 1, step: "1" }}
                    error={
                      touched.cantidadProducto &&
                      Boolean(errors.cantidadProducto)
                    }
                    helperText={
                      touched.cantidadProducto && errors.cantidadProducto
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const producto = values.selectedProducto;
                      const cantidad = parseInt(values.cantidadProducto, 10); // Corregido radix a 10

                      if (producto && cantidad > 0) {
                        // Verificar si el producto ya está en la tabla
                        const exists = values.conceptos.find(
                          (item) => item.codigoBarra === producto.codigoBarra
                        );

                        if (exists) {
                          // Actualizar la cantidad y subtotal
                          const updatedConceptos = values.conceptos.map((item) => {
                            if (item.codigoBarra === producto.codigoBarra) {
                              const nuevaCantidad = item.cantidad + cantidad;
                              return {
                                ...item,
                                cantidad: nuevaCantidad,
                                subtotal: (
                                  producto.precioUnitario * nuevaCantidad
                                ).toFixed(2),
                              };
                            }
                            return item;
                          });
                          setFieldValue("conceptos", updatedConceptos);
                        } else {
                          // Agregar nuevo concepto
                          setFieldValue("conceptos", [
                            ...values.conceptos,
                            {
                              id: producto.id, // Asignar un ID único si está disponible
                              codigoBarra: producto.codigoBarra,
                              descripcion: producto.descripcion,
                              precioUnitario: producto.precioUnitario,
                              cantidad: cantidad,
                              subtotal: (
                                producto.precioUnitario * cantidad
                              ).toFixed(2),
                              impuesto: producto.impuesto, // Asignar impuesto
                            },
                          ]);
                        }

                        // Limpiar campos de selección
                        setFieldValue("selectedProducto", null);
                        setFieldValue("cantidadProducto", "");

                        // Resetear a la primera página al agregar un nuevo producto
                        setPage(0);
                      }
                    }}
                    disabled={!values.selectedProducto || !values.cantidadProducto}
                    sx={{ gridColumn: "span 1" }}
                  >
                    Agregar
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Tabla de Conceptos */}
            <Box mt="40px">
              <Typography variant="h6" gutterBottom>
                Detalles de la Factura
              </Typography>
              <FieldArray name="conceptos">
                {({ remove, push, form }) => (
                    <TableContainer component={Paper} sx={{ maxHeight: "400px", overflow: "auto" }}>
                     <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Código de Barra</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell align="right">Precio Unitario ($)</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Subtotal ($)</TableCell>
                          <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {values.conceptos
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((concepto, index) => (
                            <TableRow key={concepto.id || index}>
                              {/* Código de Barra */}
                              <TableCell>{concepto.codigoBarra}</TableCell>

                              {/* Descripción */}
                              <TableCell>{concepto.descripcion}</TableCell>

                              {/* Precio Unitario */}
                              <TableCell align="right">
                                {concepto.precioUnitario.toFixed(2)}
                              </TableCell>

                              {/* Cantidad Editable */}
                              <TableCell align="right">
                                <TextField
                                size="small"
                                  type="number"
                                  value={concepto.cantidad}
                                  onChange={(e) => {
                                    const nuevaCantidad = parseInt(e.target.value, 10);
                                    if (nuevaCantidad > 0) {
                                      const updatedConceptos = values.conceptos.map((item, idx) => {
                                        if (idx === index) {
                                          return {
                                            ...item,
                                            cantidad: nuevaCantidad,
                                            subtotal: (
                                              item.precioUnitario * nuevaCantidad
                                            ).toFixed(2),
                                          };
                                        }
                                        return item;
                                      });
                                      setFieldValue("conceptos", updatedConceptos);
                                    }
                                  }}
                                  inputProps={{ min: 1, step: "1" }}
                                
                                  sx={{ width: "80px" }}
                                />
                              </TableCell>

                              {/* Subtotal */}
                              <TableCell align="right">{concepto.subtotal}</TableCell>

                              {/* Acciones */}
                              <TableCell align="center">
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    remove(index);
                                    // Si la eliminación deja la página vacía, retroceder una página
                                    const newCount = values.conceptos.length - 1;
                                    const newPage = Math.floor(newCount / rowsPerPage);
                                    if (page > 0 && page >= newPage) {
                                      setPage(newPage - 1);
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}

                        {/* Fila para mostrar el subtotal */}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="h6">Subtotal:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6">
                              $
                              {values.conceptos
                                .reduce(
                                  (acc, curr) =>
                                    acc + parseFloat(curr.subtotal || 0),
                                  0
                                )
                                .toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Recargo */}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="h6">Recargo:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                            
                              type="number"
                              name="recargo"
                              value={values.recargo}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              inputProps={{ min: 0, step: "0.01" }}
                              size="small"
                              sx={{ width: "100px" }}
                              disabled={metodoPago === "tarjeta"} // Deshabilitar si es tarjeta
                            />
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Descuento */}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="h6">Descuento:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <FormControl fullWidth size="small">
                              <InputLabel id="descuento-label">Descuento</InputLabel>
                              <Select
                                labelId="descuento-label"
                                id="descuento"
                                name="descuento"
                                value={values.descuento}
                                label="Descuento"
                                onChange={handleChange}
                              >
                                {descuentos.map((descuento) => (
                                  <MenuItem key={descuento.value} value={descuento.value}>
                                    {descuento.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Percepción */}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="h6">Percepción:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <FormControl fullWidth size="small">
                              <InputLabel id="percepcion-label">Percepción</InputLabel>
                              <Select
                                labelId="percepcion-label"
                                id="percepcion"
                                name="percepcion"
                                value={values.percepcion}
                                label="Percepción"
                                onChange={handleChange}
                              >
                                {percepciones.map((percepcion) => (
                                  <MenuItem key={percepcion.value} value={percepcion.value}>
                                    {percepcion.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Impuestos */}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="h6">Impuestos:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Información sobre impuestos">
                              <IconButton onClick={() => setOpenInfoImpuestos(true)}>
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell />
                        </TableRow>

                        {/* Total Final */}
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <Typography variant="h5">Total Final:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h5">
                              $
                              {(
                                values.conceptos.reduce(
                                  (acc, curr) => acc + parseFloat(curr.subtotal || 0),
                                  0
                                ) +
                                parseFloat(values.recargo || 0) -
                                (values.descuento / 100) *
                                  values.conceptos.reduce(
                                    (acc, curr) => acc + parseFloat(curr.subtotal || 0),
                                    0
                                  ) +
                                parseFloat(values.percepcion || 0)
                              ).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                    {/* Componente de Paginación */}
                    <TablePagination
                      component="div"
                      count={values.conceptos.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[rowsPerPage]} // Solo 4 por página
                      // Ocultar el selector de filas por página
                      labelRowsPerPage=""
                      // Ocultar la opción de cambiar filas por página
                      selectRowsPerPage={false}
                    />
                  </TableContainer>
                )}
              </FieldArray>
            </Box>

            {/* Botones de Limpiar y Emitir Factura */}
            <Box display="flex" justifyContent="end" mt="20px" gap="10px">
              <Button
                type="button"
                color="secondary"
                variant="contained"
                onClick={() => {
                  resetForm();
                  setPage(0); // Resetear la página al limpiar el formulario
                }}
              >
                Limpiar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={values.conceptos.length === 0}
              >
                Emitir Factura
              </Button>
            </Box>

            {/* Diálogo para Buscar Cliente */}
            <Dialog
              open={openBuscarCliente}
              onClose={() => setOpenBuscarCliente(false)}
              fullWidth
              maxWidth="md"
            >
              <DialogTitle>Buscar Cliente</DialogTitle>
              <DialogContent dividers>
                {/* Campo de búsqueda */}
                <Box mb={2}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Buscar por DNI, CUIT o Nombre"
                    value={buscarClienteTermino}
                    onChange={(e) => setBuscarClienteTermino(e.target.value)}
                    InputProps={{
                      endAdornment: <SearchIcon />,
                    }}
                  />
                </Box>
                {/* Tabla de Clientes Filtrados */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>DNI</TableCell>
                        <TableCell>CUIT</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="center">Seleccionar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((cliente) => (
                          <TableRow key={cliente.id}>
                            <TableCell>{cliente.dni}</TableCell>
                            <TableCell>{cliente.cuit}</TableCell>
                            <TableCell>{cliente.nombre}</TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  setFieldValue("cliente", cliente);
                                  setOpenBuscarCliente(false);
                                  setBuscarClienteTermino("");
                                }}
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No se encontraron clientes.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenBuscarCliente(false);
                    setBuscarClienteTermino("");
                  }}
                  color="secondary"
                >
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Diálogo para Ficha de Cliente */}
            <Dialog
              open={openFichaCliente}
              onClose={() => setOpenFichaCliente(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Ficha del Cliente</DialogTitle>
              <DialogContent dividers>
                {values.cliente ? (
                  <Box>
                    <Typography>
                      <strong>Nombre:</strong> {values.cliente.nombre}
                    </Typography>
                    <Typography>
                      <strong>DNI:</strong> {values.cliente.dni}
                    </Typography>
                    <Typography>
                      <strong>CUIT:</strong> {values.cliente.cuit}
                    </Typography>
                    {/* Agrega más información según tus necesidades */}
                  </Box>
                ) : (
                  <Typography>No hay cliente seleccionado.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenFichaCliente(false)} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Diálogo para Ver CC */}
            <Dialog
              open={openCC}
              onClose={() => setOpenCC(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Cuenta Corriente del Cliente</DialogTitle>
              <DialogContent dividers>
                {values.cliente ? (
                  <Box>
                    {/* Información de Cuenta Corriente */}
                    <Typography>
                      <strong>Saldo Actual:</strong> $1,000.00
                    </Typography>
                    <Typography>
                      <strong>Última Transacción:</strong> 2024-04-25
                    </Typography>
                    {/* Agrega más información según tus necesidades */}
                  </Box>
                ) : (
                  <Typography>No hay cliente seleccionado.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenCC(false)} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Diálogo para Información de Impuestos */}
            <Dialog
              open={openInfoImpuestos}
              onClose={() => setOpenInfoImpuestos(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Información sobre Impuestos</DialogTitle>
              <DialogContent dividers>
                <Box>
                  <Typography>
                    <strong>10.5% IVA:</strong> Aplicado a ciertos productos.
                  </Typography>
                  <Typography>
                    <strong>21% IVA:</strong> Aplicado a otros productos.
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenInfoImpuestos(false)} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Diálogo para Opciones de Pago */}
            <Dialog
              open={openPago}
              onClose={() => setOpenPago(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Opciones de Pago</DialogTitle>
              <DialogContent dividers>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
                  <Select
                    labelId="metodo-pago-label"
                    id="metodoPago"
                    value={metodoPago}
                    onChange={(e) => {
                      setMetodoPago(e.target.value);
                      // Si se selecciona Tarjeta, aplicar recargo automáticamente
                      if (e.target.value === "tarjeta") {
                        setFieldValue("recargo", 5); // Por ejemplo, 5%
                      } else {
                        setFieldValue("recargo", 0);
                      }
                    }}
                    label="Método de Pago"
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="tarjeta">Tarjeta</MenuItem>
                    <MenuItem value="qr">QR</MenuItem>
                    <MenuItem value="transferencia">Transferencia</MenuItem>
                  </Select>
                </FormControl>

                {/* Campo para pagos fraccionados */}
                <Box mt="20px">
                  <Typography variant="h6">Pagos Fraccionados</Typography>
                  {pagos.map((pago, index) => (
                    <Grid container spacing={2} alignItems="center" key={index}>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined" margin="normal">
                          <InputLabel id={`pago-metodo-${index}`}>Método</InputLabel>
                          <Select
                            labelId={`pago-metodo-${index}`}
                            id={`pago-metodo-${index}`}
                            value={pago.metodo}
                            onChange={(e) => {
                              const newPagos = [...pagos];
                              newPagos[index].metodo = e.target.value;
                              setPagos(newPagos);
                            }}
                            label="Método"
                          >
                            <MenuItem value="efectivo">Efectivo</MenuItem>
                            <MenuItem value="tarjeta">Tarjeta</MenuItem>
                            <MenuItem value="qr">QR</MenuItem>
                            <MenuItem value="transferencia">Transferencia</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          label="Monto"
                          value={pago.monto}
                          onChange={(e) => {
                            const newPagos = [...pagos];
                            newPagos[index].monto = parseFloat(e.target.value);
                            setPagos(newPagos);
                          }}
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const newPagos = pagos.filter((_, i) => i !== index);
                            setPagos(newPagos);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setPagos([...pagos, { metodo: "", monto: 0 }])}
                    sx={{ mt: 2 }}
                  >
                    Agregar Pago
                  </Button>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPago(false)} color="secondary">
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Validar que la suma de pagos cubra el total
                    const totalFactura = (
                      values.conceptos.reduce(
                        (acc, curr) => acc + parseFloat(curr.subtotal || 0),
                        0
                      ) +
                      parseFloat(values.recargo || 0) -
                      (values.descuento / 100) *
                        values.conceptos.reduce(
                          (acc, curr) => acc + parseFloat(curr.subtotal || 0),
                          0
                        ) +
                      parseFloat(values.percepcion || 0)
                    );

                    const totalPagos = pagos.reduce((acc, pago) => acc + pago.monto, 0);

                    if (totalPagos >= totalFactura) {
                      // Procesar los pagos
                      console.log("Método de Pago:", metodoPago);
                      console.log("Pagos Fraccionados:", pagos);
                      setOpenPago(false);
                      resetForm();
                      setMetodoPago("");
                      setPagos([]);
                    } else {
                      alert("La suma de los pagos no cubre el total de la factura.");
                    }
                  }}
                  color="primary"
                  variant="contained"
                  disabled={
                    metodoPago === "" ||
                    pagos.length === 0 ||
                    pagos.some((pago) => !pago.metodo || !pago.monto) ||
                    pagos.reduce((acc, pago) => acc + pago.monto, 0) <
                      (
                        values.conceptos.reduce(
                          (acc, curr) => acc + parseFloat(curr.subtotal || 0),
                          0
                        ) +
                        parseFloat(values.recargo || 0) -
                        (values.descuento / 100) *
                          values.conceptos.reduce(
                            (acc, curr) => acc + parseFloat(curr.subtotal || 0),
                            0
                          ) +
                        parseFloat(values.percepcion || 0)
                      )
                  }
                >
                  Procesar Pago
                </Button>
              </DialogActions>
            </Dialog>
          </form>
        )}
      </Formik>

      {/* Diálogo para Información de Impuestos */}
      <Dialog
        open={openInfoImpuestos}
        onClose={() => setOpenInfoImpuestos(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Información sobre Impuestos</DialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography>
              <strong>10.5% IVA:</strong> Aplicado a ciertos productos.
            </Typography>
            <Typography>
              <strong>21% IVA:</strong> Aplicado a otros productos.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfoImpuestos(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacturacionElectronica;
