import { describe, it, expect } from 'vitest'
import { getApiErrorMessage } from './apiError'

describe('getApiErrorMessage', () => {
  it('prioriza los mensajes de validación (errors) sobre message', () => {
    const err = {
      response: {
        data: {
          message: 'The given data was invalid.',
          errors: { email: ['El email ya está registrado.'] },
        },
      },
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe('El email ya está registrado.')
  })

  it('junta varios campos de error en un solo mensaje', () => {
    const err = {
      response: {
        data: {
          errors: {
            email: ['El email ya está registrado.'],
            password: ['La contraseña es muy corta.'],
          },
        },
      },
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe(
      'El email ya está registrado. La contraseña es muy corta.'
    )
  })

  it('usa message cuando no hay errors', () => {
    const err = { response: { data: { message: 'Correo o contraseña incorrectos.' } } }
    expect(getApiErrorMessage(err, 'fallback')).toBe('Correo o contraseña incorrectos.')
  })

  it('cae al fallback si no hay response (error de red)', () => {
    expect(getApiErrorMessage(new Error('Network Error'), 'No se pudo conectar.')).toBe(
      'No se pudo conectar.'
    )
  })

  it('cae al fallback si errors está vacío', () => {
    const err = { response: { data: { errors: {} } } }
    expect(getApiErrorMessage(err, 'fallback')).toBe('fallback')
  })

  it('no rompe con null/undefined', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback')
    expect(getApiErrorMessage(undefined, 'fallback')).toBe('fallback')
  })
})
