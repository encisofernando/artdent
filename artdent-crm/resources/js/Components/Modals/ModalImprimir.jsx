// resources/js/Components/modals/ModalImprimir.jsx
import { forwardRef, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"

const mmToPx = (mm) => Math.round((mm * 96) / 25.4)
const fmt = (n = 0) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const Ticket = forwardRef((props, ref) => {
  const {
    size = "80",
    logoUrl,
    empresa = {},
    comprobante = {},
    cliente = {},
    items = [],
    totales = {},
    pago = {},
    cae = {},
    qrImage,
  } = props

  const widthMM = size === "57" ? 57 : 80
  const is57 = widthMM === 57
  const previewWidthPx = mmToPx(widthMM)

  const razonSocial = empresa.razonSocial || "ARTDENT"
  const condicionIva = empresa.condicionIva || "Responsable Inscripto"
  const domicilio = empresa.domicilio || ""
  const cuit = empresa.cuit || ""
  const iibb = empresa.iibb || ""
  const inicioActividad = empresa.inicioActividad || ""

  const tipoComprobante = comprobante.tipo || "X"
  const numeroComprobante = comprobante.numero || "V00000001"
  const fecha = comprobante.fecha || new Date().toLocaleDateString("es-AR")
  const hora =
    comprobante.hora ||
    new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  const nombreCliente = cliente.nombre || "Consumidor Final"

  const iva21 = Number(totales.iva21 || 0)
  const iva105 = Number(totales.iva105 || 0)
  const total = Number(totales.total || 0)

  const medioPago = pago.medio || pago.metodo || "Efectivo"
  const cajero = pago.cajero || "Cajero"

  const mostrarCAE = ["A", "B", "C"].includes(tipoComprobante)
  const numeroCAE = cae.numero || ""
  const vencimientoCAE = cae.vencimiento || ""

  const baseFont = is57 ? 11 : 12.5
  const smallFont = is57 ? 10 : 11.5
  const cardPad = is57 ? "8px 6px" : "10px 8px"

  return (
    <div
      ref={ref}
      style={{
        width: previewWidthPx,
        margin: "0 auto",
        background: "#fff",
        color: "#000",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: baseFont,
        lineHeight: 1.4,
        padding: cardPad,
        borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.12)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        @media print {
          @page { size: ${widthMM}mm auto; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .ticket-root { width: ${widthMM}mm !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; }
        }
        .t-center { text-align: center; }
        .bold { font-weight: 700; }
        .semib { font-weight: 600; }
        .line { border-bottom: 1px solid #000; margin: 6px 0; }
        .tabla { width: 100%; border-collapse: collapse; margin-top: 6px; }
        .tabla th, .tabla td {
          padding: 4px;
          border: 1px solid #000;
          font-size: ${smallFont}px;
        }
        .tabla th { font-weight: 700; text-align: center; }
        .tabla td:nth-child(1) { text-align: left; }
        .tabla td:nth-child(2), .tabla td:nth-child(3), .tabla td:nth-child(4) { text-align: center; }
      `}</style>

      <div className="ticket-root">
        <div className="t-center" style={{ marginBottom: 6 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="logo"
              style={{ maxHeight: is57 ? 40 : 55, objectFit: "contain" }}
            />
          ) : (
            <div className="bold" style={{ fontSize: is57 ? 14 : 16 }}>
              {razonSocial}
            </div>
          )}
        </div>

        <div className="t-center" style={{ fontSize: is57 ? 10 : 11, marginBottom: 6 }}>
          {condicionIva}
        </div>

        {domicilio ? <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5 }}>{domicilio}</div> : null}
        {cuit ? <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5 }}>CUIT: {cuit}</div> : null}
        {iibb ? <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5 }}>IIBB: {iibb}</div> : null}
        {inicioActividad ? (
          <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5 }}>Inicio: {inicioActividad}</div>
        ) : null}

        <div className="line" />

        <div className="t-center bold" style={{ fontSize: is57 ? 13 : 15, marginBottom: 6 }}>
          FACTURA {tipoComprobante}
        </div>

        <div className="line" />

        <div style={{ fontSize: is57 ? 10 : 11.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>NRO COMPROBANTE</span>
            <span>{numeroComprobante}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>FECHA</span>
            <span>{fecha}, {hora}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>CLIENTE</span>
            <span>{nombreCliente}</span>
          </div>
        </div>

        <div className="line" />

        <table className="tabla">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Can</th>
              <th>Uni</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const qty = Number(it.cantidad ?? it.qty ?? 1)
              const rowTotal = Number(it.total ?? it.subtotal ?? 0)
              const unit = Number(it.precio ?? it.price ?? (qty ? rowTotal / qty : 0))
              return (
                <tr key={i}>
                  <td>{it.descripcion || it.name || "—"}</td>
                  <td>{qty}</td>
                  <td>{fmt(unit)}</td>
                  <td>{fmt(rowTotal)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ fontSize: is57 ? 9.5 : 10.5, marginTop: 4 }}>
          Cantidad de ítems: {items.reduce((a, i) => a + Number(i.cantidad ?? i.qty ?? 1), 0)}
        </div>

        <div className="line" />

        <div style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: is57 ? 12 : 14 }}>
            <span className="bold">TOTAL</span>
            <span className="bold">$ {fmt(total)}</span>
          </div>
        </div>

        {(iva21 > 0 || iva105 > 0) ? (
          <>
            <div className="semib" style={{ fontSize: is57 ? 10 : 11, marginBottom: 4 }}>
              TRANSPARENCIA FISCAL
            </div>
            {iva21 > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: is57 ? 9.5 : 10.5 }}>
                <span>IVA 21%</span>
                <span>$ {fmt(iva21)}</span>
              </div>
            ) : null}
            {iva105 > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: is57 ? 9.5 : 10.5 }}>
                <span>IVA 10.5%</span>
                <span>$ {fmt(iva105)}</span>
              </div>
            ) : null}
            <div className="line" />
          </>
        ) : null}

        <div style={{ fontSize: is57 ? 10 : 11.5, marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>MEDIO DE PAGO</span>
            <span>{medioPago}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>CAJERO</span>
            <span>{cajero}</span>
          </div>
        </div>

        {mostrarCAE && numeroCAE ? (
          <>
            <div className="line" />
            <div className="t-center semib" style={{ fontSize: is57 ? 10 : 11.5, marginTop: 6 }}>
              FACTURA ELECTRONICA
            </div>
            <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5 }}>
              CAE: {numeroCAE}
            </div>
            {vencimientoCAE ? (
              <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5, marginBottom: 4 }}>
                Vto: {vencimientoCAE}
              </div>
            ) : null}
            {qrImage ? (
              <div className="t-center" style={{ marginTop: 6, marginBottom: 6 }}>
                <img
                  src={qrImage}
                  alt="QR AFIP"
                  style={{ width: is57 ? 110 : 160, height: is57 ? 110 : 160 }}
                />
              </div>
            ) : null}
          </>
        ) : null}

        <div className="line" />
        <div className="t-center" style={{ fontSize: is57 ? 9.5 : 10.5, marginTop: 6 }}>
          Gracias por su compra.
        </div>
      </div>
    </div>
  )
})

export default function ModalImprimir({ open, onClose, ...ticketProps }) {
  const [size, setSize] = useState("80")
  const ticketRef = useRef(null)

  const imprimir = () => {
    const raw = ticketRef.current?.outerHTML || ""
    if (!raw) return

    const html = raw.replace("border: 1px solid", "border: 0")

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.setAttribute("aria-hidden", "true")
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      return
    }

    doc.open()
    doc.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Ticket</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
            @page { size: ${size === "57" ? "57mm" : "80mm"} auto; margin: 0; }
            html, body { margin:0; padding:0; }
            body { font-family:'Montserrat',sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>${html}</body>
      </html>`)
    doc.close()

    const win = iframe.contentWindow
    const imgs = Array.from(doc.images || [])
    Promise.all(
      imgs.map(
        (img) =>
          new Promise((res) => {
            if (img.complete) res()
            else img.onload = img.onerror = res
          })
      )
    ).finally(() => {
      try {
        win.focus()
        win.print()
      } finally {
        setTimeout(() => {
          try {
            document.body.removeChild(iframe)
          } catch {
            // noop
          }
        }, 500)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Vista previa del ticket ({size} mm)</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-bold text-slate-700">Tamaño:</span>
          <div className="inline-flex rounded-xl border border-black/10 bg-black/[0.02] p-1">
            <button
              type="button"
              onClick={() => setSize("57")}
              className={[
                "rounded-lg px-3 py-2 text-sm font-extrabold transition",
                size === "57" ? "text-white" : "text-slate-600/80 hover:bg-black/[0.04]",
              ].join(" ")}
              style={size === "57" ? { background: "linear-gradient(90deg, #397B9C, #49949C)" } : {}}
            >
              57mm
            </button>
            <button
              type="button"
              onClick={() => setSize("80")}
              className={[
                "rounded-lg px-3 py-2 text-sm font-extrabold transition",
                size === "80" ? "text-white" : "text-slate-600/80 hover:bg-black/[0.04]",
              ].join(" ")}
              style={size === "80" ? { background: "linear-gradient(90deg, #397B9C, #49949C)" } : {}}
            >
              80mm
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto rounded-xl border border-black/10 bg-white p-3">
          <Ticket ref={ticketRef} size={size} {...ticketProps} />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={imprimir} style={{ background: "linear-gradient(90deg, #5AAD9C, #49949C)", color: "white" }}>
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}