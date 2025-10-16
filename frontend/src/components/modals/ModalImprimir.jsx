import { forwardRef, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, useTheme
} from "@mui/material";

const mmToPx = (mm) => Math.round((mm * 96) / 25.4);
const fmt = (n = 0) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Ticket = forwardRef(
  (
    {
      size = "80",
      logoUrl,
      company = {},
      comprobante = {},
      items = [],
      totales = {},
      pago = {},
      cae = {},
      qrImage,
      footer = "Gracias por su compra.",
    },
    ref
  ) => {
    const theme = useTheme();
    const widthMM = size === "57" ? 57 : 80;
    const is57 = widthMM === 57;
    const previewWidthPx = mmToPx(widthMM);

    const subtotal = Number(
      totales.subtotal ??
        items.reduce((a, i) => a + Number(i.total ?? (i.precio || 0) * (i.cantidad || 1)), 0)
    );
    const iva21 = Number(totales.iva21 ?? 0);
    const iva105 = Number(totales.iva105 ?? 0);
    const total = Number(totales.total ?? subtotal + iva21 + iva105);

    const baseFont = is57 ? 10 : 12.5;
    const cellFont = is57 ? 9 : 11.5;
    const logoH = is57 ? 36 : 56;
    const cardPad = is57 ? "8px 6px" : "10px 8px";
    const borderPx = is57 ? "0.8px" : "1px";
    const lineMargin = is57 ? "4px 0" : "6px 0";
    const thPad = is57 ? "1px 3px" : "2px 4px";
    const tdPad = is57 ? "1px 3px" : "2px 4px";
    const descW = is57 ? "58%" : "55%";
    const colW = is57 ? "14%" : "15%";

    return (
      <div
        ref={ref}
        style={{
          width: previewWidthPx,
          margin: "0 auto",
          background: "#fff",
          color: "#000",
          fontFamily: "'Montserrat',sans-serif",
          fontSize: baseFont,
          lineHeight: 1.35,
          padding: cardPad,
          borderRadius: 6,
          border: `${borderPx} solid ${theme.palette.divider}`,
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
          @media print {
            @page { size: ${widthMM}mm auto; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          .t-center{ text-align:center; }
          .right{ text-align:right; }
          .b{ font-weight:700; }
          .semib{ font-weight:600; }
          .line{ border-bottom:${borderPx} solid #000; margin:${lineMargin}; }
          .kv{ display:flex; justify-content:space-between; }
          .muted{ opacity:.95; }
          .tabla{ width:100%; border-collapse:collapse; margin-top:${is57 ? 4 : 6}px; }
          .tabla th,.tabla td{ border:${borderPx} solid #000; padding:${tdPad}; font-size:${cellFont}px; }
          .tabla th{ text-align:center; font-weight:700; padding:${thPad}; }
          .tabla td:nth-child(1){ width:${descW}; white-space:normal; word-wrap:break-word; }
          .tabla td:nth-child(2), .tabla td:nth-child(3), .tabla td:nth-child(4){ width:${colW}; text-align:center; }
        `}</style>

        <div className="ticket-root">
          {/* LOGO */}
          <div className="t-center" style={{ marginBottom: is57 ? 4 : 6 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" style={{ maxHeight: logoH, objectFit: "contain" }} />
            ) : (
              <div className="b" style={{ fontSize: is57 ? 12 : 14 }}>
                {company.nombre || "ARTDENT"}
              </div>
            )}
          </div>

          <div className="t-center" style={{ fontSize: is57 ? 9.6 : 11 }}>
            {company.condicion || "Responsable Inscripto"}
          </div>

          <div className="line" />

          <div style={{ marginBottom: is57 ? 2 : 4 }}>
            <div className="t-center b" style={{ fontSize: is57 ? 12 : 15 }}>
              {comprobante.tipoLetra ? `FACTURA ${comprobante.tipoLetra}` : "Comprobante"}
            </div>
            {comprobante.codigo && (
              <div className="t-center muted" style={{ fontSize: is57 ? 9.5 : 11 }}>
                Cod. {comprobante.codigo}
              </div>
            )}
          </div>

          <div style={{ fontSize: is57 ? 9.8 : 11.5 }}>
            <div className="kv"><span>NRO COMPROBANTE</span><span>{comprobante.numero || "0001-00000000"}</span></div>
            <div className="kv"><span>FECHA</span><span>{comprobante.fecha || new Date().toLocaleString()}</span></div>
            <div className="kv"><span>CLIENTE</span><span>{comprobante.cliente || "Consumidor final"}</span></div>
          </div>

          <div className="line" />

          {/* TABLA DE ITEMS */}
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
                const qty = Number(it.cantidad ?? it.qty ?? 1);
                const rowTotal = Number(it.total ?? it.subtotal ?? 0);
                // 🔧 Fallback de unitario si no viene precio: total / cantidad
                const unit = Number(it.precio ?? it.price ?? (qty ? rowTotal / qty : 0));
                return (
                  <tr key={i}>
                    <td>{it.descripcion || it.name}</td>
                    <td>{qty}</td>
                    <td>{fmt(unit)}</td>
                    <td>{fmt(rowTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ fontSize: is57 ? 9.8 : 11.5, marginTop: is57 ? 3 : 4 }}>
            Cantidad de ítems: {items.reduce((a, i) => a + Number(i.cantidad ?? i.qty ?? 1), 0)}
          </div>

          <div className="line" />

          {/* TOTALES + IVA discriminado (no suma al total) */}
          <div style={{ marginBottom: is57 ? 4 : 6, fontSize: is57 ? 9.8 : 11.5 }}>
            <div className="kv b"><span>TOTAL</span><span>$ {fmt(total)}</span></div>

            {(iva21 || iva105) && (
              <div style={{ marginTop: is57 ? 2 : 3, marginBottom: is57 ? 1 : 2 }}>
                <div className="semib">TRANSPARENCIA FISCAL</div>
                {iva21 > 0 && (
                  <div className="kv">
                    <span>&nbsp;&nbsp;IVA Contenido</span>
                    <span>$ {fmt(iva21)}</span>
                  </div>
                )}
                {iva105 > 0 && (
                  <div className="kv">
                    <span>&nbsp;&nbsp;IVA 10.5%</span>
                    <span>$ {fmt(iva105)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAGO / CAJERO */}
          <div style={{ fontSize: is57 ? 9.8 : 11.5, marginBottom: is57 ? 4 : 6 }}>
            <div className="kv"><span>MEDIO DE PAGO</span><span>{pago.medio || "-"}</span></div>
            <div className="kv"><span>CAJERO</span><span>{pago.cajero || "-"}</span></div>
          </div>

          {/* CAE */}
          {(cae?.numero || cae?.vencimiento) && (
            <div style={{ fontSize: is57 ? 9.8 : 11.5, marginBottom: is57 ? 4 : 6 }}>
              {cae.numero && <div>CAE: {cae.numero}</div>}
              {cae.vencimiento && <div>FECHA VTO CAE: {cae.vencimiento}</div>}
            </div>
          )}

          {qrImage && (
            <div className="t-center" style={{ marginTop: is57 ? 4 : 6 }}>
              <img src={qrImage} alt="QR" style={{ width: is57 ? 110 : 160 }} />
            </div>
          )}

          {footer && (
            <div className="t-center" style={{ marginTop: is57 ? 4 : 6, fontSize: is57 ? 9.8 : 11.5 }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

const ModalImprimir = ({
  open,
  onClose,
  size = "80",
  logoUrl,
  company,
  comprobante,
  items,
  totales,
  pago,
  cae,
  qrImage,
  footer,
}) => {
  const ticketRef = useRef(null);

  const imprimir = () => {
    const html = ticketRef.current?.outerHTML || "";
    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
            @page { size: ${size === "57" ? "57mm" : "80mm"} auto; margin: 0; }
            body { margin:0; font-family:'Montserrat',sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>${html.replace("border: 1px solid", "border: 0")}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    const imgs = Array.from(w.document.images || []);
    Promise.all(imgs.map(img => new Promise(res => {
      if (img.complete) return res();
      img.onload = img.onerror = () => res();
    }))).then(() => {
      w.print();
      w.close();
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Vista previa del ticket ({size} mm)</DialogTitle>
      <DialogContent dividers>
        <Ticket
          ref={ticketRef}
          size={size}
          logoUrl={logoUrl}
          company={company}
          comprobante={comprobante}
          items={items}
          totales={totales}
          pago={pago}
          cae={cae}
          qrImage={qrImage}
          footer={footer}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" color="secondary" onClick={imprimir}>
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalImprimir;
