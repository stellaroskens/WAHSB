import catalogFile from "./published/publicMedia.json"
import { homeHeroBanner } from "./media"
import { imageForPlacement, parseMediaCatalog, type MediaItem } from "../lib/media/publicMedia"

export const publicMediaItems: MediaItem[] = parseMediaCatalog(catalogFile)

export function placedImage(placement: string, fallbackSrc: string): { src: string; objectPosition: string; alt: string | null } {
  const item = imageForPlacement(publicMediaItems, placement)
  if (!item) return { src: fallbackSrc, objectPosition: "center", alt: null }
  return { src: item.path, objectPosition: item.objectPosition, alt: item.alt }
}

export function homeHeroImage(): { src: string; srcSet?: string; objectPosition: string } {
  const placed = placedImage("home-hero", homeHeroBanner.src)
  if (placed.src === homeHeroBanner.src) {
    return { src: homeHeroBanner.src, srcSet: homeHeroBanner.srcSet, objectPosition: "center 42%" }
  }
  return { src: placed.src, objectPosition: placed.objectPosition }
}
