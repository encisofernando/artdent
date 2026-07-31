/**
 * Extrae un mensaje legible de un error de Axios/Laravel: prioriza los
 * mensajes de validación (response.data.errors, un array por campo) y cae
 * a response.data.message, y por último al fallback dado.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, unknown> } } })
    ?.response?.data

  if (data?.errors) {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length > 0) return messages.join(' ')
  }

  if (typeof data?.message === 'string' && data.message) return data.message

  return fallback
}
