import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, CircularProgress, Box, Typography, useTheme, FormControlLabel, Checkbox, Grid, Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getAllCategorias } from "../../config/CategoriaDB";
import { getAllPromociones } from "../../config/PromocionDB";
import { tokens } from "../../theme";
import { getAllIvas } from "../../config/IvaDB";
import { getAllProveedores } from "../../config/ProveedorDB";
import Modal from "../../components/ModalError";
import { updateArticulo } from '../../config/LlamadaDB'; // Asegúrate de que esta función exista

const EditarArticulo = ({ open, onClose, articuloEditando }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Estados para datos obtenidos
  const [categorias, setCategorias] = useState([]);
  const [promocion, setPromocion] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [ivas, setIvas] = useState([]);
  
  // Estado para imagen
  const [image, setImage] = useState(null);

  const [articuloModificado, setArticuloModificado] = useState({
      idArticulo: null, // Agrega esta línea
      idCategoria: '',
      idPromocionCantidad: '',
      idProveedor1: '',
      idProveedor2: '',
      CodigoBarra: '',
      Nombre: '',
      Lote: '',
      Ubicacion: '',
      SKU: 0,
      Stock: 0,
      StockMin: 0,
      Costo: 0,
      Ganancia: 0,
      Iva: '',
      PrecioPublico: 0,
      Descripcion: '',
      activo: 0,
      HabPrecioManual: 0,
      NoAplicaStock: 0,
      NoAplicarDescuento: 0,
      EmailPorBajoStock: 0,
      HabNroSerie: 0,
      AplicaElab: 0,
      FechaElab: '',
      AplicaVto: 0,
      FechaVto: '',
      HabCostoDolar: 0,
      CostoDolar: '',
      permitirModificarPrecio: 0,
      Imagen: '',
      ImagenUrl: ''
    });


  useEffect(() => {
      if (articuloEditando) {  // Verificar si articuloEditando no es null
        console.log("Valor de FechaVto:", articuloEditando.FechaVto);
  
  
        const fechaVto = articuloEditando.FechaVto ? new Date(articuloEditando.FechaVto) : null;
        const formattedFechaVto = fechaVto ? fechaVto.toISOString().split("T")[0] : null; // Cambia a null
        
        const fechaElab = articuloEditando.FechaElab ? new Date(articuloEditando.FechaElab) : null;
        const formattedFechaElab = fechaElab ? fechaElab.toISOString().split("T")[0] : null; // Cambia a null
        
        // Cargar los valores del artículo seleccionado para editar
        setArticuloModificado({
          idArticulo: articuloEditando.idArticulo, // Agrega esta línea
          idCategoria: articuloEditando.idCategoria || '',
          idPromocionCantidad: articuloEditando.idPromocionCantidad || '',
          idProveedor1: articuloEditando.idProveedor1 || '',
          idProveedor2: articuloEditando.idProveedor2 || '',
          CodigoBarra: articuloEditando.CodigoBarra || '',
          Nombre: articuloEditando.Nombre || '',
          Lote: articuloEditando.Lote || '',
          Ubicacion: articuloEditando.Ubicacion || '',
          SKU: articuloEditando.Codigo || 0,
          Stock: articuloEditando.Stock || 0,
          StockMin: articuloEditando.StockMin || 0,
          Costo: articuloEditando.Costo || 0,
          Ganancia: articuloEditando.Ganancia || 0,
          Iva: articuloEditando.Iva || '',
          PrecioPublico: articuloEditando.PrecioPublico || 0,
          Descripcion: articuloEditando.Descripcion || '',
          activo: articuloEditando.activo || 0,
          HabPrecioManual: articuloEditando.HabPrecioManual || 0,
          NoAplicaStock: articuloEditando.NoAplicaStock || 0,
          NoAplicarDescuento: articuloEditando.NoAplicarDescuento || 0,
          EmailPorBajoStock: articuloEditando.EmailPorBajoStock || 0,
          HabNroSerie: articuloEditando.HabNroSerie || 0,
          AplicaElab: articuloEditando.AplicaElab || 0,
          FechaElab: formattedFechaElab || null,
          AplicaVto: articuloEditando.AplicaVto || 0,
          FechaVto: formattedFechaVto || null,
          HabCostoDolar: articuloEditando.HabCostoDolar || 0,
          CostoDolar: articuloEditando.CostoDolar || '',
          permitirModificarPrecio: articuloEditando.permitirModificarPrecio || 0,
          ImagenUrl: articuloEditando.Imagen || '',
      });
        console.log("Valor de FechaVto formateado:", formattedFechaVto); // Aquí logueas el valor formateado de FechaVto
        setImage(articuloEditando.Imagen ? articuloEditando.Imagen : null); 
      } else {
        // Opcionalmente puedes resetear articuloModificado si articuloEditando es null
        setArticuloModificado({
          // Valores predeterminados para un nuevo artículo
          idCategoria: '',
          idPromocionCantidad: '',
          idProveedor1: '',
          idProveedor2: '',
          CodigoBarra: '',
          Nombre: '',
          Lote: '',
          Ubicacion: '',
          SKU: 0,
          Stock: 0,
          StockMin: 0,
          Costo: 0,
          Ganancia: 0,
          Iva: '',
          PrecioPublico: 0,
          Descripcion: '',
          activo: 0,
          HabPrecioManual: 0,
          NoAplicaStock: 0,
          NoAplicarDescuento: 0,
          EmailPorBajoStock: 0,
          HabNroSerie: 0,
          AplicaElab: 0,
          FechaElab: '',
          AplicaVto: 0,
          FechaVto: '',
          HabCostoDolar: 0,
          CostoDolar: '',
          permitirModificarPrecio: 0,
          ImagenUrl: '',
        });
        setImage(null); // Limpia la imagen cuando no estás editando
      }
    }, [articuloEditando]);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [categoriasData, ivasData, promocionesData, proveedoresData] = await Promise.all([
            getAllCategorias(),
            getAllIvas(),
            getAllPromociones(),
            getAllProveedores(), // Obtener proveedores
          ]);
          setCategorias(categoriasData);
          setIvas(ivasData);
          setPromocion(promocionesData);
          setProveedores(proveedoresData); // Guardar los proveedores obtenidos
        } catch (error) {
          console.error('Error al obtener datos:', error);
          setError('No se pudieron cargar los datos.');
        } finally {
          setLoading(false);
        }
      };
  
      if (open) {
        fetchData();
      }
    }, [open]);

    // Manejar cambio de imagen
    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setImage(imageUrl); // Usa el URL del objeto para mostrar la imagen
        setArticuloModificado(prevState => ({
          ...prevState,
          Imagen: file // Guarda el archivo en el estado del artículo modificado
        }));
      }
    };
  
  
const handleCancel = () => {
  resetForm(); // Reinicia el formulario
  onClose(); // Cierra el diálogo
};

const calcularPrecioVenta = (costo, ganancia, iva) => {
  const ivaDecimal = iva ? iva / 100 : 0;
  return costo * (1 + (ganancia / 100)) * (1 + ivaDecimal);
};

const handlePrecioPublicoChange = (value) => {
  const costo = articuloModificado.Costo;
  setArticuloModificado(prevState => ({
    ...prevState,
    PrecioPublico: value,
    Ganancia: ((value - costo) / costo) * 100,
  }));
};

const handleCostoChange = (value) => {
  setArticuloModificado(prevState => {
    const ganancia = prevState.Ganancia;
    const iva = prevState.Iva;
    const precioVentaCalculado = calcularPrecioVenta(value, ganancia, iva);
    return {
      ...prevState,
      Costo: value,
      PrecioPublico: precioVentaCalculado,
    };
  });
};

const handleIvaChange = (idIva) => {
  const ivaSeleccionado = ivas.find(iva => iva.idIva === idIva); // Encuentra el IVA seleccionado

  if (ivaSeleccionado) {
      const ivaParsed = parseFloat(ivaSeleccionado.Porcentaje).toFixed(4); // Obtener el porcentaje
      setArticuloModificado(prevState => {
          const costo = prevState.Costo;
          const ganancia = prevState.Ganancia;
          const precioVentaCalculado = calcularPrecioVenta(costo, ganancia, parseFloat(ivaParsed));
          return {
              ...prevState,
              Iva: ivaParsed, // Guardar el idIva en el estado
              PrecioPublico: precioVentaCalculado,
          };
      });
  }
};


const handleStockChange = (value) => {
  setArticuloModificado(prevState => ({
    ...prevState,
    Stock: Number(value), // Actualiza el stock
  }));
};

const handleStockMinChange = (value) => {
  setArticuloModificado(prevState => ({
    ...prevState,
    StockMin: Number(value), // Actualiza el stock mínimo
  }));
};

const handleRentabilidadChange = (value) => {
  setArticuloModificado(prevState => {
    const costo = prevState.Costo;
    const iva = prevState.Iva;
    const precioVentaCalculado = calcularPrecioVenta(costo, Number(value), iva);
    return {
      ...prevState,
      Ganancia: Number(value), // Cambiado de Rentabilidad a Ganancia
      PrecioPublico: precioVentaCalculado,
    };
  });
};


const handleImageRemove = () => {
  setImage(null);
  setArticuloModificado((prevState) => ({
    ...prevState,
    Imagen: '', // Limpiar la URL de la imagen
  }));
};

const handleModalClose = () => {
  setModalVisible(false); // Cierra el modal
  setError(null); // Reinicia el estado de error al cerrar
};

const logFormData = (formData) => {
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
};

const handleSubmitEditar = async () => {
  // Reinicia el estado de error
  setError(null);
  console.log("ID Articulo:", articuloModificado.idArticulo);

  // Validación de datos
  if (
      !articuloModificado.idCategoria ||
      articuloModificado.idPromocionCantidad === '' ||
      !articuloModificado.idProveedor1 ||
      !articuloModificado.idProveedor2 ||
      !articuloModificado.CodigoBarra ||
      !articuloModificado.Nombre ||
      !articuloModificado.Lote ||
      !articuloModificado.Ubicacion ||
      isNaN(articuloModificado.Stock) ||
      isNaN(articuloModificado.StockMin) ||
      (articuloModificado.SKU !== undefined && isNaN(articuloModificado.SKU)) ||
      isNaN(articuloModificado.Costo) ||
      isNaN(articuloModificado.Ganancia) ||
      !articuloModificado.Iva || // Asegúrate de que el IVA no esté vacío
      isNaN(articuloModificado.PrecioPublico)
  ) {
      setError('Por favor, completa todos los campos requeridos.');
      setModalVisible(true);
      return;
  }

  // Validación adicional para fechas y costo dólar
  if (articuloModificado.AplicaElab === 1 && !articuloModificado.FechaElab) {
      setError('Por favor, proporciona la Fecha de Elaboración.');
      setModalVisible(true);
      return;
  }

  if (articuloModificado.AplicaVto === 1 && !articuloModificado.FechaVto) {
      setError('Por favor, proporciona la Fecha de Vencimiento.');
      setModalVisible(true);
      return;
  }

  if (articuloModificado.HabCostoDolar === 1 && !articuloModificado.CostoDolar) {
      setError('Por favor, proporciona el Costo en Dólar.');
      setModalVisible(true);
      return;
  }

  setLoading(true); // Activa el loading
  try {
      const formData = new FormData();
      formData.append('idArticulo', articuloModificado.idArticulo);
      formData.append('CodigoBarra', articuloModificado.CodigoBarra);
      formData.append('Nombre', articuloModificado.Nombre);
      formData.append('Lote', articuloModificado.Lote);
      formData.append('Ubicacion', articuloModificado.Ubicacion);
      formData.append('Stock', articuloModificado.Stock);
      formData.append('SKU', articuloModificado.SKU ? Number(articuloModificado.SKU) : null);
      formData.append('Costo', articuloModificado.Costo);
      formData.append('PrecioPublico', articuloModificado.PrecioPublico);
      formData.append('Iva', parseFloat(articuloModificado.Iva));
      formData.append('idCategoria', articuloModificado.idCategoria);
      formData.append('idPromocionCantidad', Number(articuloModificado.idPromocionCantidad));
      formData.append('idProveedor1', articuloModificado.idProveedor1);
      formData.append('idProveedor2', articuloModificado.idProveedor2 || '');
      formData.append('StockMin', articuloModificado.StockMin);
      formData.append('Ganancia', articuloModificado.Ganancia);
      formData.append('Descripcion', articuloModificado.Descripcion);
      formData.append('activo', articuloModificado.activo);
      formData.append('HabPrecioManual', articuloModificado.HabPrecioManual);
      formData.append('NoAplicaStock', articuloModificado.NoAplicaStock);
      formData.append('NoAplicarDescuento', articuloModificado.NoAplicarDescuento);
      formData.append('EmailPorBajoStock', articuloModificado.EmailPorBajoStock);
      formData.append('HabNroSerie', articuloModificado.HabNroSerie);
      formData.append('AplicaElab', articuloModificado.AplicaElab);
      formData.append('FechaElab', articuloModificado.AplicaElab === 1 ? articuloModificado.FechaElab : null);
      formData.append('AplicaVto', articuloModificado.AplicaVto);
      formData.append('FechaVto', articuloModificado.AplicaVto === 1 ? articuloModificado.FechaVto : null);
      formData.append('HabCostoDolar', articuloModificado.HabCostoDolar);
      formData.append('CostoDolar', articuloModificado.HabCostoDolar === 1 ? articuloModificado.CostoDolar : null);
      formData.append('permitirModificarPrecio', articuloModificado.permitirModificarPrecio);

      if (!articuloModificado.Imagen) {
        formData.append('Imagen', ''); // Agregar un valor vacío para indicar que se eliminará
      } else {
        formData.append('Imagen', articuloModificado.Imagen);
      }
      
      // Loguear el contenido de FormData
      for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
      }

      logFormData(formData); // Log de los valores de FormData
      console.log('IVA a enviar:', articuloModificado.Iva);


      await updateArticulo(articuloModificado.idArticulo, formData);
      alert('Artículo editado con éxito');
     
      resetForm();
      onClose();
  } catch (error) {
      console.error('Error al editar artículo:', error);
      setError('Error al editar el artículo: ' + (error.response?.data?.error || 'Error desconocido'));
  } finally {
      setLoading(false); // Desactiva el loading
  }
};



const resetForm = () => {
  setArticuloModificado({
    idCategoria: '', // Reinicia el id de categoría
    idPromocionCantidad: '',
    idProveedor1: '',
    idProveedor2: '',
    CodigoBarra: '',
    Nombre: '',
    Lote: '',
    Ubicacion: '',
    SKU: 0,
    Stock: 0,
    StockMin: 0,
    Costo: 0,
    Ganancia: 0,
    Iva: '',
    PrecioPublico: 0,
    Descripcion: '',
    activo: 0,
    HabPrecioManual: 0,
    NoAplicaStock: 0,
    NoAplicarDescuento: 0,
    EmailPorBajoStock: 0,
    HabNroSerie: 0,
    AplicaElab: 0,
    FechaElab: '',
    AplicaVto: 0,
    FechaVto: '',
    HabCostoDolar: 0,
    CostoDolar: '',
    permitirModificarPrecio: 0,
  });
  setImage(null); // Reinicia la imagen
};

return (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle sx={{ backgroundColor: colors.primary[400], textAlign: "center", fontSize: "1.5rem"}}>
      {articuloEditando ? 'Modificar Artículo' : 'Agregar Artículo'}
    </DialogTitle>

    <DialogContent sx={{ backgroundColor: colors.primary[400],}}>
      <Box m="10px">
        <Box m="0px 0" p="20px" borderRadius="8px"
          sx={{ backgroundColor: colors.primary[400], "& .MuiFormControl-root": { marginBottom: "20px" },}}>

          <Grid container spacing={3}>
            {/* Sección de Producto / Servicio y Activo */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Checkbox />}
                label="Producto"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Servicio"
              />
              <FormControlLabel
                control={
                  <Checkbox checked={articuloModificado.activo === 1} onChange={(e) =>setArticuloModificado({...articuloModificado, activo: e.target.checked ? 1 : 0, }) } />
                }
                label="Artículo Activo"
              />
            </Grid>

            {/* Campos principales con títulos */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                value={articuloModificado.Nombre || ''}
                onChange={(e) => setArticuloModificado({ ...articuloModificado, Nombre: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                select
                label="Categoría"
                value={articuloModificado.idCategoria || ''} // Usar idCategoria como valor
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setArticuloModificado({
                    ...articuloModificado,
                    idCategoria: selectedId
                  });
                }}
                fullWidth
                margin="normal"
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* SKU, Ubicación, Stock */}
            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="SKU"
                type="number"
                value={articuloModificado.SKU || ''}
                onChange={(e) => setArticuloModificado({ ...articuloModificado, SKU: Number(e.target.value) })}
                fullWidth
                margin="normal"
                InputProps={{
                  sx: {
                    '& input[type=number]::-webkit-inner-spin-button': {
                      display: 'none',
                    },
                    '& input[type=number]::-webkit-outer-spin-button': {
                      display: 'none',
                    },
                    '& input[type=number]': {
                      '-moz-appearance': 'textfield', // Oculta las flechas en Firefox
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="Ubicación"
                value={articuloModificado.Ubicacio || ''}
                onChange={(e) => setArticuloModificado({ ...articuloModificado, Ubicacion: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="Stock Inicial"
                type="number"
                value={articuloModificado.Stock || '0'} // Si es 0, muestra placeholder
                placeholder="0"
                onChange={(e) => handleStockChange(e.target.value)} // Actualiza el stock
                fullWidth
                margin="normal"
                InputLabelProps={{
                  sx: { fontSize: '1.2rem' } // Ajusta el tamaño del label aquí
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="Stock Mínimo"
                type="number"
                value={articuloModificado.StockMin || '0'} // Si es 0, muestra placeholder
                placeholder="0"
                onChange={(e) => handleStockMinChange(e.target.value)} // Actualiza el stock mínimo
                fullWidth
                margin="normal"
                InputLabelProps={{
                  sx: { fontSize: '1.2rem' } // Ajusta el tamaño del label aquí
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="Código de Barras"
                value={articuloModificado.CodigoBarra || '0'}
                onChange={(e) => setArticuloModificado({ ...articuloModificado, CodigoBarra: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>

            {/* Costo y Costo en Dólar alineados */}
            <Grid item xs={12} sm={6} sx={{ mt: -3 }}>
              <TextField
                label="Precio de Costo"
                type="number"
                value={articuloModificado.Costo || ''} // Si es 0, muestra placeholder
                onChange={(e) => handleCostoChange(Number(e.target.value))} // Actualiza el costo
                fullWidth
                margin="normal"
                InputLabelProps={{
                  sx: { fontSize: '1.2rem' } // Ajusta el tamaño del label aquí
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articuloModificado.HabCostoDolar === 1}
                    onChange={(e) =>
                      setArticuloModificado({
                        ...articuloModificado,
                        HabCostoDolar: e.target.checked ? 1 : 0,
                        CostoDolar: e.target.checked ? articuloModificado.CostoDolar : '', // Limpiar valor si no aplica
                      })
                    }
                  />
                }
                label="Costo Dólar"
              />
              <TextField
                label="Costo Dólar"
                type="number"
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={articuloModificado.HabCostoDolar !== 1}
                value={articuloModificado.CostoDolar || ''}
                onChange={(e) =>
                  setArticuloModificado({
                    ...articuloModificado,
                    CostoDolar: Number(e.target.value),
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="Ganancia (%)"
                type="number"
                value={articuloModificado.Ganancia || '0'} // Si es 0, muestra placeholder
                onChange={(e) => handleRentabilidadChange(Number(e.target.value))} // Actualiza la rentabilidad
                fullWidth
                margin="normal"
                InputLabelProps={{
                  sx: { fontSize: '1.2rem' } // Ajusta el tamaño del label aquí
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                select
                label="IVA"
                value={articuloModificado.Iva || ''}
                onChange={(e) => handleIvaChange(e.target.value)}
                fullWidth
                margin="normal"
              >
                {ivas.map((iva) => (
                  <MenuItem key={iva.idIva} value={iva.Porcentaje}>
                    {iva.Nombre} ({iva.Porcentaje}%)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                label="Precio Público"
                type="number"
                value={articuloModificado.PrecioPublico || '0'} // Si es 0, muestra placeholder
                onChange={(e) => handlePrecioPublicoChange(Number(e.target.value))} // Actualiza el precio público
                fullWidth
                margin="normal"
              />
            </Grid>

            {/* Código de barras y otros datos */}
            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <TextField
                select
                label="Asociar a Promoción"
                value={articuloModificado.idPromocionCantidad || ''} // Usar idPromocionCantidad como valor
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setArticuloModificado({
                    ...articuloModificado,
                    idPromocionCantidad: Number(selectedId)
                  });
                }}
                fullWidth
                margin="normal"
              >
                {promocion.map((promo) => (
                  <MenuItem key={promo.idPromocionCantidad} value={promo.idPromocionCantidad}>
                    {promo.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Proveedor Principal */}
            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
<TextField
  select
  label="Proveedor Principal"
  value={articuloModificado.idProveedor1 || ''}
  onChange={(e) => {
    const selectedId = e.target.value;
    setArticuloModificado({
      ...articuloModificado,
      idProveedor1: selectedId,
    });
  }}
  fullWidth
  margin="normal"
>
  {proveedores.map((proveedor1) => {
    return (
      <MenuItem key={proveedor1.idProveedor1} value={proveedor1.idProveedor}>
        {proveedor1.RazonSocial}
      </MenuItem>
    );
  })}
</TextField>
</Grid>

{/* Proveedor Auxiliar */}
<Grid item xs={12} sm={6} sx={{ mt: -5 }}>
<TextField
  select
  label="Proveedor Auxiliar"
  value={articuloModificado.idProveedor2 || ''}
  onChange={(e) => {
    const selectedId = e.target.value;
    setArticuloModificado({
      ...articuloModificado,
      idProveedor2: selectedId,
    });
  }}
  fullWidth
  margin="normal"
>
  {proveedores.map((proveedor) => {
    return (
      <MenuItem key={proveedor.idProveedor2} value={proveedor.idProveedor}>
        {proveedor.RazonSocial}
      </MenuItem>
    );
  })}
</TextField>
</Grid>

            {/* Descripción */}
            <Grid item xs={12} sm={12} sx={{ mt: -5 }}>
              <TextField
                label="Descripción"
                value={articuloModificado.Descripcion || ''}
                onChange={(e) => setArticuloModificado({ ...articuloModificado, Descripcion: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>

            {/* Perecederos */}
            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articuloModificado.AplicaVto === 1}
                    onChange={(e) =>
                      setArticuloModificado({
                        ...articuloModificado,
                        AplicaVto: e.target.checked ? 1 : 0,
                        FechaVto: e.target.checked ? articuloModificado.FechaVto : '', // Limpiar fecha si no aplica
                      })
                    }
                  />
                }
                label="Perecederos con vencimiento"
              />
              <TextField
        label="Fecha de Vencimiento"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        disabled={articuloModificado.AplicaVto !== 1} // Deshabilitar según la lógica
        value={articuloModificado.FechaVto || ''} // Asigna el valor de la fecha
        onChange={(e) =>
          setArticuloModificado({
            ...articuloModificado,
            FechaVto: e.target.value, // Actualiza el estado al cambiar
          })
        }
      />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={articuloModificado.AplicaElab === 1}
                    onChange={(e) =>
                      setArticuloModificado({
                        ...articuloModificado,
                        AplicaElab: e.target.checked ? 1 : 0,
                        FechaElab: e.target.checked ? articuloModificado.FechaElab : '', // Limpiar fecha si no aplica
                      })
                    }
                  />
                }
                label="Elaboración"
              />
              <TextField
                label="Fecha de Elaboración"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={articuloModificado.AplicaElab !== 1}
                value={articuloModificado.FechaElab || ''}
                onChange={(e) =>
                  setArticuloModificado({
                    ...articuloModificado,
                    FechaElab: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={0} sx={{ mt: -3 }}>
              <TextField
                label="Lote"
                value={articuloModificado.Lote || ''}
                onChange={(e) => setArticuloModificado({ ...articuloModificado, Lote: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>

            {/* Foto del artículo */}
            <Grid item xs={12} sm={3} sx={{ mt: -3 }}>
              <Typography variant="h6">Foto del Artículo</Typography>
              <Box display="flex" alignItems="center">
                <Button variant="contained" component="label">
                  Buscar Foto
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                <Button variant="outlined" color="error" onClick={handleImageRemove} sx={{ marginLeft: "10px" }}>
                  Quitar Foto
                </Button>
              </Box>
              {image && (
                <Box mt={2}>
                  <img src={image} alt="Vista previa" style={{ maxWidth: "200px", height: "auto" }} />
                </Box>
              )}
            </Grid>

            {/* Otros checks organizados verticalmente */}
            <Grid item xs={12} sm={6} sx={{ mt: -2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={articuloModificado.HabPrecioManual === 1}
                        onChange={(e) =>
                          setArticuloModificado({
                            ...articuloModificado,
                            HabPrecioManual: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                    }
                    label="El precio se colocará en el momento de la venta"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={articuloModificado.NoAplicaStock === 1}
                        onChange={(e) =>
                          setArticuloModificado({
                            ...articuloModificado,
                            NoAplicaStock: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                    }
                    label="Artículo sin control de stock"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={articuloModificado.NoAplicarDescuento === 1}
                        onChange={(e) =>
                          setArticuloModificado({
                            ...articuloModificado,
                            NoAplicarDescuento: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                    }
                    label="No aplicar descuento"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={articuloModificado.EmailPorBajoStock === 1}
                        onChange={(e) =>
                          setArticuloModificado({
                            ...articuloModificado,
                            EmailPorBajoStock: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                    }
                    label="Enviar alerta de stock bajo por Email"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={articuloModificado.permitirModificarPrecio === 1}
                        onChange={(e) =>
                          setArticuloModificado({
                            ...articuloModificado,
                            permitirModificarPrecio: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                    }
                    label="Permitir modificar el precio durante la venta"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={articuloModificado.HabNroSerie === 1}
                        onChange={(e) =>
                          setArticuloModificado({
                            ...articuloModificado,
                            HabNroSerie: e.target.checked ? 1 : 0,
                          })
                        }
                      />
                    }
                    label="Habilitar número de serie"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Información de actualización */}
            <Grid item xs={12}>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant="body2">Última Actualización: 12/10/2024 - 14:35</Typography>
              <Typography variant="body2">Usuario que actualizó: admin</Typography>
            </Grid>
          </Grid>
        </Box>
        {isModalVisible && error && (
      <Modal message={error} onClose={handleModalClose} />
    )}
      </Box>
    </DialogContent>

    <DialogActions
      sx={{
        backgroundColor: colors.primary[400],
      }}
    >
      <Button onClick={handleCancel} color="error">Cancelar</Button>
  <Button onClick={handleSubmitEditar} color="secondary" disabled={loading}>

  <CircularProgress size={24} />

  Modificar Artículo

</Button>

    </DialogActions>
  </Dialog>
);
};

export default EditarArticulo;
