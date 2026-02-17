/**
 * Display Detection Utilities
 * Utilidades para detectar y manejar displays expansivos
 */

/**
 * Detecta si el dispositivo actual es un display expansivo 20.5:9
 */
export function isExpansiveDisplay(): boolean {
  if (typeof window === 'undefined') return false
  
  // Verificar ancho máximo y relación de aspecto
  const isNarrow = window.matchMedia('(max-width: 480px)').matches
  const isExpansiveRatio = window.matchMedia('(min-aspect-ratio: 2/1)').matches
  
  return isNarrow && isExpansiveRatio
}

/**
 * Detecta el tipo específico de display
 */
export type DisplayType = 
  | 'expansive-20.5:9'  // 20.5:9 (muy alargado)
  | 'expansive-19.5:9'  // 19.5:9 (alargado común)
  | 'standard-18:9'     // 18:9 (smartphone estándar)
  | 'standard-16:9'     // 16:9 (clásico)
  | 'tablet'            // Tablets
  | 'desktop'           // Desktop
  | 'unknown'

export function getDisplayType(): DisplayType {
  if (typeof window === 'undefined') return 'unknown'
  
  const width = window.innerWidth
  const height = window.innerHeight
  const aspectRatio = height / width
  
  // Desktop (ancho > 1024px)
  if (width > 1024) return 'desktop'
  
  // Tablet (768px - 1024px)
  if (width >= 768 && width <= 1024) return 'tablet'
  
  // Mobile - determinar por aspect ratio
  if (aspectRatio >= 2.25) return 'expansive-20.5:9'
  if (aspectRatio >= 2.1) return 'expansive-19.5:9'
  if (aspectRatio >= 1.9) return 'standard-18:9'
  if (aspectRatio >= 1.6) return 'standard-16:9'
  
  return 'unknown'
}

/**
 * Hook de React para detectar display expansivo
 */
import { useState, useEffect } from 'react'

export function useExpansiveDisplay(): boolean {
  const [isExpansive, setIsExpansive] = useState(false)
  
  useEffect(() => {
    const checkDisplay = () => {
      setIsExpansive(isExpansiveDisplay())
    }
    
    // Check inicial
    checkDisplay()
    
    // Re-check en resize
    window.addEventListener('resize', checkDisplay)
    window.addEventListener('orientationchange', checkDisplay)
    
    return () => {
      window.removeEventListener('resize', checkDisplay)
      window.removeEventListener('orientationchange', checkDisplay)
    }
  }, [])
  
  return isExpansive
}

/**
 * Hook para obtener el tipo de display
 */
export function useDisplayType(): DisplayType {
  const [displayType, setDisplayType] = useState<DisplayType>('unknown')
  
  useEffect(() => {
    const checkDisplay = () => {
      setDisplayType(getDisplayType())
    }
    
    checkDisplay()
    
    window.addEventListener('resize', checkDisplay)
    window.addEventListener('orientationchange', checkDisplay)
    
    return () => {
      window.removeEventListener('resize', checkDisplay)
      window.removeEventListener('orientationchange', checkDisplay)
    }
  }, [])
  
  return displayType
}

/**
 * Verifica si el dispositivo tiene notch (safe area)
 */
export function hasNotch(): boolean {
  if (typeof window === 'undefined') return false
  
  // Detectar safe area insets
  const root = document.documentElement
  const computedStyle = window.getComputedStyle(root)
  
  const safeAreaTop = computedStyle.getPropertyValue('env(safe-area-inset-top)') || 
                      computedStyle.getPropertyValue('-webkit-env(safe-area-inset-top)')
  
  return safeAreaTop !== '' && safeAreaTop !== '0px'
}

/**
 * Obtiene las dimensiones del safe area
 */
export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export function getSafeAreaInsets(): SafeAreaInsets {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
  
  const root = document.documentElement
  const computedStyle = window.getComputedStyle(root)
  
  const parseInset = (value: string): number => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  
  return {
    top: parseInset(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInset(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInset(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInset(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}

/**
 * Detecta si está en modo landscape
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth > window.innerHeight
}

/**
 * Hook para modo landscape
 */
export function useIsLandscape(): boolean {
  const [landscape, setLandscape] = useState(false)
  
  useEffect(() => {
    const checkOrientation = () => {
      setLandscape(isLandscape())
    }
    
    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])
  
  return landscape
}

/**
 * Obtiene información detallada del viewport
 */
export interface ViewportInfo {
  width: number
  height: number
  aspectRatio: number
  displayType: DisplayType
  isExpansive: boolean
  isLandscape: boolean
  hasNotch: boolean
  safeAreaInsets: SafeAreaInsets
  touchCapable: boolean
}

export function getViewportInfo(): ViewportInfo {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      aspectRatio: 0,
      displayType: 'unknown',
      isExpansive: false,
      isLandscape: false,
      hasNotch: false,
      safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      touchCapable: false,
    }
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerHeight / window.innerWidth,
    displayType: getDisplayType(),
    isExpansive: isExpansiveDisplay(),
    isLandscape: isLandscape(),
    hasNotch: hasNotch(),
    safeAreaInsets: getSafeAreaInsets(),
    touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  }
}

/**
 * Hook para información completa del viewport
 */
export function useViewportInfo(): ViewportInfo {
  const [info, setInfo] = useState<ViewportInfo>(getViewportInfo())
  
  useEffect(() => {
    const updateInfo = () => {
      setInfo(getViewportInfo())
    }
    
    updateInfo()
    
    window.addEventListener('resize', updateInfo)
    window.addEventListener('orientationchange', updateInfo)
    
    return () => {
      window.removeEventListener('resize', updateInfo)
      window.removeEventListener('orientationchange', updateInfo)
    }
  }, [])
  
  return info
}

/**
 * Smooth scroll helper optimizado para displays expansivos
 */
export function smoothScrollTo(
  element: HTMLElement | string,
  options?: {
    offset?: number
    behavior?: ScrollBehavior
  }
) {
  const target = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element
  
  if (!target) return
  
  const offset = options?.offset ?? 0
  const behavior = options?.behavior ?? 'smooth'
  
  const y = target.getBoundingClientRect().top + window.pageYOffset + offset
  
  window.scrollTo({
    top: y,
    behavior,
  })
}

/**
 * Detecta si el usuario prefiere reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Hook para reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = () => {
      setPrefersReduced(mediaQuery.matches)
    }
    
    handleChange()
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])
  
  return prefersReduced
}

/**
 * Crea un observer para elementos en viewport (lazy loading)
 */
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  })
}

/**
 * Debounce helper para eventos de scroll/resize
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}

/**
 * Throttle helper para mejor performance en scroll
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Clase de utilidad para logging de viewport info
 */
export class ViewportDebugger {
  private static instance: ViewportDebugger
  private debugElement: HTMLDivElement | null = null
  
  private constructor() {}
  
  static getInstance(): ViewportDebugger {
    if (!ViewportDebugger.instance) {
      ViewportDebugger.instance = new ViewportDebugger()
    }
    return ViewportDebugger.instance
  }
  
  enable() {
    if (typeof window === 'undefined') return
    
    // Crear elemento de debug
    this.debugElement = document.createElement('div')
    this.debugElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.85);
      color: #00ff00;
      font-family: monospace;
      font-size: 10px;
      padding: 8px;
      z-index: 99999;
      pointer-events: none;
      line-height: 1.4;
    `
    document.body.appendChild(this.debugElement)
    
    // Actualizar info
    const updateDebugInfo = () => {
      const info = getViewportInfo()
      if (this.debugElement) {
        this.debugElement.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
            <div>Size: ${info.width}×${info.height}</div>
            <div>Ratio: ${info.aspectRatio.toFixed(2)}:1</div>
            <div>Type: ${info.displayType}</div>
            <div>Expansive: ${info.isExpansive ? 'YES' : 'NO'}</div>
            <div>Landscape: ${info.isLandscape ? 'YES' : 'NO'}</div>
            <div>Touch: ${info.touchCapable ? 'YES' : 'NO'}</div>
            <div>Safe: T${info.safeAreaInsets.top} R${info.safeAreaInsets.right} B${info.safeAreaInsets.bottom} L${info.safeAreaInsets.left}</div>
          </div>
        `
      }
    }
    
    updateDebugInfo()
    window.addEventListener('resize', updateDebugInfo)
    window.addEventListener('orientationchange', updateDebugInfo)
  }
  
  disable() {
    if (this.debugElement && this.debugElement.parentNode) {
      this.debugElement.parentNode.removeChild(this.debugElement)
      this.debugElement = null
    }
  }
}

// Exportar una instancia única del debugger
export const viewportDebugger = ViewportDebugger.getInstance()