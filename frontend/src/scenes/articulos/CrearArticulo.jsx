import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  IconButton,
  Chip,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import * as Products from "../../services/productService";

const toNumber = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function CrearArticulo({ onClose, onArticuloCreado }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);

  // Imágenes temporales (antes de guardar)
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category_id: "",
    description: "",
    unit: "UN",
    cost: "",
    price: "",
    tax_id: "",
    tax_rate: 21,
    is_active: true,
    track_stock: true,
    min_stock: 0,
    initial_stock: 0,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [cats, txs] = await Promise.all([
          Products.listCategories ? Products.listCategories() : Promise.resolve([]),
          Products.listTaxes ? Products.listTaxes() : Promise.resolve([]),
        ]);

        if (!alive) return;

        setCategories(Array.isArray(cats) ? cats : (cats?.data ?? []));
        setTaxes(Array.isArray(txs) ? txs : (txs?.data ?? []));

        const def = (Array.isArray(txs) ? txs : (txs?.data ?? [])).find((t) => t.is_default);
        if (def) {
          setForm((p) => ({
            ...p,
            tax_id: String(def.id),
            tax_rate: toNumber(def.rate, 0),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;
    if (String(form.price).trim() === "") return false;
    return true;
  }, [form.name, form.price]);

  const setField = (k) => (e) => {
    const v = e?.target?.value ?? e;
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: evt.target.result,
          is_primary: images.length === 0,
          alt: "",
          sort_order: images.length,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }, [images.length]);

  const handleDeleteImage = useCallback((id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  }, []);

  const handleSetPrimary = useCallback((id) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === id,
      }))
    );
  }, []);

  const handleSubmit = async () => {
    setErr("");

    if (!canSave) {
      setErr("Completá al menos Nombre y Precio.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku?.trim() || null,
        barcode: form.barcode?.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        description: form.description?.trim() || null,
        unit: form.unit?.trim() || "UN",
        cost: toNumber(form.cost, 0),
        price: toNumber(form.price, 0),
        tax_id: form.tax_id ? Number(form.tax_id) : null,
        tax_rate: toNumber(form.tax_rate, 0),
        is_active: !!form.is_active,
        track_stock: !!form.track_stock,
        min_stock: toNumber(form.min_stock, 0),
        initial_stock: toNumber(form.initial_stock, 0),
      };

      if (!Products.createProduct) {
        throw new Error("Falta Products.createProduct en productService.");
      }

      const newProduct = await Products.createProduct(payload);
      const productId = newProduct.id || newProduct.idArticulo;

      // Subir imágenes si existen
      if (images.length > 0 && Products.uploadProductImage) {
        setUploadingImage(true);
        for (const img of images) {
          try {
            await Products.uploadProductImage(productId, img.file, {
              alt: img.alt || form.name,
              is_primary: img.is_primary,
              sort_order: img.sort_order,
            });
          } catch (imgErr) {
            console.error("Error uploading image:", imgErr);
          }
        }
        setUploadingImage(false);
      }

      onArticuloCreado?.();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "No se pudo crear el artículo.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  return (
    <>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div" fontWeight={700}>
            Nuevo Producto
          </Typography>
          <Chip 
            label={images.length > 0 ? `${images.length} imagen${images.length > 1 ? 'es' : ''}` : 'Sin imágenes'} 
            size="small" 
            color={images.length > 0 ? "primary" : "default"}
            icon={<ImageIcon />}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {err && (
          <Alert severity="error" sx={{ m: 2 }}>
            {err}
          </Alert>
        )}

        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Información Básica" />
          <Tab label="Imágenes" />
          <Tab label="Inventario" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre del Producto"
                  value={form.name}
                  onChange={setField("name")}
                  fullWidth
                  required
                  autoFocus
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="SKU / Código"
                  value={form.sku}
                  onChange={setField("sku")}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Código de Barras"
                  value={form.barcode}
                  onChange={setField("barcode")}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    label="Categoría"
                    value={form.category_id}
                    onChange={setField("category_id")}
                  >
                    <MenuItem value="">Sin categoría</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Unidad de Medida"
                  value={form.unit}
                  onChange={setField("unit")}
                  fullWidth
                  placeholder="UN"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  value={form.description}
                  onChange={setField("description")}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Describe las características principales del producto..."
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Costo"
                  value={form.cost}
                  onChange={setField("cost")}
                  fullWidth
                  inputMode="decimal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Precio de Venta"
                  value={form.price}
                  onChange={setField("price")}
                  fullWidth
                  inputMode="decimal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>IVA</InputLabel>
                  <Select
                    label="IVA"
                    value={form.tax_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const t = taxes.find((x) => String(x.id) === String(id));
                      setForm((p) => ({
                        ...p,
                        tax_id: id,
                        tax_rate: t ? toNumber(t.rate, 0) : p.tax_rate,
                      }));
                    }}
                  >
                    <MenuItem value="">Sin IVA</MenuItem>
                    {taxes.map((t) => (
                      <MenuItem key={t.id} value={String(t.id)}>
                        {t.name} ({toNumber(t.rate, 0)}%)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_active}
                      onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Producto Activo"
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ height: 56, borderStyle: 'dashed' }}
                >
                  Subir Imágenes
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Soporta: JPG, PNG, WebP. Máximo 5MB por imagen.
                </Typography>
              </Box>

              {images.length > 0 ? (
                <Grid container spacing={2}>
                  {images.map((img) => (
                    <Grid item xs={6} md={4} key={img.id}>
                      <Card 
                        sx={{ 
                          position: 'relative',
                          border: img.is_primary ? '2px solid' : '1px solid',
                          borderColor: img.is_primary ? 'primary.main' : 'divider',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={img.preview}
                          alt={img.alt || "Preview"}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Stack direction="row" spacing={1} justifyContent="space-between">
                            <IconButton
                              size="small"
                              onClick={() => handleSetPrimary(img.id)}
                              color={img.is_primary ? "primary" : "default"}
                            >
                              {img.is_primary ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteImage(img.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                          {img.is_primary && (
                            <Chip 
                              label="Principal" 
                              size="small" 
                              color="primary" 
                              sx={{ mt: 0.5 }} 
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    border: '2px dashed', 
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay imágenes cargadas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Las imágenes ayudan a aumentar las ventas
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.track_stock}
                      onChange={(e) => setForm((p) => ({ ...p, track_stock: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Controlar Stock"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Activa esta opción para recibir alertas de stock bajo
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Stock Inicial"
                  value={form.initial_stock}
                  onChange={setField("initial_stock")}
                  fullWidth
                  inputMode="decimal"
                  disabled={!form.track_stock}
                  variant="outlined"
                  helperText="Cantidad inicial de unidades en inventario"
                  type="number"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Stock Mínimo"
                  value={form.min_stock}
                  onChange={setField("min_stock")}
                  fullWidth
                  inputMode="decimal"
                  disabled={!form.track_stock}
                  variant="outlined"
                  helperText="Nivel de alerta de stock bajo"
                  type="number"
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {(saving || uploadingImage) && <LinearProgress />}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={saving || uploadingImage}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={saving || uploadingImage || !canSave}
          size="large"
        >
          {uploadingImage ? "Subiendo imágenes..." : saving ? "Guardando..." : "Crear Producto"}
        </Button>
      </DialogActions>
    </>
  );
}
