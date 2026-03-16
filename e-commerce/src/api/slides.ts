import { http } from './http'

export type HeroSlide = {
  id: number
  image_url: string | null
  click_url: string | null
}

export async function listHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await http.get('/hero-slides')
  return data
}
