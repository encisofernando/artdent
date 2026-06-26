import { useConfig } from '../contexts/ConfigContext'

export default function WhatsAppButton() {
  const config = useConfig()
  const number = config.company.whatsapp

  if (!number) return null

  const href = `https://wa.me/${number.replace(/\D/g, '')}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      {/* WhatsApp SVG oficial */}
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.477.644 4.8 1.77 6.82L2 30l7.37-1.738A13.933 13.933 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.568 11.568 0 0 1-5.89-1.61l-.42-.25-4.37 1.03 1.07-4.27-.27-.44A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4c6.41 0 11.6 5.19 11.6 11.6 0 6.41-5.19 11.6-11.6 11.6zm6.36-8.68c-.35-.18-2.06-1.02-2.38-1.13-.32-.12-.56-.18-.79.18-.23.35-.9 1.13-1.1 1.37-.2.23-.4.26-.75.09-.35-.18-1.47-.54-2.8-1.73-1.03-.92-1.73-2.06-1.93-2.41-.2-.35-.02-.54.15-.72.16-.16.35-.41.52-.62.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.62-.09-.18-.79-1.9-1.08-2.6-.28-.68-.57-.59-.79-.6H9.6c-.23 0-.6.09-.91.44-.32.35-1.2 1.17-1.2 2.85s1.23 3.3 1.4 3.53c.18.23 2.42 3.7 5.86 5.19 3.44 1.48 3.44 1 4.06.94.62-.06 2.06-.84 2.36-1.65.29-.82.29-1.52.2-1.67-.09-.14-.32-.23-.67-.41z" />
      </svg>
    </a>
  )
}
