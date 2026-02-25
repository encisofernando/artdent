// src/scenes/articulos/EditarArticulo.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert, Box, Button, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, InputLabel, MenuItem, Select,
  Switch, TextField, Typography, IconButton, Chip,
  Card, CardMedia, LinearProgress, Stack, Tab, Tabs,
  Skeleton, Divider, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteIcon            from "@mui/icons-material/Delete";
import CloudUploadIcon       from "@mui/icons-material/CloudUpload";
import ImageIcon             from "@mui/icons-material/Image";
import StarIcon              from "@mui/icons-material/Star";
import StarBorderIcon        from "@mui/icons-material/StarBorder";
import PowerSettingsNewIcon  from "@mui/icons-material/PowerSettingsNew";
import CloseIcon             from "@mui/icons-material/Close";
import RemoveIcon            from "@mui/icons-material/Remove";
import AddIcon               from "@mui/icons-material/Add";

import * as Products from "../../services/productService";
import { B, toNumber, pick, TabPanel, SectionLabel } from "./_shared";

/* ══════════════════════════════════════════════
   EDITAR ARTICULO
   ══════════════════════════════════════════════ */
export default function EditarArticulo({ onClose, onArticuloEditado, articuloEditando }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [saving, setSaving]               = useState(false);
  const [loading, setLoading]             = useState(true);
  const [err, setErr]                     = useState("");
  const [activeTab, setActiveTab]         = useState(0);
  const [categories, setCategories]       = useState([]);
  const [taxes, setTaxes]                 = useState([]);
  const [serverImages, setServerImages]   = useState([]);
  const [newImages, setNewImages]         = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [form, setForm]                   = useState(null);

  /* ── colors ── */
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const inputBg   = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: inputBg, fontSize: 13.5 },
    "& .MuiInputLabel-root": { fontSize: 13.5 },
  };

  const productId = useMemo(() => pick(articuloEditando, ["id", "idArticulo"], null), [articuloEditando]);

  /* Init form */
  useEffect(() => {
    if (!articuloEditando) return;
    setForm({
      id: productId,
      name:           String(pick(articuloEditando, ["name", "Nombre"], "")),
      sku:            String(pick(articuloEditando, ["sku", "Codigo"], "")),
      barcode:        String(pick(articuloEditando, ["barcode"], "")),
      category_id:    pick(articuloEditando, ["category_id", "CategoryId"], "") ?? "",
      description:    String(pick(articuloEditando, ["description", "Descripcion"], "")),
      unit:           String(pick(articuloEditando, ["unit", "Unidad"], "UN")),
      cost:           String(pick(articuloEditando, ["cost", "Costo"], "")),
      price:          String(pick(articuloEditando, ["price", "PrecioPublico", "Precio"], "")),
      tax_id:         pick(articuloEditando, ["tax_id"], "") ?? "",
      tax_rate:       toNumber(pick(articuloEditando, ["tax_rate", "Iva"], 21), 21),
      is_active:      !!pick(articuloEditando, ["is_active", "Activo"], true),
      track_stock:    !!pick(articuloEditando, ["track_stock"], true),
      min_stock:      toNumber(pick(articuloEditando, ["min_stock"], 0), 0),
      current_stock:  toNumber(pick(articuloEditando, ["stock", "Stock"], 0), 0),
      stock_adjustment: 0,
    });
    setLoading(false);
  }, [articuloEditando, productId]);

  /* Load server images */
  useEffect(() => {
    if (!productId || !Products.listProductImages) return;
    setLoadingImages(true);
    Products.listProductImages(productId)
      .then((imgs) => setServerImages(imgs || []))
      .catch((e) => console.error("Error loading images:", e))
      .finally(() => setLoadingImages(false));
  }, [productId]);

  /* Load categories + taxes */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cats, txs] = await Promise.all([
          Products.listCategories?.() ?? Promise.resolve([]),
          Products.listTaxes?.()      ?? Promise.resolve([]),
        ]);
        if (!alive) return;
        setCategories(Array.isArray(cats) ? cats : (cats?.data ?? []));
        setTaxes(Array.isArray(txs) ? txs : (txs?.data ?? []));
      } catch (e) { console.error(e); }
    })();
    return () => { alive = false; };
  }, []);

  const allImages = useMemo(() => [...serverImages, ...newImages], [serverImages, newImages]);

  const newStock = useMemo(
    () => toNumber(form?.current_stock, 0) + toNumber(form?.stock_adjustment, 0),
    [form?.current_stock, form?.stock_adjustment]
  );

  const canSave = useMemo(() => {
    if (!form) return false;
    if (!form.name.trim()) return false;
    if (String(form.price).trim() === "") return false;
    if (!form.id) return false;
    if (form.track_stock && newStock < 0) return false;
    return true;
  }, [form, newStock]);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e?.target?.value ?? e }));

  /* Image handlers */
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setNewImages((prev) => [...prev, {
          id: `new-${Date.now()}-${Math.random()}`,
          file, preview: evt.target.result,
          is_primary: allImages.length === 0,
          alt: "", sort_order: allImages.length, isNew: true,
        }]);
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
    } catch (e) { setErr("No se pudo eliminar la imagen."); }
  }, [productId]);

  const handleDeleteNewImage = useCallback((id) => {
    setNewImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleSetPrimary = useCallback(async (imageId, isServerImage) => {
    if (isServerImage && Products.setProductImagePrimary) {
      try {
        await Products.setProductImagePrimary(productId, imageId);
        setServerImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
        setNewImages((prev) => prev.map((img) => ({ ...img, is_primary: false })));
      } catch (e) { console.error(e); }
    } else {
      setServerImages((prev) => prev.map((img) => ({ ...img, is_primary: false })));
      setNewImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
    }
  }, [productId]);

  const handleSubmit = async () => {
    if (!form) return;
    setErr("");
    if (!canSave) { setErr("Completá al menos Nombre y Precio."); return; }
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
      const stockAdj = toNumber(form.stock_adjustment, 0);
      if (stockAdj !== 0) payload.stock_adjustment = stockAdj;

      await Products.updateProduct(form.id, payload);

      if (newImages.length > 0 && Products.uploadProductImage) {
        setUploadingImage(true);
        for (const img of newImages) {
          try {
            await Products.uploadProductImage(form.id, img.file, {
              alt: img.alt || form.name, is_primary: img.is_primary, sort_order: img.sort_order,
            });
          } catch (imgErr) { console.error(imgErr); }
        }
        setUploadingImage(false);
      }
      onArticuloEditado?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudo actualizar el artículo.");
    } finally { setSaving(false); setUploadingImage(false); }
  };

  /* ── Loading skeleton ── */
  if (loading || !form) {
    const skBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    return (
      <>
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: `1px solid ${borderCol}` }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: textCol }}>
            Editar Producto
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, bgcolor: isDark ? "#0F1F2A" : "#F7FAFC" }}>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "10px", bgcolor: skBg }} />
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "10px", bgcolor: skBg }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "10px", bgcolor: skBg }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${borderCol}` }}>
          <Button onClick={onClose} sx={{ color: mutedCol, textTransform: "none" }}>Cerrar</Button>
        </DialogActions>
      </>
    );
  }

  const tabSx = {
    textTransform: "none",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 600, fontSize: 13,
    color: mutedCol,
    "&.Mui-selected": { color: B.blue, fontWeight: 700 },
    minHeight: 44,
  };

  const stockNegative = form.track_stock && newStock < 0;
  const stockLow = form.track_stock && !stockNegative && newStock < toNumber(form.min_stock, 0) && toNumber(form.min_stock, 0) > 0;

  return (
    <>
      {/* ── Title ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 3, py: 2, borderBottom: `1px solid ${borderCol}` }}
        >
          <Box>
            <Typography sx={{
              fontSize: 17, fontWeight: 800, color: textCol,
              letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif",
            }}>
              Editar Producto
            </Typography>
            <Typography sx={{ fontSize: 12, color: mutedCol, mt: 0.2 }}>
              {form.name || "Sin nombre"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {allImages.length > 0 && (
              <Chip
                label={`${allImages.length} imagen${allImages.length > 1 ? "es" : ""}`}
                size="small"
                sx={{
                  height: 22, fontSize: 11, fontWeight: 700,
                  bgcolor: alpha(B.blue, isDark ? 0.2 : 0.1),
                  color: B.blue, border: `1px solid ${alpha(B.blue, 0.25)}`,
                }}
              />
            )}
            {/* Active toggle */}
            <Button
              size="small"
              startIcon={<PowerSettingsNewIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700, fontSize: 12,
                color: form.is_active ? "#E63946" : B.green,
                border: `1px solid ${form.is_active ? alpha("#E63946", 0.3) : alpha(B.green, 0.3)}`,
                bgcolor: form.is_active ? alpha("#E63946", 0.06) : alpha(B.green, 0.06),
                "&:hover": {
                  bgcolor: form.is_active ? alpha("#E63946", 0.12) : alpha(B.green, 0.12),
                },
                px: 1.25, py: 0.5,
              }}
            >
              {form.is_active ? "Desactivar" : "Activar"}
            </Button>
            <IconButton
              onClick={onClose} size="small"
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                color: mutedCol,
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: textCol },
              }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2, minHeight: 44,
            "& .MuiTabs-indicator": { bgcolor: B.blue, height: 2, borderRadius: 1 },
          }}
        >
          <Tab label="Información" sx={tabSx} />
          <Tab label="Imágenes"    sx={tabSx} />
          <Tab label="Inventario"  sx={tabSx} />
        </Tabs>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent
        sx={{
          p: 0, bgcolor: isDark ? "#0F1F2A" : "#F7FAFC",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
            borderRadius: 4,
          },
        }}
      >
        {err && (
          <Alert severity="error" sx={{ mx: 2.5, mt: 2, borderRadius: "10px", fontSize: 13 }}>
            {err}
          </Alert>
        )}

        {/* TAB 0 — Información */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SectionLabel isDark={isDark}>Datos del producto</SectionLabel>
                <TextField label="Nombre del Producto" value={form.name} onChange={setField("name")} fullWidth required autoFocus sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="SKU / Código" value={form.sku} onChange={setField("sku")} fullWidth sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Código de Barras" value={form.barcode} onChange={setField("barcode")} fullWidth sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel sx={{ fontSize: 13.5 }}>Categoría</InputLabel>
                  <Select label="Categoría" value={form.category_id ? String(form.category_id) : ""} onChange={setField("category_id")} sx={{ borderRadius: "10px" }}>
                    <MenuItem value="">Sin categoría</MenuItem>
                    {categories.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Unidad de Medida" value={form.unit} onChange={setField("unit")} fullWidth sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Descripción" value={form.description} onChange={setField("description")} fullWidth multiline rows={3} placeholder="Describí las características del producto..." sx={inputSx} />
              </Grid>

              <Grid item xs={12}>
                <SectionLabel isDark={isDark}>Precios</SectionLabel>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Costo" value={form.cost} onChange={setField("cost")}
                  fullWidth inputMode="decimal"
                  InputProps={{ startAdornment: <Typography sx={{ mr: 0.75, color: mutedCol, fontSize: 14 }}>$</Typography> }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Precio de Venta" value={form.price} onChange={setField("price")}
                  fullWidth inputMode="decimal" required
                  InputProps={{ startAdornment: <Typography sx={{ mr: 0.75, color: mutedCol, fontSize: 14 }}>$</Typography> }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel sx={{ fontSize: 13.5 }}>IVA</InputLabel>
                  <Select
                    label="IVA"
                    value={form.tax_id ? String(form.tax_id) : ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      const t  = taxes.find((x) => String(x.id) === String(id));
                      setForm((p) => ({ ...p, tax_id: id, tax_rate: t ? toNumber(t.rate, 0) : p.tax_rate }));
                    }}
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="">Sin IVA</MenuItem>
                    {taxes.map((t) => <MenuItem key={t.id} value={String(t.id)}>{t.name} ({toNumber(t.rate, 0)}%)</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* TAB 1 — Imágenes */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              {/* Upload zone */}
              <Box
                component="label"
                sx={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 1, p: 3, borderRadius: "12px",
                  border: `2px dashed ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
                  bgcolor: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  "&:hover": { borderColor: B.blue, bgcolor: alpha(B.blue, 0.04) },
                }}
              >
                <Box sx={{
                  width: 44, height: 44, borderRadius: "12px",
                  bgcolor: alpha(B.blue, isDark ? 0.18 : 0.1),
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CloudUploadIcon sx={{ fontSize: 22, color: B.blue }} />
                </Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: textCol }}>
                  Agregar imágenes
                </Typography>
                <Typography sx={{ fontSize: 12, color: mutedCol }}>
                  JPG, PNG, WebP · Máx. 5MB
                </Typography>
                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
              </Box>

              {/* Image grid */}
              {loadingImages ? (
                <Grid container spacing={1.5}>
                  {[1,2,3].map((i) => (
                    <Grid item xs={6} sm={4} key={i}>
                      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: "10px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
                    </Grid>
                  ))}
                </Grid>
              ) : allImages.length > 0 ? (
                <Grid container spacing={1.5}>
                  {serverImages.map((img) => (
                    <Grid item xs={6} sm={4} key={img.id}>
                      <Card elevation={0} sx={{
                        borderRadius: "10px", overflow: "hidden",
                        border: img.is_primary ? `2px solid ${B.blue}` : `1px solid ${borderCol}`,
                        bgcolor: isDark ? "#172A36" : "#fff",
                      }}>
                        <Box sx={{ position: "relative" }}>
                          <CardMedia component="img" height={130} image={img.url} alt={img.alt || "Imagen"} sx={{ objectFit: "cover" }} />
                          {img.is_primary && (
                            <Box sx={{ position: "absolute", bottom: 6, left: 6, px: 0.75, py: 0.2, borderRadius: "5px", bgcolor: alpha(B.blue, 0.9) }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>PRINCIPAL</Typography>
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", px: 0.75, py: 0.5 }}>
                          <IconButton size="small" onClick={() => handleSetPrimary(img.id, true)} sx={{ color: img.is_primary ? B.blue : mutedCol, borderRadius: "6px" }}>
                            {img.is_primary ? <StarIcon sx={{ fontSize: 17 }} /> : <StarBorderIcon sx={{ fontSize: 17 }} />}
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteServerImage(img.id)} sx={{ color: "#E63946", borderRadius: "6px", "&:hover": { bgcolor: alpha("#E63946", 0.08) } }}>
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                  {newImages.map((img) => (
                    <Grid item xs={6} sm={4} key={img.id}>
                      <Card elevation={0} sx={{
                        borderRadius: "10px", overflow: "hidden",
                        border: img.is_primary ? `2px solid ${B.green}` : `1px solid ${borderCol}`,
                        bgcolor: isDark ? "#172A36" : "#fff",
                      }}>
                        <Box sx={{ position: "relative" }}>
                          <CardMedia component="img" height={130} image={img.preview} alt="Nueva" sx={{ objectFit: "cover" }} />
                          <Box sx={{ position: "absolute", bottom: 6, left: 6, px: 0.75, py: 0.2, borderRadius: "5px", bgcolor: alpha(B.green, 0.9) }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>NUEVA</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", px: 0.75, py: 0.5 }}>
                          <IconButton size="small" onClick={() => handleSetPrimary(img.id, false)} sx={{ color: img.is_primary ? B.green : mutedCol, borderRadius: "6px" }}>
                            {img.is_primary ? <StarIcon sx={{ fontSize: 17 }} /> : <StarBorderIcon sx={{ fontSize: 17 }} />}
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteNewImage(img.id)} sx={{ color: "#E63946", borderRadius: "6px", "&:hover": { bgcolor: alpha("#E63946", 0.08) } }}>
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 2, color: mutedCol, fontSize: 13 }}>
                  No hay imágenes cargadas
                </Box>
              )}
            </Stack>
          </Box>
        </TabPanel>

        {/* TAB 2 — Inventario */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SectionLabel isDark={isDark}>Control de stock</SectionLabel>
                <Box sx={{
                  px: 2, py: 1.5, borderRadius: "10px",
                  bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${borderCol}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: textCol }}>
                      Controlar Stock
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: mutedCol }}>
                      Activá para recibir alertas de stock bajo
                    </Typography>
                  </Box>
                  <Switch
                    checked={form.track_stock}
                    onChange={(e) => setForm((p) => ({ ...p, track_stock: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-thumb": { bgcolor: form.track_stock ? B.green : undefined },
                      "& .MuiSwitch-track": { bgcolor: form.track_stock ? alpha(B.green, 0.5) : undefined },
                    }}
                  />
                </Box>
              </Grid>

              {form.track_stock && (
                <>
                  {/* Stock summary row */}
                  <Grid item xs={12}>
                    <Grid container spacing={1.5}>
                      {/* Current */}
                      <Grid item xs={12} sm={4}>
                        <Box sx={{
                          p: 2, borderRadius: "10px", textAlign: "center",
                          bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1px solid ${borderCol}`,
                        }}>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: mutedCol, letterSpacing: "0.07em", textTransform: "uppercase", mb: 0.5 }}>
                            Actual
                          </Typography>
                          <Typography sx={{ fontSize: 26, fontWeight: 800, color: textCol, letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif" }}>
                            {form.current_stock}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Arrow */}
                      <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography sx={{
                            fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
                            color: toNumber(form.stock_adjustment, 0) > 0 ? B.green
                              : toNumber(form.stock_adjustment, 0) < 0 ? "#E63946"
                              : mutedCol,
                            fontFamily: "Montserrat, sans-serif",
                          }}>
                            {toNumber(form.stock_adjustment, 0) >= 0 ? "+" : ""}
                            {toNumber(form.stock_adjustment, 0)}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: mutedCol }}>ajuste</Typography>
                        </Box>
                      </Grid>

                      {/* New */}
                      <Grid item xs={12} sm={4}>
                        <Box sx={{
                          p: 2, borderRadius: "10px", textAlign: "center",
                          bgcolor: stockNegative ? alpha("#E63946", isDark ? 0.12 : 0.06)
                            : alpha(B.green, isDark ? 0.12 : 0.06),
                          border: `1px solid ${stockNegative ? alpha("#E63946", 0.25) : alpha(B.green, 0.25)}`,
                        }}>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", mb: 0.5, color: stockNegative ? "#E63946" : B.green }}>
                            Nuevo
                          </Typography>
                          <Typography sx={{
                            fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
                            fontFamily: "Montserrat, sans-serif",
                            color: stockNegative ? "#E63946" : B.green,
                          }}>
                            {newStock}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Adjustment input + quick buttons */}
                  <Grid item xs={12}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: mutedCol, mb: 1 }}>
                      Ajuste de stock
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* Quick decrement */}
                      {["-10", "-1"].map((v) => (
                        <Button key={v} size="small" onClick={() => setForm((p) => ({ ...p, stock_adjustment: toNumber(p.stock_adjustment, 0) + Number(v) }))}
                          sx={{
                            minWidth: 40, height: 36, borderRadius: "8px", fontWeight: 700, fontSize: 12,
                            color: "#E63946", border: `1px solid ${alpha("#E63946", 0.25)}`,
                            bgcolor: alpha("#E63946", isDark ? 0.08 : 0.04),
                            "&:hover": { bgcolor: alpha("#E63946", 0.14) },
                          }}
                        >{v}</Button>
                      ))}

                      {/* Text input */}
                      <TextField
                        value={form.stock_adjustment}
                        onChange={(e) => setForm((p) => ({ ...p, stock_adjustment: e.target.value }))}
                        type="number"
                        size="small"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: inputBg, fontSize: 14, fontWeight: 700, textAlign: "center" },
                          "& input": { textAlign: "center" },
                        }}
                      />

                      {/* Quick increment */}
                      {["+1", "+10"].map((v) => (
                        <Button key={v} size="small" onClick={() => setForm((p) => ({ ...p, stock_adjustment: toNumber(p.stock_adjustment, 0) + Number(v) }))}
                          sx={{
                            minWidth: 40, height: 36, borderRadius: "8px", fontWeight: 700, fontSize: 12,
                            color: B.green, border: `1px solid ${alpha(B.green, 0.25)}`,
                            bgcolor: alpha(B.green, isDark ? 0.08 : 0.04),
                            "&:hover": { bgcolor: alpha(B.green, 0.14) },
                          }}
                        >{v}</Button>
                      ))}

                      {/* Reset */}
                      <Button
                        size="small"
                        onClick={() => setForm((p) => ({ ...p, stock_adjustment: 0 }))}
                        sx={{
                          minWidth: 50, height: 36, borderRadius: "8px", fontWeight: 700, fontSize: 12,
                          color: mutedCol, border: `1px solid ${borderCol}`,
                          "&:hover": { color: textCol, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
                        }}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Grid>

                  {/* Alerts */}
                  {stockNegative && (
                    <Grid item xs={12}>
                      <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 13 }}>
                        El ajuste resultaría en stock negativo. Verificá la cantidad.
                      </Alert>
                    </Grid>
                  )}
                  {stockLow && (
                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ borderRadius: "10px", fontSize: 13 }}>
                        El stock quedará por debajo del mínimo configurado ({form.min_stock} unidades).
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: borderCol }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Stock Mínimo" value={form.min_stock} onChange={setField("min_stock")}
                      fullWidth type="number" inputMode="decimal"
                      helperText="Nivel de alerta de stock bajo"
                      sx={inputSx}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </TabPanel>

        {(saving || uploadingImage) && (
          <LinearProgress sx={{
            "& .MuiLinearProgress-bar": { bgcolor: B.blue },
            bgcolor: alpha(B.blue, 0.12),
          }} />
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{
        px: 2.5, py: 2,
        borderTop: `1px solid ${borderCol}`,
        gap: 1,
      }}>
        <Button
          onClick={onClose}
          disabled={saving || uploadingImage}
          sx={{
            color: mutedCol, fontWeight: 600, textTransform: "none", borderRadius: "10px", fontSize: 13.5,
            "&:hover": { color: textCol, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || uploadingImage || !canSave}
          sx={{
            background: canSave ? `linear-gradient(90deg, ${B.blue}, ${B.teal})` : undefined,
            color: "#fff", fontWeight: 700, textTransform: "none",
            borderRadius: "10px", fontSize: 13.5, px: 2.5,
            boxShadow: canSave ? `0 4px 14px ${alpha(B.blue, 0.35)}` : "none",
            "&:hover": { background: `linear-gradient(90deg, ${B.teal}, ${B.green})` },
            "&.Mui-disabled": { opacity: 0.5, color: "#fff" },
          }}
        >
          {uploadingImage ? "Subiendo imágenes..." : saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogActions>
    </>
  );
}