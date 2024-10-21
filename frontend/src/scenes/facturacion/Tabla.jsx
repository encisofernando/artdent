import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, Modal, FormControl, InputLabel, Select, MenuItem, TextField, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { tokens } from '../../theme';
import { DataGrid, GridFooterContainer, GridPagination } from '@mui/x-data-grid';
import BotonesFactura from './BotonesFactura';

const Tabla = ({productos, setProductosAgregados, tipoComprobante, getInitialDateTime, numeroComprobante, setFormData, clienteSeleccionado }) => {
    console.log('clientes: ', clienteSeleccionado)
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);
    const [openInfoImpuestos, setOpenInfoImpuestos] = useState(false);
    const [rows, setRows] = useState(productos);
    const [totalFinal, setTotalFinal] = useState(0); // Estado para el total final
   

    
    const [modalMessage, setModalMessage] = useState('');
    const [selectedDescuento, setSelectedDescuento] = useState(0);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [values, setValues] = useState({
        recargo: 0,
        percepcion: '',
        impuesto: 0,
    });



    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
    };

    const handleDescuentoChange = (event) => {
        setSelectedDescuento(event.target.value);
    };

    const handleDelete = (idArticulo) => {
        // Filtra las filas visibles en la tabla para eliminar el artículo correspondiente
        const updatedRows = rows.filter(row => row.idArticulo !== idArticulo);
        setRows(updatedRows); // Actualiza solo las filas de la tabla
        
        // Actualiza los productos agregados
        const updatedProductosAgregados = productos.filter(producto => producto.idArticulo !== idArticulo);
        setProductosAgregados(updatedProductosAgregados); // Actualiza el estado de productosAgregados
        
        setModalMessage(`Artículo ${idArticulo} Eliminado`);
        setOpen(true);
    };
    
  
    useEffect(() => {
        setRows(productos); // Actualiza las filas cuando cambien los productos
    }, [productos]);

    const descuentos = [
        { value: 0, label: 'Sin descuento' },
        { value: 5, label: '5%' },
        { value: 10, label: '10%' },
        { value: 15, label: '15%' }
    ];

    const percepciones = [
        { value: 0, label: "Sin Percepción" },
        { value: 1, label: "1%" },
        { value: 1.5, label: "1.5%" },
        { value: 2, label: "2%" },
      ];
    const columns = [
        { field: "CodigoBarra", headerName: "Código de Barra", flex: 1 },
        { field: "Nombre", headerName: "Nombre", flex: 1 },
        { field: "PrecioPublico", headerName: "Precio Unitario %", flex: 1 },
        { field: "cantidad", headerName: "Cantidad", flex: 1 },
        { field: "subtotal", headerName: "Subtotal $", flex: 1 },
        { 
          field: "Acciones", 
          headerName: "Acciones", 
          flex: 1, 
          renderCell: (params) => (
            <>
              <Button variant="contained" color="secondary" onClick={() => handleOpenEditar(params.row)} sx={{ mr: 1 }}>
                Modificar
              </Button>
              <Button variant="contained" color="error" onClick={() => handleDelete(params.row.idArticulo)}>
                Eliminar
              </Button>
            </>
          ),
        },
    ];

    const handleOpenEditar = (row) => {
        setModalMessage(`Artículo ${row.idArticulo} Modificado`);
        setOpen(true);
    };
    

    

    const handleClose = () => setOpen(false);


    const limpiarFilas = () => {
        setRows([]); // Limpia las filas visibles en la tabla
        setProductosAgregados([]); // Resetea los productos agregados
        setFormData({
            cliente: '',
            tipoComprobante: '', // restablecer a cadena vacía
            numeroComprobante: '', // restablecer a cadena vacía
            fechaEmision: getInitialDateTime(),
            observaciones: '',
            cantidadProducto: 0,
            selectedProduct: null, 
        });
        setValues({
            recargo: 0,
            percepcion: '',
            impuesto: 0,
        }); // Resetea los valores de recargo, percepción, y otros
        setSelectedDescuento(0); // Resetea el descuento seleccionado
        setTotalFinal(0); // Resetea el total final
    };
    

    // Calcular el total final
    const calcularTotalFinal = () => {
        const subtotalTotal = rows.reduce((acc, row) => acc + row.subtotal, 0);
        const descuentoTotal = (subtotalTotal * selectedDescuento) / 100;
        const percepcionTotal = (subtotalTotal * values.percepcion) / 100;
        const recargoTotal = parseFloat(values.recargo);

        return subtotalTotal - descuentoTotal + percepcionTotal + recargoTotal;
    };
    

    const CustomFooter = () => {

        const totalFinal = calcularTotalFinal(); // Llamar a la función para calcular el total final

        return (
            <GridFooterContainer>
                <Box display="flex" alignItems="center" pl={2}>
                   

                    {/* Recargo */}
                    <Box ml={2} display="flex" alignItems="center">
                        <Typography variant="h6" mr={1}>Recargo:</Typography>
                        <TextField
                            type="number"
                            name="recargo"
                            value={values.recargo}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: "0.01" }}
                            size="small"
                            sx={{ width: "100px" }}
                            disabled={metodoPago === "tarjeta"} // Deshabilitar si es tarjeta
                        />
                    </Box>
                    {/* Descuento */}
                    <Box ml={2} display="flex" alignItems="center">
                        <Typography variant="h6" mr={1}>Descuento:</Typography>
                        <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="descuento-label">Descuento</InputLabel>
                            <Select
                                labelId="descuento-label"
                                id="descuento"
                                name="descuento"
                                value={selectedDescuento}
                                label="Descuento"
                                onChange={handleDescuentoChange}
                            >
                                {descuentos.map((descuento) => (
                                    <MenuItem key={descuento.value} value={descuento.value}>
                                        {descuento.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    {/* Percepción */}
                    <Box ml={2} display="flex" alignItems="center">
                        <Typography variant="h6" mr={1}>Percepción:</Typography>
                        <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
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
                    </Box>
                    {/* Impuestos */}
                    <Box ml={2} display="flex" alignItems="center">
                        <Typography variant="h6" mr={1}>Impuestos:</Typography>
                        <Tooltip title="Información sobre impuestos">
                            <IconButton onClick={() => setOpenInfoImpuestos(true)}>
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {/* Total Final */}
                    <Box ml={25} display="flex" alignItems="center">
                        <Typography variant="h6" mr={1}>Total Final:</Typography>
                           <Typography variant="h6" component="div">${totalFinal.toFixed(2)}</Typography> {/* Formatear el total final */}
                    </Box>
                </Box>
                <GridPagination />
            </GridFooterContainer>
        );
    };

    return (
        <Box m="20px">
            {/* Título de la tabla centrado */}
            <Typography 
                variant="h4" 
                component="div" 
                gutterBottom 
                sx={{ textAlign: 'center' }}  // Centrado
            >
                Detalles de la factura
            </Typography>

            {/* Contenedor de la tabla */}
            <Box
                m="20px 0 0 0"
                height="33vh"
                maxWidth="100%" 
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: "none" },
                    "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
                    "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400], overflowY: 'auto' },
                    "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    getRowId={(row) => row.idArticulo}
                    autoHeight={false}  
                    components={{
                        Footer: CustomFooter, 
                    }}
                />
            </Box>

            {/* Modal para mostrar mensajes de acciones */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                  }}
                >
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {modalMessage}
                    </Typography>
                    <Button onClick={handleClose}>Cerrar</Button>
                </Box>
            </Modal>

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


                    {/* Aquí se agrega el componente BotonesFactura */}
                    <BotonesFactura  clienteSeleccionado={clienteSeleccionado} tipoComprobante={tipoComprobante} numeroComprobante={numeroComprobante} limpiarProductos={limpiarFilas} calcularTotalFinal={calcularTotalFinal} rows={rows} />
        </Box>
    );
};

export default Tabla;
