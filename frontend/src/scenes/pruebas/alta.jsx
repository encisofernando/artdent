import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, CircularProgress, Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { createArticulo } from '../../config/LlamadaDB';
import { getAllCategorias } from "../../config/CategoriaDB";
import { getAllIvas } from "../../config/IvaDB"; // Importa la función para obtener los IVAs

const AltaArticulo = ({ open, onClose, onArticuloCreado }) => {
  const [nuevoArticulo, setNuevoArticulo] = useState({
    idCategoria: '', // Solo el ID de la categoría
    CodigoBarra: '',
    Nombre: '',
    Stock: 0,
    StockMin: 0,
    Costo: 0,
    Ganancia: 0,
    Iva: '',
    PrecioPublico: 0,
    Descripcion: '',
  });
  

  const [categorias, setCategorias] = useState([]);
  const [ivas, setIvas] = useState([]); // Nuevo estado para guardar los IVAs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener categorías e IVAs cuando el diálogo se abre
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriasData, ivasData] = await Promise.all([getAllCategorias(), getAllIvas()]); // Obtener categorías e IVAs
        setCategorias(categoriasData);
        setIvas(ivasData); // Guardar los IVAs obtenidos
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
    // Validación de datos
    if (
      !nuevoArticulo.idCategoria ||
      !nuevoArticulo.CodigoBarra ||
      !nuevoArticulo.Nombre ||
      typeof nuevoArticulo.Stock !== 'number' ||
      typeof nuevoArticulo.StockMin !== 'number' ||
      typeof nuevoArticulo.Costo !== 'number' ||
      typeof nuevoArticulo.Ganancia !== 'number' ||
      !nuevoArticulo.Iva ||
      typeof nuevoArticulo.PrecioPublico !== 'number'
    ) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
  
    setLoading(true); // Activa el loading
    try {
      const articuloParaCrear = {
        CodigoBarra: nuevoArticulo.CodigoBarra,
        Nombre: nuevoArticulo.Nombre,
        Stock: nuevoArticulo.Stock,
        Costo: nuevoArticulo.Costo,
        PrecioPublico: nuevoArticulo.PrecioPublico,
        Iva: parseFloat(nuevoArticulo.Iva),
        idCategoria: nuevoArticulo.idCategoria,
        StockMin: nuevoArticulo.StockMin,
        Ganancia: nuevoArticulo.Ganancia,
        Descripcion: nuevoArticulo.Descripcion,
    };
    
      console.log('Artículos para crear:', articuloParaCrear); // Verifica los datos que se envían
      await createArticulo(articuloParaCrear);
      
      alert('Artículo creado con éxito');
      onArticuloCreado(); // Actualiza la lista de artículos
      resetForm(); // Reiniciar el formulario
      onClose(); // Cierra el diálogo
    } catch (error) {
      console.error('Error al crear artículo:', error);
      alert('Error al crear el artículo: ' + (error.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false); // Desactiva el loading
    }
  };
  

  const resetForm = () => {
    setNuevoArticulo({
      idCategoria: '', // Reinicia el id de categoría
      Categoria: '',
      CodigoBarra: '',
      Nombre: '',
      Stock: 0,
      StockMin: 0,
      Costo: 0,
      Ganancia: 0,
      Iva: '',
      PrecioPublico: 0,
      Descripcion: '',
    });
  };

  const handleCancel = () => {
    resetForm(); // Reinicia el formulario
    onClose(); // Cierra el diálogo
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Alta de Artículo</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
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

            <TextField
              label="Código de Barras"
              value={nuevoArticulo.CodigoBarra}
              onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, CodigoBarra: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Nombre"
              value={nuevoArticulo.Nombre}
              onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, Nombre: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Stock Inicial"
              type="number"
              value={nuevoArticulo.Stock || '0'} // Si es 0, muestra placeholder
              placeholder="0"
              onChange={(e) => handleStockChange(e.target.value)} // Actualiza el stock
              fullWidth
              margin="normal"
            />
            <TextField
              label="Stock Mínimo"
              type="number"
              value={nuevoArticulo.StockMin || '0'} // Si es 0, muestra placeholder
              placeholder="0"
              onChange={(e) => handleStockMinChange(e.target.value)} // Actualiza el stock mínimo
              fullWidth
              margin="normal"
            />
            <TextField
              label="Precio de Costo"
              type="number"
              value={nuevoArticulo.Costo} // Si es 0, muestra placeholder
              onChange={(e) => handleCostoChange(Number(e.target.value))} // Actualiza el costo
              fullWidth
              margin="normal"
            />
            <TextField
              label="Rentabilidad (%)"
              type="number"
              value={nuevoArticulo.Ganancia} // Si es 0, muestra placeholder
              onChange={(e) => handleRentabilidadChange(Number(e.target.value))} // Actualiza la rentabilidad
              fullWidth
              margin="normal"
            />
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

            <TextField
              label="Precio Público"
              type="number"
              value={nuevoArticulo.PrecioPublico} // Si es 0, muestra placeholder
              onChange={(e) => handlePrecioPublicoChange(Number(e.target.value))} // Actualiza el precio público
              fullWidth
              margin="normal"
            />
            <TextField
              label="Descripción"
              value={nuevoArticulo.Descripcion}
              onChange={(e) => setNuevoArticulo({ ...nuevoArticulo, Descripcion: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AltaArticulo;
