import React, { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useFocusTrap(dialogRef, isOpen)

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl outline-none`}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 pt-6 pb-4">
            <h2 id={titleId} className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        )}
        <div className={title ? 'px-6 pb-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  )
}
