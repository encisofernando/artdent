// resources/js/Pages/Ventas/FacturarPOS.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// shadcn/ui (ajustá paths si en tu proyecto varían)
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Separator } from "@/Components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet"

// icons (lucide)
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  User,
  X,
  Image as ImageIcon,
  ReceiptText,
  CreditCard,
  Printer,
  Whatsapp,
  Mail,
  CheckCircle2,
  Package,
  ShoppingCart,
  Store,
  Receipt,
} from "lucide-react"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"

import * as Products from "@/services/productService"
import * as Sales from "@/services/salesService"
import * as Warehouse from "@/services/warehouseService"
import * as CustomerSvc from "@/services/customerService"

import ModalImprimir from "@/Components/modals/ModalImprimir"

// ─── Brand ──────────────────────────────────────────────────────────────────
const B = {
  blue: "#397B9C",
  green: "#5AAD9C",
  teal: "#49949C",
  mint: "#ACD6CE",
  soft: "#7CA5C3",
}

const PAGE_SIZE = 24

const fmt = (n = 0) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const TIPOS = [
  { id: "X", label: "Ticket X", desc: "Sin factura", accentColor: "#64748b" },
  { id: "A", label: "Factura A", desc: "Resp. Inscripto", accentColor: B.blue },
  { id: "B", label: "Factura B", desc: "Cons. Final", accentColor: B.green },
  { id: "C", label: "Factura C", desc: "Monotributista", accentColor: B.teal },
]

const IVA_OPTS = [
  { value: 0, label: "0% — Exento" },
  { value: 10.5, label: "10.5%" },
  { value: 21, label: "21%" },
  { value: 27, label: "27%" },
]

const TAX_CONDITIONS = [
  { value: "consumidor_final", label: "Consumidor Final" },
  { value: "responsable_inscripto", label: "Resp. Inscripto" },
  { value: "monotributista", label: "Monotributista" },
  { value: "exento", label: "Exento" },
]

// ─── Infinite scroll hook ────────────────────────────────────────────────────
function useInfiniteProducts({ q, refreshKey }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
  }, [q, refreshKey])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)

      try {
        const { items: batch, lastPage } = await Products.listProductsPaginated({
          q,
          page,
          per_page: PAGE_SIZE,
          is_active: true,
        })

        if (cancelled) return

        setItems((prev) => (page === 1 ? batch : [...prev, ...batch]))
        if (lastPage !== null) setHasMore(page < lastPage)
        else setHasMore(batch.length >= PAGE_SIZE)
      } catch (e) {
        console.error("[POS products]", e)
        if (!cancelled) setHasMore(false)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [q, refreshKey, page])

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) setPage((p) => p + 1)
  }, [loadingMore, loading, hasMore])

  return { items, loading, loadingMore, hasMore, loadMore }
}

// ─── Helpers UI ─────────────────────────────────────────────────────────────
function Pill({ children, style }) {
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-[2px] text-[11px] font-bold"
      style={style}
    >
      {children}
    </span>
  )
}

function CardShell({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-xl border border-black/10 bg-white shadow-sm",
        "transition hover:-translate-y-[2px] hover:shadow-md",
        onClick ? "cursor-pointer select-none" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProdCard({ product, cartQty, onAdd }) {
  const imageUrl = product.ImagenUrl || product.image_url || null
  const price = Number(product.PrecioPublico || product.price || 0)
  const stock = Number(product.Stock || product.stock || 0)
  const name = product.Nombre || product.name || ""
  const sku = product.Codigo || product.sku || ""

  const inCart = cartQty > 0

  return (
    <div
      onClick={() => onAdd(product)}
      className={[
        "relative overflow-hidden rounded-xl border bg-white",
        inCart ? "border-[1.5px]" : "border-black/10",
      ].join(" ")}
      style={inCart ? { borderColor: B.green } : {}}
    >
      {inCart && (
        <div
          className="absolute right-2 top-2 z-[2] flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
          style={{ background: B.green }}
        >
          {cartQty}
        </div>
      )}

      <div className="flex h-[88px] items-center justify-center bg-black/[0.03]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-6 w-6 opacity-30" />
        )}
      </div>

      <div className="p-2">
        {sku ? (
          <div className="mb-0.5 text-[10px] font-semibold tracking-wide text-slate-500/70">
            {sku}
          </div>
        ) : null}

        <div className="min-h-[2.4em] text-[12px] font-bold leading-[1.2] text-slate-900 line-clamp-2">
          {name}
        </div>

        <div
          className="mt-1 text-[14px] font-extrabold"
          style={{ color: B.blue }}
        >
          ${fmt(price)}
        </div>

        <div className="mt-1">
          <Pill
            style={{
              borderColor: stock > 0 ? "rgba(90,173,156,0.28)" : "rgba(230,57,70,0.28)",
              background: stock > 0 ? "rgba(90,173,156,0.10)" : "rgba(230,57,70,0.08)",
              color: stock > 0 ? B.green : "#E63946",
            }}
          >
            {stock > 0 ? `Stock: ${stock}` : "Sin stock"}
          </Pill>
        </div>
      </div>
    </div>
  )
}

// ─── Cart Row ────────────────────────────────────────────────────────────────
function CartRow({ item, onInc, onDec, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-slate-900">
          {item.name}
        </div>
        <div className="text-[12px] text-slate-500/80">
          ${fmt(item.price)} × {item.qty}{" "}
          <span className="font-bold" style={{ color: B.blue }}>
            = ${fmt(item.subtotal)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onDec(item.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-white hover:bg-red-50"
        >
          <Minus className="h-3 w-3" />
        </button>

        <div className="w-6 text-center text-[12px] font-extrabold">
          {item.qty}
        </div>

        <button
          type="button"
          onClick={() => onInc(item.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-white hover:bg-emerald-50"
        >
          <Plus className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-white hover:bg-red-50"
          title="Quitar"
        >
          <Trash2 className="h-3 w-3 text-red-600" />
        </button>
      </div>
    </div>
  )
}

// ─── Modal: Alta rápida de artículo ─────────────────────────────────────────
function ModalAltaProducto({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    tax_rate: 21,
    initial_stock: "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.name.trim() || !form.price) {
      setErr("Nombre y precio son obligatorios.")
      return
    }
    setSaving(true)
    setErr("")
    try {
      const created = await Products.createProduct({
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        price: Number(form.price),
        tax_rate: Number(form.tax_rate),
        initial_stock: form.initial_stock ? Number(form.initial_stock) : 0,
        is_active: true,
        track_stock: true,
      })
      setForm({ name: "", sku: "", price: "", tax_rate: 21, initial_stock: "" })
      onCreated(created)
    } catch (e) {
      setErr(e?.response?.data?.message || "Error al crear el artículo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" style={{ color: B.blue }} />
            Alta rápida de artículo
          </DialogTitle>
        </DialogHeader>

        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {err}
          </div>
        ) : null}

        <div className="space-y-3">
          <Input placeholder="Nombre *" value={form.name} onChange={set("name")} />
          <Input placeholder="SKU / Código (opcional)" value={form.sku} onChange={set("sku")} />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Precio *"
              type="number"
              min={0}
              value={form.price}
              onChange={set("price")}
            />
            <select
              className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
              value={form.tax_rate}
              onChange={(e) => setForm((f) => ({ ...f, tax_rate: e.target.value }))}
            >
              {IVA_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  IVA {o.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            placeholder="Stock inicial"
            type="number"
            min={0}
            value={form.initial_stock}
            onChange={set("initial_stock")}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving}
            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`, color: "white" }}
          >
            {saving ? "Guardando..." : "Crear y agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Buscar / Alta rápida de cliente ──────────────────────────────────
function ModalCliente({ open, onClose, onSelect }) {
  const [tab, setTab] = useState("buscar")
  const [q, setQ] = useState("")
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [form, setForm] = useState({
    name: "",
    tax_id: "",
    tax_condition: "consumidor_final",
    phone: "",
    email: "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    if (open) {
      setTab("buscar")
      setQ("")
      setResults([])
      setErr("")
    }
  }, [open])

  useEffect(() => {
    if (!q.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await CustomerSvc.listCustomers({ q: q.trim(), per_page: 10 })
        const arr = Array.isArray(res) ? res : res?.data || []
        setResults(arr)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [q])

  const pickCustomer = (c) => {
    onSelect({
      id: c.id,
      nombre: c.name,
      cuit: c.tax_id || "",
      email: c.email || "",
      phone: c.phone || "",
      tax_condition: c.tax_condition || "",
    })
    onClose()
  }

  const handleConsumidorFinal = () => {
    onSelect({
      id: null,
      nombre: "Consumidor Final",
      cuit: "",
      email: "",
      phone: "",
      tax_condition: "consumidor_final",
    })
    onClose()
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setErr("El nombre es obligatorio.")
      return
    }
    setSaving(true)
    setErr("")
    try {
      const raw = await CustomerSvc.createCustomer({
        name: form.name.trim(),
        tax_id: form.tax_id.trim() || undefined,
        tax_condition: form.tax_condition,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        is_active: 1,
      })
      const c = raw?.data || raw
      pickCustomer(c)
    } catch (e) {
      setErr(e?.response?.data?.message || "Error al crear el cliente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" style={{ color: B.blue }} />
            Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="flex rounded-xl border border-black/10 bg-black/[0.02] p-1">
          {[
            { v: "buscar", label: "Buscar cliente" },
            { v: "nuevo", label: "Nuevo cliente" },
          ].map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setTab(t.v)}
              className={[
                "flex-1 rounded-lg px-3 py-2 text-sm font-bold transition",
                tab === t.v ? "text-white" : "text-slate-600/80 hover:bg-black/[0.04]",
              ].join(" ")}
              style={
                tab === t.v
                  ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }
                  : {}
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "buscar" ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleConsumidorFinal}
              className="w-full justify-start"
            >
              <User className="mr-2 h-4 w-4" />
              Consumidor Final (sin datos fiscales)
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500/70" />
              <Input
                className="pl-9"
                placeholder="Buscar por nombre, CUIT o email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
            </div>

            {searching ? (
              <div className="text-center text-sm text-slate-500/70">Buscando...</div>
            ) : null}

            {results.length > 0 ? (
              <div className="max-h-[240px] overflow-auto rounded-xl border border-black/10">
                {results.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCustomer(c)}
                    className={[
                      "block w-full px-4 py-3 text-left hover:bg-black/[0.03]",
                      i < results.length - 1 ? "border-b border-black/10" : "",
                    ].join(" ")}
                  >
                    <div className="text-sm font-bold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500/70">
                      {[c.tax_id && `CUIT: ${c.tax_id}`, c.email].filter(Boolean).join(" · ")}
                    </div>
                  </button>
                ))}
              </div>
            ) : q && !searching ? (
              <div className="text-center text-sm text-slate-500/70">
                Sin resultados — podés crear un cliente nuevo en la otra pestaña.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {err ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {err}
              </div>
            ) : null}

            <Input placeholder="Nombre / Razón Social *" value={form.name} onChange={set("name")} autoFocus />

            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="CUIT / Tax ID" value={form.tax_id} onChange={set("tax_id")} />
              <select
                className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
                value={form.tax_condition}
                onChange={(e) => setForm((f) => ({ ...f, tax_condition: e.target.value }))}
              >
                {TAX_CONDITIONS.map((tc) => (
                  <option key={tc.value} value={tc.value}>
                    {tc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Teléfono" value={form.phone} onChange={set("phone")} />
              <Input placeholder="Email" type="email" value={form.email} onChange={set("email")} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          {tab === "nuevo" ? (
            <Button
              onClick={handleCreate}
              disabled={saving}
              style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`, color: "white" }}
            >
              {saving ? "Guardando..." : "Crear y seleccionar"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Método de pago ───────────────────────────────────────────────────
function ModalPago({ open, onClose, total, paymentMethods, onConfirm }) {
  const [method, setMethod] = useState(null)
  const [received, setReceived] = useState("")
  const [reference, setReference] = useState("")

  useEffect(() => {
    if (open && paymentMethods.length > 0) {
      setMethod(paymentMethods[0])
      setReceived("")
      setReference("")
    }
  }, [open, paymentMethods])

  const isCash =
    method?.code === "cash" || (method?.name || "").toLowerCase().includes("efectivo")

  const receivedNum = Number(received || 0)
  const change = isCash && receivedNum > total ? receivedNum - total : 0
  const canConfirm = !!method && (!isCash || receivedNum >= total)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" style={{ color: B.blue }} />
            Cobrar
          </DialogTitle>
        </DialogHeader>

        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "rgba(57,123,156,0.22)",
            background: `linear-gradient(135deg, rgba(57,123,156,0.10), rgba(73,148,156,0.06))`,
          }}
        >
          <div className="text-[11px] font-bold tracking-wider text-slate-500/70">
            TOTAL A COBRAR
          </div>
          <div className="mt-1 text-3xl font-extrabold" style={{ color: B.blue }}>
            ${fmt(total)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold tracking-wider text-slate-500/70">
            MÉTODO DE PAGO
          </div>

          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((pm) => {
              const sel = method?.id === pm.id || method?.name === pm.name
              return (
                <button
                  key={pm.id ?? pm.name}
                  type="button"
                  onClick={() => setMethod(pm)}
                  className={[
                    "rounded-xl border px-3 py-2 text-center text-sm font-bold transition",
                    sel ? "border-[1.5px]" : "border-black/10 hover:border-black/20",
                  ].join(" ")}
                  style={
                    sel
                      ? {
                          borderColor: B.blue,
                          background: `linear-gradient(135deg, rgba(57,123,156,0.12), rgba(73,148,156,0.07))`,
                          color: B.blue,
                        }
                      : {}
                  }
                >
                  {pm.name}
                </button>
              )
            })}
          </div>
        </div>

        {isCash ? (
          <div className="space-y-2">
            <Input
              placeholder="Monto recibido"
              type="number"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              autoFocus
            />
            {received && receivedNum < total ? (
              <div className="text-xs font-semibold text-red-600">
                Debe ser mayor o igual al total
              </div>
            ) : null}

            {change > 0 ? (
              <div
                className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{
                  borderColor: "rgba(90,173,156,0.30)",
                  background: "rgba(90,173,156,0.10)",
                }}
              >
                <div className="text-sm font-bold" style={{ color: B.green }}>
                  Vuelto
                </div>
                <div className="text-xl font-extrabold" style={{ color: B.green }}>
                  ${fmt(change)}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Input
            placeholder="Referencia / Nro. operación (opcional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm({ method, received: receivedNum, change, reference })}
            disabled={!canConfirm}
            style={{
              background: `linear-gradient(90deg, ${B.green}, ${B.teal})`,
              color: "white",
            }}
          >
            Confirmar cobro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Venta exitosa ────────────────────────────────────────────────────
function ModalExito({ open, onClose, venta, onImprimir, onWhatsApp, onEmail }) {
  const isFiscal = ["A", "B", "C"].includes(venta?.tipo_comprobante)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Venta registrada</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-white"
            style={{
              background: `linear-gradient(135deg, ${B.green}, ${B.teal})`,
              boxShadow: "0 10px 24px rgba(90,173,156,0.35)",
            }}
          >
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="text-lg font-extrabold text-slate-900">
            Venta registrada
          </div>

          <div className="text-sm text-slate-500/80">
            Comprobante {venta?.tipo_comprobante || "X"} ·{" "}
            {venta?.number || `#${venta?.id}`}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500/80">Cliente</span>
            <span className="font-bold text-slate-900">
              {venta?.cliente?.nombre || "Consumidor Final"}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-slate-500/80">Pago</span>
            <span className="font-bold text-slate-900">
              {venta?.pago?.method?.name || "—"}
            </span>
          </div>

          {venta?.pago?.change > 0 ? (
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="font-bold" style={{ color: B.green }}>
                Vuelto
              </span>
              <span className="font-extrabold" style={{ color: B.green }}>
                ${fmt(venta.pago.change)}
              </span>
            </div>
          ) : null}

          <Separator className="my-3" />

          <div className="flex items-baseline justify-between">
            <span className="text-sm font-extrabold text-slate-900">Total</span>
            <span className="text-2xl font-extrabold" style={{ color: B.blue }}>
              ${fmt(venta?.totales?.total)}
            </span>
          </div>
        </div>

        {isFiscal ? (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800">
            <div className="flex items-start gap-2">
              <Receipt className="mt-[2px] h-4 w-4" />
              Factura electrónica pendiente de autorización ARCA/AFIP. El CAE se
              asignará en el próximo ciclo de facturación.
            </div>
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          <Button
            className="w-full"
            onClick={onImprimir}
            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`, color: "white" }}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir ticket
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onWhatsApp} className="w-full">
              <Whatsapp className="mr-2 h-4 w-4" style={{ color: B.green }} />
              WhatsApp
            </Button>
            <Button variant="outline" onClick={onEmail} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Nueva venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
function CartPanel({
  items,
  itemCount,
  cliente,
  tipoComp,
  setTipoComp,
  tipoSelected,
  totales,
  procesando,
  incItem,
  decItem,
  removeItem,
  clearCart,
  setOpenCliente,
  handleCobrar,
  hideHeader = false,
}) {
  return (
    <div className="flex h-full flex-col">
      {!hideHeader ? (
        <div className="border-b border-black/10 px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" style={{ color: B.blue }} />
              <div className="text-sm font-extrabold">Orden</div>
              {itemCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="font-extrabold"
                  style={{
                    background: "rgba(57,123,156,0.10)",
                    color: B.blue,
                    border: "1px solid rgba(57,123,156,0.22)",
                  }}
                >
                  {itemCount}
                </Badge>
              ) : null}
            </div>

            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Limpiar
              </button>
            ) : null}
          </div>

          <Button
            variant="outline"
            className="mt-3 w-full justify-start"
            onClick={() => setOpenCliente(true)}
            style={
              cliente
                ? { borderColor: "rgba(57,123,156,0.45)", color: B.blue, background: "rgba(57,123,156,0.06)" }
                : {}
            }
          >
            <User className="mr-2 h-4 w-4" />
            {cliente ? cliente.nombre : "Seleccionar cliente"}
            {!cliente ? <UserPlus className="ml-auto h-4 w-4 opacity-50" /> : null}
          </Button>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {TIPOS.map((t) => {
              const sel = tipoComp === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipoComp(t.id)}
                  className={[
                    "rounded-lg border px-2 py-2 text-center text-xs font-extrabold transition",
                    sel ? "border-[1.5px]" : "border-black/10 hover:border-black/20",
                  ].join(" ")}
                  style={
                    sel
                      ? { borderColor: t.accentColor, background: "rgba(0,0,0,0.02)", color: t.accentColor }
                      : { color: "rgba(15,23,42,0.65)" }
                  }
                >
                  {t.id}
                </button>
              )
            })}
          </div>

          {tipoSelected ? (
            <div className="mt-2 text-center text-xs text-slate-500/80">
              {tipoSelected.label} — {tipoSelected.desc}
              {["A", "B", "C"].includes(tipoComp) ? " · ARCA/AFIP" : ""}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 overflow-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ShoppingCart className="h-10 w-10 opacity-10" />
            <div className="mt-3 text-sm font-bold text-slate-600">
              Carrito vacío
            </div>
            <div className="mt-1 text-xs text-slate-500/70">
              Hacé clic en un artículo para agregarlo
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                onInc={incItem}
                onDec={decItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="border-t border-black/10 px-4 pb-4 pt-3">
          <div className="space-y-1 text-sm">
            {["A", "B"].includes(tipoComp) ? (
              <div className="flex items-center justify-between text-xs text-slate-500/80">
                <span>Subtotal neto</span>
                <span className="font-bold text-slate-900">${fmt(totales.subtotal)}</span>
              </div>
            ) : null}

            {tipoComp !== "C" && totales.iva21 > 0 ? (
              <div className="flex items-center justify-between text-xs text-slate-500/80">
                <span>IVA 21%</span>
                <span className="font-bold text-slate-900">${fmt(totales.iva21)}</span>
              </div>
            ) : null}

            {tipoComp !== "C" && totales.iva105 > 0 ? (
              <div className="flex items-center justify-between text-xs text-slate-500/80">
                <span>IVA 10.5%</span>
                <span className="font-bold text-slate-900">${fmt(totales.iva105)}</span>
              </div>
            ) : null}

            <Separator className="my-2" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-extrabold">TOTAL</span>
              <span className="text-2xl font-extrabold" style={{ color: B.blue }}>
                ${fmt(totales.total)}
              </span>
            </div>
          </div>

          <Button
            className="mt-3 w-full"
            onClick={handleCobrar}
            disabled={procesando}
            style={{
              background: procesando
                ? "rgba(0,0,0,0.08)"
                : `linear-gradient(90deg, ${B.green}, ${B.teal})`,
              color: procesando ? "rgba(15,23,42,0.55)" : "white",
            }}
          >
            <ReceiptText className="mr-2 h-4 w-4" />
            {procesando ? "Procesando..." : `Cobrar $${fmt(totales.total)}`}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default function FacturarPOS() {
  // ── Mobile cart sheet ──
  const [cartOpen, setCartOpen] = useState(false)

  // ── Data state ──
  const [busca, setBusca] = useState("")
  const [prodKey, setProdKey] = useState(0)
  const [warehouses, setWarehouses] = useState([])
  const [warehouseId, setWarehouseId] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])

  // ── Cart state ──
  const [items, setItems] = useState([])
  const [cliente, setCliente] = useState(null)
  const [tipoComp, setTipoComp] = useState("X")

  // ── Modals ──
  const [openCliente, setOpenCliente] = useState(false)
  const [openAltaProd, setOpenAltaProd] = useState(false)
  const [openPago, setOpenPago] = useState(false)
  const [openExito, setOpenExito] = useState(false)
  const [openImprimir, setOpenImprimir] = useState(false)

  const [ventaGuardada, setVentaGuardada] = useState(null)
  const [procesando, setProcesando] = useState(false)

  // ── Toast simple (sin librería) ──
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" })
  const notify = (msg, sev = "success") => {
    setSnack({ open: true, msg, sev })
    window.setTimeout(() => setSnack((s) => ({ ...s, open: false })), 4500)
  }

  // ── Infinite scroll ──
  const { items: catalog, loading: catalogLoading, loadingMore, hasMore, loadMore } =
    useInfiniteProducts({ q: busca, refreshKey: prodKey })

  const containerRef = useRef(null)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { root: container, rootMargin: "200px", threshold: 0 }
    )

    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [loadMore])

  // ── Load warehouses + payment methods ──
  useEffect(() => {
    ;(async () => {
      const DEFAULT_PM = [
        { id: "cash", name: "Efectivo", code: "cash" },
        { id: "debit", name: "Débito", code: "debit" },
        { id: "credit", name: "Crédito", code: "credit" },
        { id: "transfer", name: "Transferencia", code: "transfer" },
        { id: "mp", name: "Mercado Pago", code: "mp" },
      ]

      const [wRes, pmRes] = await Promise.allSettled([
        Warehouse.listWarehouses(),
        Warehouse.listPaymentMethods(),
      ])

      if (wRes.status === "fulfilled") {
        const arr = Array.isArray(wRes.value) ? wRes.value : wRes.value?.data || []
        setWarehouses(arr)
        if (arr.length > 0) setWarehouseId(arr[0].id)
      }

      if (pmRes.status === "fulfilled") {
        const arr = Array.isArray(pmRes.value) ? pmRes.value : pmRes.value?.data || []
        setPaymentMethods(arr.length > 0 ? arr : DEFAULT_PM)
      } else {
        setPaymentMethods(DEFAULT_PM)
      }
    })()
  }, [])

  // ── Cart helpers ──
  const cartMap = useMemo(() => {
    const m = new Map()
    items.forEach((it) => m.set(it.id, it.qty))
    return m
  }, [items])

  const addItem = useCallback((prod) => {
    const id = prod.id || prod.idArticulo
    const name = prod.Nombre || prod.name || ""
    const price = Number(prod.PrecioPublico || prod.price || 0)
    const ivaPct = Number(prod.Iva ?? prod.tax_rate ?? 0)
    const ivaRate = Math.max(0, ivaPct) / 100

    setItems((prev) => {
      const ex = prev.find((x) => x.id === id)
      if (ex) {
        return prev.map((x) =>
          x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x
        )
      }
      return [...prev, { id, name, price, ivaRate, qty: 1, subtotal: price }]
    })
  }, [])

  const incItem = useCallback((id) => {
    setItems((p) =>
      p.map((x) => (x.id === id ? { ...x, qty: x.qty + 1, subtotal: (x.qty + 1) * x.price } : x))
    )
  }, [])

  const decItem = useCallback((id) => {
    setItems((p) =>
      p
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1, subtotal: (x.qty - 1) * x.price } : x))
        .filter((x) => x.qty > 0)
    )
  }, [])

  const removeItem = useCallback((id) => setItems((p) => p.filter((x) => x.id !== id)), [])
  const clearCart = useCallback(() => {
    setItems([])
    setCliente(null)
    setTipoComp("X")
  }, [])

  // ── Totals ──
  const totales = useMemo(() => {
    let total = 0,
      neto = 0
    const ivaMap = new Map()

    for (const it of items) {
      const line = Number(it.subtotal || 0)
      const rate = Number(it.ivaRate || 0)
      total += line

      if (rate > 0 && tipoComp !== "C") {
        const lineNeto = line / (1 + rate)
        neto += lineNeto
        ivaMap.set(rate, (ivaMap.get(rate) || 0) + (line - lineNeto))
      } else {
        neto += line
      }
    }

    return {
      total,
      subtotal: neto,
      iva21: ivaMap.get(0.21) || 0,
      iva105: ivaMap.get(0.105) || 0,
    }
  }, [items, tipoComp])

  // ── Handle cobrar ──
  const handleCobrar = () => {
    if (items.length === 0) {
      notify("El carrito está vacío", "warning")
      return
    }
    if (!warehouseId) {
      notify("No hay depósito configurado", "error")
      return
    }
    if (!cliente) {
      setOpenCliente(true)
      return
    }
    setOpenPago(true)
  }

  const handleClienteSelect = (c) => {
    setCliente(c)
    setOpenPago(true)
  }

  const handlePagoConfirm = async (pagoInfo) => {
    setOpenPago(false)
    setProcesando(true)

    try {
      const payload = {
        warehouse_id: warehouseId,
        customer_id: cliente?.id || null,
        sale_date: new Date().toISOString(),
        observations: `Comp. ${tipoComp} — ${cliente?.nombre || "Consumidor Final"}`,
        payment_method: pagoInfo.method?.name || "—",
        payment_reference: pagoInfo.reference || null,
        items: items.map((it) => ({
          product_id: it.id,
          qty: it.qty,
          unit_price: it.price,
          tax_rate: (it.ivaRate || 0) * 100,
          discount: 0,
        })),
      }

      const raw = await Sales.createSale(payload)
      const venta = raw?.data || raw

      // Non-blocking: register receipt
      try {
        if (typeof Sales.registerReceipts === "function") {
          await Sales.registerReceipts(venta.id, [
            {
              payment_method_id: typeof pagoInfo.method?.id === "number" ? pagoInfo.method.id : null,
              amount: totales.total,
              receipt_date: new Date().toISOString().split("T")[0],
              reference: pagoInfo.reference || null,
            },
          ])
        }
      } catch {
        // no bloquear
      }

      setVentaGuardada({
        ...venta,
        tipo_comprobante: tipoComp,
        cliente,
        items: items.map((it) => ({
          descripcion: it.name,
          name: it.name,
          cantidad: it.qty,
          qty: it.qty,
          precio: it.price,
          price: it.price,
          total: it.subtotal,
          subtotal: it.subtotal,
        })),
        totales,
        pago: { ...pagoInfo, cajero: "Cajero" },
      })

      clearCart()
      setOpenExito(true)
    } catch (e) {
      console.error(e)
      notify(e?.response?.data?.message || "Error al procesar la venta", "error")
    } finally {
      setProcesando(false)
    }
  }

  const handleWhatsApp = () => {
    const t = ventaGuardada?.tipo_comprobante
    const n = ventaGuardada?.number || ventaGuardada?.id
    const msg = `Hola! Tu comprobante ${t} N° ${n}%0ATotal: $${fmt(ventaGuardada?.totales?.total)}`
    const phone = cliente?.phone ? encodeURIComponent(String(cliente.phone).replace(/\D/g, "")) : ""
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank")
  }

  const handleEmail = () => {
    const subj = `Comprobante ${ventaGuardada?.tipo_comprobante} N° ${ventaGuardada?.number || ventaGuardada?.id}`
    const body = `Total: $${fmt(ventaGuardada?.totales?.total)}`
    window.open(
      `mailto:${cliente?.email || ""}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
    )
  }

  const tipoSelected = TIPOS.find((t) => t.id === tipoComp)
  const itemCount = items.reduce((s, it) => s + it.qty, 0)

  // Responsive simple sin MUI:
  // md+ => 2 columnas (catálogo + carrito)
  // <md => solo catálogo + sheet carrito
  return (
    <AuthenticatedLayout>
      <div className="fixed inset-x-0 bottom-0 top-[64px] bg-slate-50">
        <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_420px]">
          {/* LEFT: catálogo */}
          <div className="flex h-full flex-col border-r border-black/10">
            {/* Search bar */}
            <div className="px-4 pb-3 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500/70" />
                  <Input
                    className="pl-9 pr-9"
                    placeholder="Buscar artículo por nombre, SKU o código..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                  {busca ? (
                    <button
                      type="button"
                      onClick={() => setBusca("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-black/[0.04]"
                      title="Limpiar"
                    >
                      <X className="h-4 w-4 text-slate-500/80" />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setOpenAltaProd(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-black/20 bg-white hover:bg-black/[0.03]"
                  title="Alta rápida de artículo"
                  style={{ color: B.blue }}
                >
                  <Plus className="h-4 w-4" />
                </button>

                {warehouses.length > 1 ? (
                  <div className="min-w-[160px]">
                    <select
                      className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
                      value={warehouseId || ""}
                      onChange={(e) => setWarehouseId(e.target.value)}
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Grid */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto px-4 pb-4"
            >
              {catalogLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-[160px] animate-pulse rounded-xl border border-black/10 bg-white" />
                  ))}
                </div>
              ) : catalog.length === 0 ? (
                <div className="flex h-[60%] flex-col items-center justify-center text-center">
                  <Package className="h-10 w-10 text-slate-400/60" />
                  <div className="mt-3 text-base font-extrabold text-slate-900">
                    {busca ? "Sin resultados" : "Sin artículos activos"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500/70">
                    {busca ? "Probá con otro término de búsqueda" : "Creá tu primer artículo con el botón +"}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {catalog.map((prod) => (
                      <ProdCard
                        key={prod.id}
                        product={prod}
                        cartQty={cartMap.get(prod.id) || 0}
                        onAdd={addItem}
                      />
                    ))}

                    {loadingMore
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={`sk-more-${i}`} className="h-[160px] animate-pulse rounded-xl border border-black/10 bg-white" />
                        ))
                      : null}
                  </div>

                  <div ref={sentinelRef} className="h-px w-full" />

                  {loadingMore ? (
                    <div className="py-3 text-center text-sm text-slate-500/70">
                      Cargando más...
                    </div>
                  ) : null}

                  {!hasMore && !loadingMore && catalog.length > PAGE_SIZE ? (
                    <div className="py-4 text-center text-xs font-bold text-slate-500/70">
                      — {catalog.length} artículos cargados —
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: carrito desktop */}
          <div className="hidden h-full bg-slate-100 md:block">
            <CartPanel
              items={items}
              itemCount={itemCount}
              cliente={cliente}
              tipoComp={tipoComp}
              setTipoComp={setTipoComp}
              tipoSelected={tipoSelected}
              totales={totales}
              procesando={procesando}
              incItem={incItem}
              decItem={decItem}
              removeItem={removeItem}
              clearCart={clearCart}
              setOpenCliente={setOpenCliente}
              handleCobrar={handleCobrar}
            />
          </div>
        </div>

        {/* Mobile: botón flotante */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="fixed bottom-5 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            style={{
              background:
                items.length > 0
                  ? `linear-gradient(135deg, ${B.green}, ${B.teal})`
                  : "rgba(15,23,42,0.08)",
              color: items.length > 0 ? "white" : "rgba(15,23,42,0.55)",
            }}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 ? (
                <span
                  className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
                  style={{
                    background: "white",
                    color: B.green,
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </div>
          </button>

          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetContent side="bottom" className="h-[92vh] rounded-t-2xl p-0">
              <SheetHeader className="border-b border-black/10 px-4 py-3">
                <SheetTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" style={{ color: B.blue }} />
                    Orden
                    {itemCount > 0 ? (
                      <Badge
                        variant="secondary"
                        className="font-extrabold"
                        style={{
                          background: "rgba(57,123,156,0.10)",
                          color: B.blue,
                          border: "1px solid rgba(57,123,156,0.22)",
                        }}
                      >
                        {itemCount}
                      </Badge>
                    ) : null}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="rounded-lg p-2 hover:bg-black/[0.04]"
                    title="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </SheetTitle>
              </SheetHeader>

              <div className="h-[calc(92vh-56px)]">
                <CartPanel
                  items={items}
                  itemCount={itemCount}
                  cliente={cliente}
                  tipoComp={tipoComp}
                  setTipoComp={setTipoComp}
                  tipoSelected={tipoSelected}
                  totales={totales}
                  procesando={procesando}
                  incItem={incItem}
                  decItem={decItem}
                  removeItem={removeItem}
                  clearCart={clearCart}
                  setOpenCliente={setOpenCliente}
                  handleCobrar={() => {
                    setCartOpen(false)
                    handleCobrar()
                  }}
                  hideHeader={false}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Modales */}
        <ModalCliente
          open={openCliente}
          onClose={() => setOpenCliente(false)}
          onSelect={handleClienteSelect}
        />

        <ModalAltaProducto
          open={openAltaProd}
          onClose={() => setOpenAltaProd(false)}
          onCreated={(prod) => {
            setProdKey((k) => k + 1)
            addItem(prod)
            setOpenAltaProd(false)
          }}
        />

        <ModalPago
          open={openPago}
          onClose={() => setOpenPago(false)}
          total={totales.total}
          paymentMethods={paymentMethods}
          onConfirm={handlePagoConfirm}
        />

        <ModalExito
          open={openExito}
          onClose={() => {
            setOpenExito(false)
            setVentaGuardada(null)
          }}
          venta={ventaGuardada}
          onImprimir={() => {
            setOpenExito(false)
            setOpenImprimir(true)
          }}
          onWhatsApp={handleWhatsApp}
          onEmail={handleEmail}
        />

        {ventaGuardada ? (
          <ModalImprimir
            open={openImprimir}
            onClose={() => setOpenImprimir(false)}
            empresa={{
              razonSocial: "ARTDENT",
              condicionIva: "Responsable Inscripto",
              domicilio: "",
              cuit: "",
              iibb: "",
              inicioActividad: "",
            }}
            comprobante={{
              tipo: ventaGuardada.tipo_comprobante || "X",
              numero:
                ventaGuardada.receipt_number ||
                ventaGuardada.number ||
                `00001-${String(ventaGuardada.id || 1).padStart(8, "0")}`,
              fecha: new Date().toLocaleDateString("es-AR"),
              hora: new Date().toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            }}
            cliente={{ nombre: ventaGuardada.cliente?.nombre || "Consumidor Final" }}
            items={ventaGuardada.items || []}
            totales={ventaGuardada.totales || {}}
            pago={{ medio: ventaGuardada.pago?.method?.name || "—", cajero: ventaGuardada.pago?.cajero || "Cajero" }}
            cae={{}}
            qrImage={null}
          />
        ) : null}

        {/* Snack simple */}
        {snack.open ? (
          <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
            <div
              className={[
                "rounded-xl px-4 py-3 text-sm font-bold shadow-lg",
                snack.sev === "error" ? "bg-red-600 text-white" : "",
                snack.sev === "warning" ? "bg-amber-500 text-white" : "",
                snack.sev === "success" ? "bg-emerald-600 text-white" : "",
              ].join(" ")}
            >
              {snack.msg}
            </div>
          </div>
        ) : null}
      </div>
    </AuthenticatedLayout>
  )
}
