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
  Skeleton,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
} from "@mui/icons-material";
import * as Products from "../../services/productService";

const toNumber = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

const pick = (obj, keys, fallback = "") => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function EditarArticulo({ onClose, onArticuloEditado, articuloEditando }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);

  // Imágenes del servidor
  const [serverImages, setServerImages] = useState([]);
  // Nuevas imágenes a subir
  const [newImages, setNewImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  const [form, setForm] = useState(null);

  const productId = useMemo(() => {
    return pick(articuloEditando, ["id", "idArticulo"], null);
  }, [articuloEditando]);

  useEffect(() => {
    if (!articuloEditando) return;

    setForm({
      id: productId,
      name: String(pick(articuloEditando, ["name", "Nombre"], "")),
      sku: String(pick(articuloEditando, ["sku", "Codigo"], "")),
      barcode: String(pick(articuloEditando, ["barcode"], "")),
      category_id: pick(articuloEditando, ["category_id", "CategoryId"], "") ?? "",
      description: String(pick(articuloEditando, ["description", "Descripcion"], "")),
      unit: String(pick(articuloEditando, ["unit", "Unidad"], "UN")),
      cost: String(pick(articuloEditando, ["cost", "Costo"], "")),
      price: String(pick(articuloEditando, ["price", "PrecioPublico", "Precio"], "")),
      tax_id: pick(articuloEditando, ["tax_id"], "") ?? "",
      tax_rate: toNumber(pick(articuloEditando, ["tax_rate", "Iva"], 21), 21),
      is_active: !!pick(articuloEditando, ["is_active", "Activo"], true),
      track_stock: !!pick(articuloEditando, ["track_stock"], true),
      min_stock: toNumber(pick(articuloEditando, ["min_stock"], 0), 0),
      current_stock: toNumber(pick(articuloEditando, ["stock", "Stock"], 0), 0),
      stock_adjustment: 0,
    });
    setLoading(false);
  }, [articuloEditando, productId]);

  // Cargar imágenes del producto
  useEffect(() => {
    if (!productId || !Products.listProductImages) return;

    setLoadingImages(true);
    Products.listProductImages(productId)
      .then((imgs) => {
        setServerImages(imgs || []);
      })
      .catch((e) => {
        console.error("Error loading images:", e);
      })
      .finally(() => {
        setLoadingImages(false);
      });
  }, [productId]);

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
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const canSave = useMemo(() => {
    if (!form) return false;
    if (!form.name.trim()) return false;
    if (String(form.price).trim() === "") return false;
    if (!form.id) return false;
    
    // Validar que el ajuste de stock no resulte en negativo
    const adjustment = toNumber(form.stock_adjustment, 0);
    const currentStock = toNumber(form.current_stock, 0);
    const newStock = currentStock + adjustment;
    
    if (form.track_stock && newStock < 0) {
      return false;
    }
    
    return true;
  }, [form]);

  const allImages = useMemo(() => {
    return [...serverImages, ...newImages];
  }, [serverImages, newImages]);

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
          id: `new-${Date.now()}-${Math.random()}`,
          file,
          preview: evt.target.result,
          is_primary: allImages.length === 0,
          alt: "",
          sort_order: allImages.length,
          isNew: true,
        };
        setNewImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }, [allImages.length]);

  const handleDeleteServerImage = useCallback(async (imageId) => {
    if (!Products.deleteProductImage) return;

    try {
      await Products.deleteProductImage(productId, imageId);
      setServerImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      console.error("Error deleting image:", e);
      setErr("No se pudo eliminar la imagen.");
    }
  }, [productId]);

  const handleDeleteNewImage = useCallback((id) => {
    setNewImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleSetPrimary = useCallback(async (imageId, isServerImage) => {
    if (isServerImage && Products.setProductImagePrimary) {
      try {
        await Products.setProductImagePrimary(productId, imageId);
        setServerImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
        setNewImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: false,
          }))
        );
      } catch (e) {
        console.error("Error setting primary:", e);
      }
    } else {
      setServerImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: false,
        }))
      );
      setNewImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    }
  }, [productId]);

  const handleSubmit = async () => {
    if (!form) return;

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
      };

      // Si hay ajuste de stock, agregarlo al payload
      const stockAdj = toNumber(form.stock_adjustment, 0);
      if (stockAdj !== 0) {
        payload.stock_adjustment = stockAdj;
      }

      if (!Products.updateProduct) {
        throw new Error("Falta Products.updateProduct en productService.");
      }

      await Products.updateProduct(form.id, payload);

      // Subir nuevas imágenes
      if (newImages.length > 0 && Products.uploadProductImage) {
        setUploadingImage(true);
        for (const img of newImages) {
          try {
            await Products.uploadProductImage(form.id, img.file, {
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

      onArticuloEditado?.();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "No se pudo actualizar el artículo.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  if (loading || !form) {
    return (
      <>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={120} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </>
    );
  }

  return (
    <>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div" fontWeight={700}>
            Editar Producto
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label={allImages.length > 0 ? `${allImages.length} imagen${allImages.length > 1 ? 'es' : ''}` : 'Sin imágenes'} 
              size="small" 
              color={allImages.length > 0 ? "primary" : "default"}
              icon={<ImageIcon />}
            />
            <Button
              size="small"
              variant={form.is_active ? "outlined" : "contained"}
              color={form.is_active ? "error" : "success"}
              startIcon={<PowerSettingsNewIcon />}
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            >
              {form.is_active ? 'Desactivar' : 'Activar'}
            </Button>
          </Stack>
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
                    value={form.category_id ? String(form.category_id) : ""}
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
                    value={form.tax_id ? String(form.tax_id) : ""}
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
                  Agregar Más Imágenes
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

              {loadingImages ? (
                <Grid container spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Grid item xs={6} md={4} key={i}>
                      <Skeleton variant="rectangular" height={200} />
                    </Grid>
                  ))}
                </Grid>
              ) : allImages.length > 0 ? (
                <Grid container spacing={2}>
                  {serverImages.map((img) => (
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
                          image={img.url}
                          alt={img.alt || "Imagen del producto"}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Stack direction="row" spacing={1} justifyContent="space-between">
                            <IconButton
                              size="small"
                              onClick={() => handleSetPrimary(img.id, true)}
                              color={img.is_primary ? "primary" : "default"}
                            >
                              {img.is_primary ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteServerImage(img.id)}
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
                  {newImages.map((img) => (
                    <Grid item xs={6} md={4} key={img.id}>
                      <Card 
                        sx={{ 
                          position: 'relative',
                          border: img.is_primary ? '2px solid' : '1px solid',
                          borderColor: img.is_primary ? 'success.main' : 'divider',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={img.preview}
                          alt="Nueva imagen"
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Stack direction="row" spacing={1} justifyContent="space-between">
                            <IconButton
                              size="small"
                              onClick={() => handleSetPrimary(img.id, false)}
                              color={img.is_primary ? "success" : "default"}
                            >
                              {img.is_primary ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteNewImage(img.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                          <Chip 
                            label="Nueva" 
                            size="small" 
                            color="success" 
                            sx={{ mt: 0.5 }} 
                          />
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
                    Agrega imágenes para mejorar la presentación del producto
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
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

              {form.track_stock && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Stock Actual"
                      value={form.current_stock}
                      fullWidth
                      variant="outlined"
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                      helperText="Stock actual en inventario"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box>
                      <TextField
                        label="Ajuste de Stock"
                        value={form.stock_adjustment}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({ ...p, stock_adjustment: val }));
                        }}
                        fullWidth
                        variant="outlined"
                        type="number"
                        helperText="Positivo para agregar, negativo para restar"
                      />
                      <Stack direction="row" spacing={1} mt={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setForm((p) => ({ ...p, stock_adjustment: toNumber(p.stock_adjustment, 0) + 10 }))}
                        >
                          +10
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setForm((p) => ({ ...p, stock_adjustment: toNumber(p.stock_adjustment, 0) + 1 }))}
                        >
                          +1
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setForm((p) => ({ ...p, stock_adjustment: 0 }))}
                        >
                          Reset
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setForm((p) => ({ ...p, stock_adjustment: toNumber(p.stock_adjustment, 0) - 1 }))}
                        >
                          -1
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setForm((p) => ({ ...p, stock_adjustment: toNumber(p.stock_adjustment, 0) - 10 }))}
                        >
                          -10
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Nuevo Stock"
                      value={toNumber(form.current_stock, 0) + toNumber(form.stock_adjustment, 0)}
                      fullWidth
                      variant="filled"
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                      helperText="Stock resultante después del ajuste"
                      sx={{
                        '& .MuiFilledInput-root': {
                          bgcolor: toNumber(form.current_stock, 0) + toNumber(form.stock_adjustment, 0) < 0 
                            ? 'error.lighter' 
                            : 'success.lighter',
                        }
                      }}
                    />
                  </Grid>

                  {toNumber(form.current_stock, 0) + toNumber(form.stock_adjustment, 0) < 0 && (
                    <Grid item xs={12}>
                      <Alert severity="error">
                        El ajuste resultaría en stock negativo. Verifica la cantidad.
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Stock Mínimo"
                      value={form.min_stock}
                      onChange={setField("min_stock")}
                      fullWidth
                      inputMode="decimal"
                      variant="outlined"
                      helperText="Nivel de alerta de stock bajo"
                      type="number"
                    />
                  </Grid>

                  {toNumber(form.current_stock, 0) + toNumber(form.stock_adjustment, 0) < toNumber(form.min_stock, 0) && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        ⚠️ El stock está por debajo del mínimo configurado ({form.min_stock} unidades)
                      </Alert>
                    </Grid>
                  )}
                </>
              )}
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
          {uploadingImage ? "Subiendo imágenes..." : saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </>
  );
}
