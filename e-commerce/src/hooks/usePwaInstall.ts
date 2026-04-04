import { useCallback, useEffect, useMemo, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(ua)
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|opr\//.test(ua)

  return isIos && isSafari
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode())

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayMode = () => setIsInstalled(isStandaloneMode())

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    mediaQuery.addEventListener?.('change', handleDisplayMode)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      mediaQuery.removeEventListener?.('change', handleDisplayMode)
    }
  }, [])

  const canInstall = useMemo(() => {
    if (isInstalled) return false
    return Boolean(deferredPrompt) || isIosSafari()
  }, [deferredPrompt, isInstalled])

  const promptInstall = useCallback(async () => {
    if (isIosSafari() && !deferredPrompt) {
      window.alert('En Safari tocá Compartir y después "Agregar a pantalla de inicio".')
      return false
    }

    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed', platform: '' }))

    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
      return true
    }

    return false
  }, [deferredPrompt])

  return {
    canInstall,
    isInstalled,
    promptInstall,
  }
}
