import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'span', 'h3', 'h4']
const ALLOWED_ATTR = ['href', 'target', 'rel']

/**
 * Sanitiza HTML de origen externo (ej. descripción de producto cargada
 * desde el admin) antes de renderizarlo con dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR })
}
