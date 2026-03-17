// src/components/LiveChat.tsx
// Botón flotante de WhatsApp

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? ''
const WA_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE ?? '¡Hola! Tengo una consulta sobre un producto.'

export default function LiveChat() {
  if (!WA_NUMBER) return null

  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.627 4.64 1.813 6.667L2.667 29.333l6.88-1.786A13.28 13.28 0 0 0 16.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 2.4c6.04 0 10.929 4.889 10.929 10.933 0 6.04-4.889 10.933-10.93 10.933a10.888 10.888 0 0 1-5.546-1.52l-.4-.24-4.08 1.067 1.093-3.973-.267-.413A10.87 10.87 0 0 1 5.075 16c0-6.04 4.889-10.933 10.929-10.933zm-3.2 5.466c-.267 0-.693.107-.96.373-.267.267-1.013 1-1.013 2.453s1.04 2.84 1.187 3.04c.16.2 2.027 3.147 4.96 4.293 2.453.96 2.947.773 3.48.72.533-.053 1.707-.693 1.947-1.36.24-.667.24-1.24.16-1.36-.08-.12-.267-.2-.56-.347s-1.707-.84-1.973-.933c-.267-.107-.467-.16-.667.16-.2.32-.76.933-.933 1.12-.173.2-.347.213-.64.08-.293-.133-1.24-.453-2.36-1.453-.88-.773-1.467-1.733-1.64-2.027-.173-.293-.013-.453.133-.6.133-.133.293-.347.44-.52.147-.173.2-.293.293-.493.107-.2.053-.373-.013-.52-.067-.147-.64-1.573-.88-2.147-.24-.573-.48-.48-.667-.48l-.56-.013z" />
      </svg>
    </a>
  )
}
