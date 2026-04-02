import { http } from './http'

export type HeroSlide = {
  id: number
  image_url: string | null
  click_url: string | null
  slide_type: 'image' | 'editorial'
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  description: string | null
  button_label: string | null
  button_url: string | null
  content_align: 'left' | 'center' | 'right'
  content_width: 'sm' | 'md' | 'lg'
  height_mode: 'compact' | 'regular' | 'immersive'
  font_style: 'brand' | 'editorial' | 'impact'
  title_size: 'sm' | 'md' | 'lg' | 'xl'
  body_size: 'sm' | 'md' | 'lg'
  overlay_strength: 'none' | 'soft' | 'medium' | 'strong'
  surface_style: 'none' | 'glass' | 'solid'
  eyebrow_color: string | null
  title_color: string | null
  subtitle_color: string | null
  description_color: string | null
  button_bg_color: string | null
  button_text_color: string | null
  button_border_color: string | null
}

export async function listHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await http.get('/hero-slides')
  return data
}
