export function registerPwa() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (window.location.protocol !== 'https:' && !isLocal) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((error) => console.error('[PWA] Error al registrar Service Worker del CRM:', error));
  });
}
