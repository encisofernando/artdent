import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export interface NewsletterSubscribeData {
  email: string
  name?: string
  preferences?: string[]
}

export async function subscribeNewsletter(data: NewsletterSubscribeData) {
  const response = await axios.post(`${API_URL}/newsletter/subscribe`, data)
  return response.data
}

export async function unsubscribeNewsletter(emailOrToken: string) {
  const response = await axios.post(`${API_URL}/newsletter/unsubscribe`, {
    email: emailOrToken,
  })
  return response.data
}

export async function updateNewsletterPreferences(data: {
  email: string
  preferences: string[]
}) {
  const response = await axios.put(`${API_URL}/newsletter/preferences`, data)
  return response.data
}
