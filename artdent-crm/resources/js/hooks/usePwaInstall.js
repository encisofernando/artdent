import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/Contexts/ToastContext';

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  if (typeof window === 'undefined') {
    return false;
  }

  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|opr\//.test(ua);

  return isIos && isSafari;
}

export function usePwaInstall() {
  const toast = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayMode = () => setIsInstalled(isStandaloneMode());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayMode);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayMode);
    };
  }, []);

  const canInstall = useMemo(() => {
    if (isInstalled) {
      return false;
    }

    return Boolean(deferredPrompt) || isIosSafari();
  }, [deferredPrompt, isInstalled]);

  const promptInstall = useCallback(async () => {
    if (isIosSafari() && !deferredPrompt) {
      toast.info('En Safari tocá Compartir y luego "Agregar a pantalla de inicio".');
      return false;
    }

    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));

    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  return {
    canInstall,
    isInstalled,
    promptInstall,
  };
}
