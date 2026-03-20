import { useState, useRef } from 'react'
import { Upload, FileCheck2, Hourglass, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'
import { submitPaymentReport, type PaymentReport } from '../api/paymentReport'
import type { CustomerOrder } from '../api/customer'

export default function PaymentReportButton({ order, onReported }: {
  order: CustomerOrder
  onReported: (report: PaymentReport) => void
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const report = order.payment_report

  if (report?.status === 'approved') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
        <ThumbsUp size={15} className="shrink-0 text-green-600" />
        <span className="font-semibold">Pago aprobado</span>
      </div>
    )
  }

  if (report?.status === 'pending') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5 text-sm text-blue-700">
        <Hourglass size={15} className="shrink-0 text-blue-500" />
        <span>Comprobante enviado — <span className="font-semibold">en revisión</span></span>
      </div>
    )
  }

  const wasRejected = report?.status === 'rejected'

  const doSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true); setErr(null)
    try {
      const result = await submitPaymentReport(order.code, file, notes)
      onReported(result)
      setOpen(false)
      setFile(null)
      setNotes('')
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'No se pudo enviar el comprobante.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <div className="space-y-1.5">
        {wasRejected && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            <ThumbsDown size={14} className="shrink-0" />
            Comprobante rechazado. Por favor enviá uno nuevo.
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
        >
          <Upload size={15} />
          {wasRejected ? 'Enviar nuevo comprobante' : 'Informar pago'}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--brand-primary)]/30 bg-[var(--brand-soft)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <FileCheck2 size={16} className="text-[var(--brand-primary)]" />
          Informe de pago
        </p>
        <button
          onClick={() => { setOpen(false); setFile(null); setErr(null) }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancelar
        </button>
      </div>
      <form onSubmit={doSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Comprobante de transferencia *
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-[var(--brand-primary)] px-4 py-3 cursor-pointer transition-colors"
          >
            <Upload size={18} className="text-gray-400 shrink-0" />
            <div className="min-w-0">
              {file ? (
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Seleccioná tu comprobante</p>
                  <p className="text-xs text-gray-400">JPG, PNG, PDF — máx. 8 MB</p>
                </>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nota (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 resize-none"
            rows={2}
            placeholder="Número de comprobante, banco, fecha…"
            maxLength={1000}
          />
        </div>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={!file || loading}
          className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
        >
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Enviando…</>
            : <><Upload size={14} /> Enviar comprobante</>
          }
        </button>
      </form>
    </div>
  )
}
