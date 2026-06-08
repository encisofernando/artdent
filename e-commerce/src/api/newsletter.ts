import { http } from './http'

export interface NewsletterSubscribeData {
  email: string
  name?: string
  preferences?: string[]
}

export async function subscribeNewsletter(data: NewsletterSubscribeData) {
  const response = await http.post('/newsletter/subscribe', data)
  return response.data
}

export async function unsubscribeNewsletter(emailOrToken: string) {
  const response = await http.post('/newsletter/unsubscribe', {
    email: emailOrToken,
  })
  return response.data
}

export async function updateNewsletterPreferences(data: {
  email: string
  preferences: string[]
}) {
  const response = await http.put('/newsletter/preferences', data)
  return response.data
}
