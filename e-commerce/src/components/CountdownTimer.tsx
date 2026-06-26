import { useEffect, useState } from 'react'

type Props = {
  endsAt: string | null | undefined
  onExpire?: () => void
  className?: string
}

function getRemaining(endsAt: string): number {
  return Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
}

function format(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CountdownTimer({ endsAt, onExpire, className = '' }: Props) {
  const [remaining, setRemaining] = useState<number | null>(() =>
    endsAt ? getRemaining(endsAt) : null,
  )

  useEffect(() => {
    if (!endsAt) return
    const initial = getRemaining(endsAt)
    if (initial === 0) { onExpire?.(); return }
    setRemaining(initial)

    const id = setInterval(() => {
      const r = getRemaining(endsAt)
      setRemaining(r)
      if (r === 0) { clearInterval(id); onExpire?.() }
    }, 1000)

    return () => clearInterval(id)
  }, [endsAt, onExpire])

  if (!endsAt || remaining === null || remaining === 0) return null

  const urgent = remaining < 3600 // < 1 hour

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums ${urgent ? 'text-red-600' : 'text-amber-600'} ${className}`}
      aria-label={`Oferta termina en ${format(remaining)}`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 fill-current" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm.5 2a.5.5 0 0 0-1 0v3.25l2.146 2.147a.5.5 0 0 0 .708-.707L8.5 7.793V4.5z" />
      </svg>
      {format(remaining)}
    </span>
  )
}
