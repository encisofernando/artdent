/**
 * Utilidades para validación
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function isValidCUIT(cuit: string): boolean {
  const cleaned = cuit.replace(/\D/g, '')
  return cleaned.length === 11
}

export function isStrongPassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}
