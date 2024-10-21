import React, { useEffect, useState } from 'react';
import Header from "../../components/Header";
import { getAllClientes } from '../../config/ClienteDB';
import { getAllArticulos } from '../../config/LlamadaDB';
import { Autocomplete, Box, Button, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { MenuItem } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TableFactura from './Tabla';
import BuscarCliente from './BuscarCliente';
import Ficheros from './Ficheros'; // Asegúrate de que la ruta sea correcta


    // Función para obtener la fecha y hora actual en formato YYYY-MM-DDTHH:MM
    const getInitialDateTime = () => {
        const now = new Date();
        const localDate = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // Restar 3 horas
        const formatted = localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        return formatted;
    };
    

const Facturacion2 = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosAgregados, setProductosAgregados] = useState([]); // Nuevo estado para los productos agregados
  const [openBuscarCliente, setOpenBuscarCliente] = useState(false); // Estado para controlar el diálogo
  const [openFichaCliente, setOpenFichaCliente] = useState(false);
  const [openCC, setOpenCC] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    tipoComprobante: '',
    numeroComprobante: '',
    fechaEmision: getInitialDateTime(),
    observaciones: '',
    cantidadProducto: 0,
    selectedProduct: null, // Asegúrate de tener un valor inicial para el producto seleccionado
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientesData = await getAllClientes();
        console.log(clientesData); // Para verificar los datos
        const productosData = await getAllArticulos();
        
        setClientes(clientesData);
        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    
    fetchData();
  }, []);


  useEffect(() => {
    // Establecer el cliente con id 101 como cliente seleccionado al cargar la página
    const clienteConId101 = clientes.find(cliente => cliente.idCliente === 101);
    setClienteSeleccionado(clienteConId101);
}, [clientes]); // Dependencia de clientes

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Asegúrate de que el valor se establece correctamente
    }));
  };
  

  const handleClienteSeleccionado = (cliente) => {
    setClienteSeleccionado(cliente);
    setOpenBuscarCliente(false); // Cerrar el diálogo después de seleccionar
};

const handleQuitarCliente = () => {
    // Quitar el cliente seleccionado
    setClienteSeleccionado(null);
    
    // Mostrar el cliente con id = 101
    const clienteConId101 = clientes.find(cliente => cliente.idCliente === 101);
    setClienteSeleccionado(clienteConId101);
};


const handleAddProduct = () => {
    const selectedProduct = productos.find(producto => 
      `${producto.CodigoBarra} - ${producto.Nombre}` === formData.selectedProduct
    );

    if (selectedProduct && formData.cantidadProducto > 0) {
        // Verificar si el producto ya está en productosAgregados
        const productoExistente = productosAgregados.find(producto => producto.idArticulo === selectedProduct.idArticulo);
        
        if (productoExistente) {
            alert("El producto ya está en la tabla.");
        } else {
            const subtotal = selectedProduct.PrecioPublico * formData.cantidadProducto;

            // Agregar el producto a productosAgregados
            setProductosAgregados(prevState => [
                ...prevState, 
                { 
                    ...selectedProduct,
                    cantidad: formData.cantidadProducto,
                    subtotal
                }
            ]);
            
            // Limpiar los campos después de agregar el producto
            setFormData({
                ...formData, 
                cantidadProducto: 0, 
                selectedProduct: '' // Reinicia el campo de búsqueda
            });
        }
    } else {
        console.log("Por favor selecciona un producto y cantidad válida");
    }
};

  return (
    <Box m="20px">
      <Header title="FACTURACIÓN ELECTRÓNICA" subtitle="Completa los datos de la factura" />
      <form>
        <Box display="grid" gap="15px" gridTemplateColumns="repeat(4, 1fr)">
          <TextField
            label="Cliente"
            variant="filled"
            name="cliente"
            size="small"
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{ gridColumn: "span 2", cursor: "pointer" }}
            value={clienteSeleccionado ? 
                `${clienteSeleccionado.Nom1 || ''} ${clienteSeleccionado.Nom2 || ''} - ${clienteSeleccionado.CUIT || 'No tiene'}`.trim() : 
                ""
            }
            onClick={() => setOpenBuscarCliente(true)} // Abre el diálogo al hacer clic
          />
                 <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            sx={{ gridColumn: "span 1" }}
            onClick={() => setOpenBuscarCliente(true)} // Abre el diálogo al hacer clic
          >
            Buscar Cliente (F4)
          </Button>
          <Box display="flex" alignItems="center" gridColumn="span 1" gap="10px">
            <Button onClick={() => setOpenFichaCliente(true)}  disabled={!clienteSeleccionado} variant="outlined" color="info" startIcon={<VisibilityIcon />}>
              Ver Ficha Cliente
            </Button>
            <Button  onClick={() => setOpenCC(true)}  disabled={!clienteSeleccionado} variant="outlined" color="info" startIcon={<VisibilityIcon />}>
              Ver CC
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleQuitarCliente}   disabled={clienteSeleccionado && clienteSeleccionado.idCliente === 101}> 
              Quitar Cliente
            </Button>
          </Box>

          <TextField
            select
            fullWidth
            size="small"
            variant="filled"
            label="Tipo de Comprobante"
            name="tipoComprobante"
            value={formData.tipoComprobante || ''} 
            onChange={handleChange}
            sx={{ gridColumn: "span 2" }}
          >
            <MenuItem value="facturacionElectronicaC">Facturación Electrónica C</MenuItem>
            <MenuItem value="facturaX">Factura X</MenuItem>
          </TextField>

          <TextField
            fullWidth
            size="small"
            variant="filled"
            label="Número de Comprobante"
            name="numeroComprobante"
            value={formData.numeroComprobante}
            onChange={handleChange}
            sx={{ gridColumn: "span 2" }}
          />

          <TextField
            fullWidth
            size="small"
            variant="filled"
            type="datetime-local"
            label="Fecha de Emisión"
            InputLabelProps={{ shrink: true }}
            name="fechaEmision"
            value={formData.fechaEmision}
            onChange={handleChange}
            sx={{ gridColumn: "span 2" }}
          />

          <FormControl component="fieldset" sx={{ gridColumn: "span 2" }}>
            <RadioGroup row name="condicionVenta" onChange={handleChange}>
              <FormControlLabel value="contado" control={<Radio />} label="CONTADO" />
              <FormControlLabel value="cuentaCorriente" control={<Radio />} label="CUENTA CORRIENTE" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            variant="filled"
            rows={2}
            label="Observaciones"
            onChange={handleChange}
            name="observaciones"
            value={formData.observaciones}
            sx={{ gridColumn: "span 4" }}
          />
        </Box>

        <Box mt="20px" mb="20px">
          <Typography variant="h6" gutterBottom>
            Agregar Producto
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
    size="small"
    options={productos}
    getOptionLabel={(option) => `${option.CodigoBarra} - ${option.Nombre}`} 
    renderInput={(params) => (
        <TextField 
            size="small" 
            {...params} 
            label="Buscar Producto" 
            variant="filled" 
        />
    )}
    value={productos.find(producto => 
        `${producto.CodigoBarra} - ${producto.Nombre}` === formData.selectedProduct) || null} 
    onChange={(event, newValue) => {
        setFormData({ 
            ...formData, 
            selectedProduct: newValue ? `${newValue.CodigoBarra} - ${newValue.Nombre}` : '' 
        });
    }}
    isOptionEqualToValue={(option, value) => option.idArticulo === value.idArticulo} // Comparar por idArticulo
/>


            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                variant="filled"
                label="Cantidad"
                type="number"
                onChange={handleChange}
                name="cantidadProducto"
                value={formData.cantidadProducto}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddProduct}
              >
                Agregar Producto
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>

         {/* Aquí se incluye el diálogo de búsqueda de clientes */}
         <BuscarCliente
                open={openBuscarCliente}
                setOpen={setOpenBuscarCliente}
                clientes={clientes}
                onClienteSeleccionado={handleClienteSeleccionado}
            />

<Ficheros
                openFichaCliente={openFichaCliente}
                setOpenFichaCliente={setOpenFichaCliente}
                openCC={openCC}
                setOpenCC={setOpenCC}
                cliente={clienteSeleccionado}
            />

      <TableFactura  tipoComprobante={formData.tipoComprobante}
            numeroComprobante={formData.numeroComprobante}
            productos={productosAgregados} setProductos={setProductos} setProductosAgregados={setProductosAgregados}
            setFormData={setFormData} getInitialDateTime={getInitialDateTime}
            clienteSeleccionado={clienteSeleccionado}
            /> {/* Pasar los productos agregados a la tabla */}
     
    </Box>
  );
};

export default Facturacion2;
