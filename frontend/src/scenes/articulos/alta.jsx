import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, CircularProgress, Box, Typography, useTheme, FormControlLabel, Checkbox, Grid, Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createArticulo } from '../../config/LlamadaDB';
import { getAllCategorias } from "../../config/CategoriaDB";
import { getAllPromociones } from "../../config/PromocionDB";
import { tokens } from "../../theme";
import { getAllIvas } from "../../config/IvaDB";
import { getAllProveedores } from "../../config/ProveedorDB";
import Modal from "../../components/ModalError";

const AltaArticulo = ({ open, onClose, articuloEditando, onArticuloCreado }) => {
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

  // Estado para el nuevo artículo
  const [nuevoArticulo, setNuevoArticulo] = useState({
    idCategoria: '', // Solo el ID de la categoría
    idPromocionCantidad: '',
    idProveedor1: '', // Proveedor Principal
    idProveedor2: '',  // Proveedor Auxiliar
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
    activo: 0, // Campo para "Artículo Activo"
    HabPrecioManual: 0, // Campo para "El precio se colocará en el momento de la venta"
    NoAplicaStock: 0, // Campo para "Artículo sin control de stock"
    NoAplicarDescuento: 0, // Campo para "No aplicar descuento"
    EmailPorBajoStock: 0, // Campo para "Enviar alerta de stock bajo por Email"
    HabNroSerie: 0, // Campo para "Habilitar número de serie"

    // Nuevos campos para Elaboración y Vencimiento
    AplicaElab: 0, // 1 si está activo, 0 si no
    FechaElab: '', // Fecha de Elaboración
    AplicaVto: 0, // 1 si está activo, 0 si no
    FechaVto: '', // Fecha de Vencimiento

    // Campos para Costo Dólar
    HabCostoDolar: 0, // 1 si está activo, 0 si no
    CostoDolar: '', // Valor del costo en dó

    // Permitir modificar precio
    permitirModificarPrecio: 0, // 1 si está activo, 0 si no

    Imagen: '', 
    ImagenUrl: '' // Para la imagen existente
  });


  useEffect(() => {
    if (error) {
      setModalVisible(true);
      const timer = setTimeout(() => {
        setModalVisible(false);
        setError(null); // Opcional, si quieres limpiar el error
      }, 3000); // El modal estará visible durante 3 segundos

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (articuloEditando) {  // Verificar si articuloEditando no es null
      console.log("Valor de FechaVto:", articuloEditando.FechaVto);


      const fechaVto = articuloEditando.FechaVto ? new Date(articuloEditando.FechaVto) : null;
      const formattedFechaVto = fechaVto ? fechaVto.toISOString().split("T")[0] : null; // Cambia a null
      
      const fechaElab = articuloEditando.FechaElab ? new Date(articuloEditando.FechaElab) : null;
      const formattedFechaElab = fechaElab ? fechaElab.toISOString().split("T")[0] : null; // Cambia a null
      
      // Cargar los valores del artículo seleccionado para editar
      setNuevoArticulo({
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
        FechaVto: formattedFechaVto || null, // Asignar la fecha formateada
        HabCostoDolar: articuloEditando.HabCostoDolar || 0,
        CostoDolar: articuloEditando.CostoDolar || '',
        permitirModificarPrecio: articuloEditando.permitirModificarPrecio || 0,
        ImagenUrl: articuloEditando.Imagen || '',
      });
      console.log("Valor de FechaVto formateado:", formattedFechaVto); // Aquí logueas el valor formateado de FechaVto
      setImage(articuloEditando.Imagen ? articuloEditando.Imagen : null); 
    } else {
      // Opcionalmente puedes resetear nuevoArticulo si articuloEditando es null
      setNuevoArticulo({
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
  
  // Obtener categorías, IVAs, promociones y proveedores cuando el diálogo se abre
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
      setImage(URL.createObjectURL(file));
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
    const costo = nuevoArticulo.Costo;
    setNuevoArticulo(prevState => ({
      ...prevState,
      PrecioPublico: value,
      Ganancia: ((value - costo) / costo) * 100,
    }));
  };

  const handleCostoChange = (value) => {
    setNuevoArticulo(prevState => {
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
  
  const handleIvaChange = (value) => {
    const ivaParsed = parseFloat(value).toFixed(4); // Asegúrate de mantener 4 decimales
    setNuevoArticulo(prevState => {
      const costo = prevState.Costo;
      const ganancia = prevState.Ganancia;
      const precioVentaCalculado = calcularPrecioVenta(costo, ganancia, parseFloat(ivaParsed));
      return {
        ...prevState,
        Iva: ivaParsed, // Guardar IVA en el mismo formato de 4 decimales
        PrecioPublico: precioVentaCalculado,
      };
    });
  };

  const handleStockChange = (value) => {
    setNuevoArticulo(prevState => ({
      ...prevState,
      Stock: Number(value), // Actualiza el stock
    }));
  };

  const handleStockMinChange = (value) => {
    setNuevoArticulo(prevState => ({
      ...prevState,
      StockMin: Number(value), // Actualiza el stock mínimo
    }));
  };

  const handleRentabilidadChange = (value) => {
    setNuevoArticulo(prevState => {
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

  const handleSubmit = async () => {
    // Reinicia el estado de error
    setError(null);
  
    // Validación de datos
    if (
      !nuevoArticulo.idCategoria ||
      nuevoArticulo.idPromocionCantidad === '' || 
      !nuevoArticulo.idProveedor1 ||
      !nuevoArticulo.idProveedor2 ||
      !nuevoArticulo.CodigoBarra ||
      !nuevoArticulo.Nombre ||
      !nuevoArticulo.Lote ||
      !nuevoArticulo.Ubicacion ||
      isNaN(nuevoArticulo.Stock) ||
      isNaN(nuevoArticulo.StockMin) ||
      (nuevoArticulo.SKU !== undefined && isNaN(nuevoArticulo.SKU)) ||
      isNaN(nuevoArticulo.Costo) ||
      isNaN(nuevoArticulo.Ganancia) ||
      !nuevoArticulo.Iva ||
      isNaN(nuevoArticulo.PrecioPublico)
    ) {
      setError('Por favor, completa todos los campos requeridos.');
      setModalVisible(true);
      return;
    }
  
    // Validación adicional para fechas y costo dólar
    if (nuevoArticulo.AplicaElab === 1 && !nuevoArticulo.FechaElab) {
      setError('Por favor, proporciona la Fecha de Elaboración.');
      setModalVisible(true);
      return;
    }
  
    if (nuevoArticulo.AplicaVto === 1 && !nuevoArticulo.FechaVto) {
      setError('Por favor, proporciona la Fecha de Vencimiento.');
      setModalVisible(true);
      return;
    }
  
    if (nuevoArticulo.HabCostoDolar === 1 && !nuevoArticulo.CostoDolar) {
      setError('Por favor, proporciona el Costo en Dólar.');
      setModalVisible(true);
      return;
    }
  
    setLoading(true); // Activa el loading
    try {
      const formData = new FormData();
      formData.append('CodigoBarra', nuevoArticulo.CodigoBarra);
      formData.append('Nombre', nuevoArticulo.Nombre);
      formData.append('Lote', nuevoArticulo.Lote);
      formData.append('Ubicacion', nuevoArticulo.Ubicacion);
      formData.append('Stock', nuevoArticulo.Stock);
      formData.append('Codigo', Number(nuevoArticulo.SKU));
      formData.append('Costo', nuevoArticulo.Costo);
      formData.append('PrecioPublico', nuevoArticulo.PrecioPublico);
      formData.append('Iva', parseFloat(nuevoArticulo.Iva));
      formData.append('idCategoria', nuevoArticulo.idCategoria);
      formData.append('idPromocionCantidad', Number(nuevoArticulo.idPromocionCantidad));
      formData.append('idProveedor1', nuevoArticulo.idProveedor1);
      formData.append('idProveedor2', nuevoArticulo.idProveedor2 || '');
      formData.append('StockMin', nuevoArticulo.StockMin);
      formData.append('Ganancia', nuevoArticulo.Ganancia);
      formData.append('Descripcion', nuevoArticulo.Descripcion);
      formData.append('activo', nuevoArticulo.activo);
      formData.append('HabPrecioManual', nuevoArticulo.HabPrecioManual);
      formData.append('NoAplicaStock', nuevoArticulo.NoAplicaStock);
      formData.append('NoAplicarDescuento', nuevoArticulo.NoAplicarDescuento);
      formData.append('EmailPorBajoStock', nuevoArticulo.EmailPorBajoStock);
      formData.append('HabNroSerie', nuevoArticulo.HabNroSerie);
      formData.append('AplicaElab', nuevoArticulo.AplicaElab);
      formData.append('FechaElab', nuevoArticulo.AplicaElab === 1 ? nuevoArticulo.FechaElab : null);
      formData.append('AplicaVto', nuevoArticulo.AplicaVto);
      formData.append('FechaVto', nuevoArticulo.AplicaVto === 1 ? nuevoArticulo.FechaVto : null);
      formData.append('HabCostoDolar', nuevoArticulo.HabCostoDolar);
      formData.append('CostoDolar', nuevoArticulo.HabCostoDolar === 1 ? nuevoArticulo.CostoDolar : null);
      formData.append('permitirModificarPrecio', nuevoArticulo.permitirModificarPrecio);
  
      // Agregar la imagen si existe
      if (image) {
        formData.append('Imagen', image);
      } else if (nuevoArticulo.ImagenUrl) {
        formData.append('Imagen', nuevoArticulo.ImagenUrl); // La imagen actual ya existente
      }


      console.log('FormData para crear artículo:', nuevoArticulo);
      await createArticulo(formData); // Asegúrate de que createArticulo acepte FormData
  
      alert('Artículo creado con éxito');
      onArticuloCreado();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al crear artículo:', error);
      setError('Error al crear el artículo: ' + (error.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false); // Desactiva el loading
    }
  };
  

  const handleModalClose = () => {
    setModalVisible(false); // Cierra el modal
    setError(null); // Reinicia el estado de error al cerrar
  };
  

  const resetForm = () => {
    setNuevoArticulo({
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

  const handleImageRemove = () => {
    setImage(null);
    setNuevoArticulo((prevState) => ({
      ...prevState,
      Imagen: '', // Limpiar la URL de la imagen
    }));
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
                    <Checkbox checked={nuevoArticulo.activo === 1} onChange={(e) =>setNuevoArticulo({...nuevoArticulo, activo: e.target.checked ? 1 : 0, }) } />
                  }
                  label="Artículo Activo"
                />
              </Grid>

              {/* Campos principales con títulos */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={nuevoArticulo.Nombre}
                  onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, Nombre: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
                <TextField
                  select
                  label="Categoría"
                  value={nuevoArticulo.idCategoria} // Usar idCategoria como valor
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setNuevoArticulo({
                      ...nuevoArticulo,
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
                  value={nuevoArticulo.SKU}
                  onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, SKU: Number(e.target.value) })}
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
                  value={nuevoArticulo.Ubicacion}
                  onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, Ubicacion: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
                <TextField
                  label="Stock Inicial"
                  type="number"
                  value={nuevoArticulo.Stock || '0'} // Si es 0, muestra placeholder
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
                  value={nuevoArticulo.StockMin || '0'} // Si es 0, muestra placeholder
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
                  value={nuevoArticulo.CodigoBarra}
                  onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, CodigoBarra: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>

              {/* Costo y Costo en Dólar alineados */}
              <Grid item xs={12} sm={6} sx={{ mt: -3 }}>
                <TextField
                  label="Precio de Costo"
                  type="number"
                  value={nuevoArticulo.Costo} // Si es 0, muestra placeholder
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
                      checked={nuevoArticulo.HabCostoDolar === 1}
                      onChange={(e) =>
                        setNuevoArticulo({
                          ...nuevoArticulo,
                          HabCostoDolar: e.target.checked ? 1 : 0,
                          CostoDolar: e.target.checked ? nuevoArticulo.CostoDolar : '', // Limpiar valor si no aplica
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
                  disabled={nuevoArticulo.HabCostoDolar !== 1}
                  value={nuevoArticulo.CostoDolar}
                  onChange={(e) =>
                    setNuevoArticulo({
                      ...nuevoArticulo,
                      CostoDolar: Number(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
                <TextField
                  label="Ganancia (%)"
                  type="number"
                  value={nuevoArticulo.Ganancia} // Si es 0, muestra placeholder
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
                  value={nuevoArticulo.Iva}
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
                  value={nuevoArticulo.PrecioPublico} // Si es 0, muestra placeholder
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
                  value={nuevoArticulo.idPromocionCantidad} // Usar idPromocionCantidad como valor
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setNuevoArticulo({
                      ...nuevoArticulo,
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
    value={nuevoArticulo.idProveedor1}
    onChange={(e) => {
      const selectedId = e.target.value;
      setNuevoArticulo({
        ...nuevoArticulo,
        idProveedor1: selectedId,
      });
    }}
    fullWidth
    margin="normal"
  >
    {proveedores.map((proveedor) => {
      return (
        <MenuItem key={`principal-${proveedor.idProveedor}`} value={proveedor.idProveedor}>
          {proveedor.RazonSocial}
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
    value={nuevoArticulo.idProveedor2}
    onChange={(e) => {
      const selectedId = e.target.value;
      setNuevoArticulo({
        ...nuevoArticulo,
        idProveedor2: selectedId,
      });
    }}
    fullWidth
    margin="normal"
  >
    {proveedores.map((proveedor) => {
      return (
        <MenuItem key={`auxiliar-${proveedor.idProveedor}`} value={proveedor.idProveedor}>
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
                  value={nuevoArticulo.Descripcion}
                  onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, Descripcion: e.target.value })}
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
                      checked={nuevoArticulo.AplicaVto === 1}
                      onChange={(e) =>
                        setNuevoArticulo({
                          ...nuevoArticulo,
                          AplicaVto: e.target.checked ? 1 : 0,
                          FechaVto: e.target.checked ? nuevoArticulo.FechaVto : '', // Limpiar fecha si no aplica
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
          disabled={nuevoArticulo.AplicaVto !== 1} // Deshabilitar según la lógica
          value={nuevoArticulo.FechaVto} // Asigna el valor de la fecha
          onChange={(e) =>
            setNuevoArticulo({
              ...nuevoArticulo,
              FechaVto: e.target.value, // Actualiza el estado al cambiar
            })
          }
        />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ mt: -5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={nuevoArticulo.AplicaElab === 1}
                      onChange={(e) =>
                        setNuevoArticulo({
                          ...nuevoArticulo,
                          AplicaElab: e.target.checked ? 1 : 0,
                          FechaElab: e.target.checked ? nuevoArticulo.FechaElab : '', // Limpiar fecha si no aplica
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
                  disabled={nuevoArticulo.AplicaElab !== 1}
                  value={nuevoArticulo.FechaElab}
                  onChange={(e) =>
                    setNuevoArticulo({
                      ...nuevoArticulo,
                      FechaElab: e.target.value,
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={0} sx={{ mt: -3 }}>
                <TextField
                  label="Lote"
                  value={nuevoArticulo.Lote}
                  onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, Lote: e.target.value })}
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
                          checked={nuevoArticulo.HabPrecioManual === 1}
                          onChange={(e) =>
                            setNuevoArticulo({
                              ...nuevoArticulo,
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
                          checked={nuevoArticulo.NoAplicaStock === 1}
                          onChange={(e) =>
                            setNuevoArticulo({
                              ...nuevoArticulo,
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
                          checked={nuevoArticulo.NoAplicarDescuento === 1}
                          onChange={(e) =>
                            setNuevoArticulo({
                              ...nuevoArticulo,
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
                          checked={nuevoArticulo.EmailPorBajoStock === 1}
                          onChange={(e) =>
                            setNuevoArticulo({
                              ...nuevoArticulo,
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
                          checked={nuevoArticulo.permitirModificarPrecio === 1}
                          onChange={(e) =>
                            setNuevoArticulo({
                              ...nuevoArticulo,
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
                          checked={nuevoArticulo.HabNroSerie === 1}
                          onChange={(e) =>
                            setNuevoArticulo({
                              ...nuevoArticulo,
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
    <Button onClick={handleSubmit} color="secondary" disabled={loading}>
  {loading ? (
    <CircularProgress size={24} />
  ) : (
    articuloEditando ? 'Modificar Artículo' : 'Crear Artículo'
  )}
</Button>

      </DialogActions>
    </Dialog>
  );
};

export default AltaArticulo;
