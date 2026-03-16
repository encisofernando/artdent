import { http } from './http'

export type SidebarBanner = {
  id: number
  title: string | null
  subtitle: string | null
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
}

export async function listSidebarBanners(): Promise<SidebarBanner[]> {
  const { data } = await http.get('/sidebar-banners')
  return data
}
