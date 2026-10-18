import { clothingLogoTransparent, pinsLogo } from "./media"

export type GearColor = "red" | "blue" | "white"
export type GearFit = "mens" | "womens" | "youth"
export type GearFace = "front" | "back"
export type Personalization = "full" | "front-only"

export type LogoAsset = {
  id: string
  name: string
  src: string | null
  available: boolean
  reason: string
  width?: number
  height?: number
}

export type Placement = {
  id: string
  label: string
  face: GearFace
  top: string
  left: string
  width: string
  /** Set when the placement is never offered, with the reason shown to shoppers. */
  unavailable?: string
}

export type Product = {
  id: string
  categoryId: string
  name: string
  kind: "tee" | "longsleeve" | "polo" | "crew" | "hoodie" | "jacket" | "hat" | "tote"
  fits: GearFit[]
  colors: GearColor[]
  placements: string[]
  personalization: Personalization
  sizes: string[]
}

export type Category = {
  id: string
  label: string
  detail: string
  kind: Product["kind"]
}

export const gearColors: { id: GearColor; label: string; hex: string }[] = [
  { id: "red", label: "Red", hex: "#c12927" },
  { id: "blue", label: "Blue", hex: "#1f4e9b" },
  { id: "white", label: "White", hex: "#f7f8fb" },
]

export const logos: LogoAsset[] = [
  {
    id: "none",
    name: "No logo",
    src: null,
    available: true,
    reason: "",
  },
  {
    id: "full-league",
    name: "Full league logo",
    src: clothingLogoTransparent.src,
    available: true,
    reason: "",
    width: clothingLogoTransparent.width,
    height: clothingLogoTransparent.height,
  },
  {
    id: "pins",
    name: "Bowling pins logo",
    src: pinsLogo.src,
    available: true,
    reason: "",
    width: pinsLogo.width,
    height: pinsLogo.height,
  },
  {
    id: "horizontal",
    name: "Horizontal logo",
    src: null,
    available: false,
    reason: "A separate horizontal file is not on file. The approved clothing logo is the full league logo.",
  },
  {
    id: "south-albany",
    name: "South Albany Redhawks",
    src: null,
    available: false,
    reason: "South Albany emblem artwork is not approved for apparel yet.",
  },
  {
    id: "west-albany",
    name: "West Albany Bulldogs",
    src: null,
    available: false,
    reason: "West Albany emblem artwork is not approved for apparel yet.",
  },
  {
    id: "lebanon",
    name: "Lebanon Warriors",
    src: null,
    available: false,
    reason: "Lebanon LW artwork is not approved as its own apparel file yet.",
  },
]

export const placements: Placement[] = [
  { id: "front-center", label: "Front center", face: "front", top: "40%", left: "50%", width: "46%" },
  { id: "left-chest", label: "Left chest", face: "front", top: "30%", left: "30%", width: "22%" },
  { id: "sleeve", label: "Sleeve", face: "front", top: "34%", left: "14%", width: "16%" },
  {
    id: "pocket",
    label: "Pocket",
    face: "front",
    top: "36%",
    left: "64%",
    width: "18%",
    unavailable: "Pocket printing is not offered. These garments have no pocket and no supplier has confirmed it.",
  },
  { id: "back-center", label: "Back center", face: "back", top: "34%", left: "50%", width: "42%" },
  { id: "upper-back", label: "Upper back", face: "back", top: "20%", left: "50%", width: "34%" },
]

const apparelPlacements = ["front-center", "left-chest", "back-center", "upper-back", "sleeve"]
const apparelSizes = ["S", "M", "L", "XL", "2XL"]
const youthSizes = ["YS", "YM", "YL", "YXL"]
export const ONE_SIZE = "One size"

export const categories: Category[] = [
  { id: "tshirts", label: "T-shirts", detail: "Short Sleeve", kind: "tee" },
  { id: "longsleeve", label: "Long-sleeve shirts", detail: "Performance & Cotton", kind: "longsleeve" },
  { id: "polos", label: "Polo shirts", detail: "Team & Casual", kind: "polo" },
  { id: "fleece", label: "Sweatshirts & hoodies", detail: "Stay Warm, Show Your Support", kind: "hoodie" },
  { id: "jackets", label: "Jackets", detail: "Team Outerwear", kind: "jacket" },
  { id: "accessories", label: "Accessories", detail: "Hats, Bags & More", kind: "hat" },
]

export const products: Product[] = [
  {
    id: "ss-tee",
    categoryId: "tshirts",
    name: "Short-sleeve T-shirt",
    kind: "tee",
    fits: ["mens", "womens", "youth"],
    colors: ["red", "blue", "white"],
    placements: apparelPlacements,
    personalization: "full",
    sizes: [...apparelSizes, ...youthSizes],
  },
  {
    id: "ls-shirt",
    categoryId: "longsleeve",
    name: "Long-sleeve shirt",
    kind: "longsleeve",
    fits: ["mens", "womens", "youth"],
    colors: ["red", "blue", "white"],
    placements: apparelPlacements,
    personalization: "full",
    sizes: [...apparelSizes, ...youthSizes],
  },
  {
    id: "polo",
    categoryId: "polos",
    name: "Polo shirt",
    kind: "polo",
    fits: ["mens", "womens", "youth"],
    colors: ["red", "blue", "white"],
    placements: apparelPlacements,
    personalization: "full",
    sizes: [...apparelSizes, ...youthSizes],
  },
  {
    id: "crew",
    categoryId: "fleece",
    name: "Crewneck sweatshirt",
    kind: "crew",
    fits: ["mens", "womens", "youth"],
    colors: ["red", "blue", "white"],
    placements: apparelPlacements,
    personalization: "full",
    sizes: [...apparelSizes, ...youthSizes],
  },
  {
    id: "hoodie",
    categoryId: "fleece",
    name: "Hoodie (pullover)",
    kind: "hoodie",
    fits: ["mens", "womens", "youth"],
    colors: ["red", "blue", "white"],
    placements: apparelPlacements,
    personalization: "full",
    sizes: [...apparelSizes, ...youthSizes],
  },
  {
    id: "zip-hoodie",
    categoryId: "fleece",
    name: "Zip hoodie",
    kind: "hoodie",
    fits: ["mens", "womens", "youth"],
    colors: ["red", "blue", "white"],
    placements: apparelPlacements,
    personalization: "full",
    sizes: [...apparelSizes, ...youthSizes],
  },
  {
    id: "windbreaker",
    categoryId: "jackets",
    name: "Windbreaker",
    kind: "jacket",
    fits: ["mens", "womens"],
    colors: ["red", "blue", "white"],
    placements: ["front-center", "left-chest", "back-center", "upper-back"],
    personalization: "full",
    sizes: apparelSizes,
  },
  {
    id: "zip-jacket",
    categoryId: "jackets",
    name: "Zip jacket",
    kind: "jacket",
    fits: ["mens", "womens"],
    colors: ["red", "blue", "white"],
    placements: ["front-center", "left-chest", "back-center", "upper-back"],
    personalization: "full",
    sizes: apparelSizes,
  },
  {
    id: "cap",
    categoryId: "accessories",
    name: "Cap",
    kind: "hat",
    fits: [],
    colors: ["red", "blue", "white"],
    placements: ["front-center"],
    personalization: "front-only",
    sizes: [ONE_SIZE],
  },
  {
    id: "beanie",
    categoryId: "accessories",
    name: "Beanie",
    kind: "hat",
    fits: [],
    colors: ["red", "blue", "white"],
    placements: ["front-center"],
    personalization: "front-only",
    sizes: [ONE_SIZE],
  },
  {
    id: "tote",
    categoryId: "accessories",
    name: "Tote bag",
    kind: "tote",
    fits: [],
    colors: ["red", "blue", "white"],
    placements: ["front-center"],
    personalization: "front-only",
    sizes: [ONE_SIZE],
  },
]

export const presets = [
  { id: "none", label: "None", text: "" },
  { id: "mom", label: "Proud Bowling Mom", text: "Proud Bowling Mom" },
  { id: "dad", label: "Proud Bowling Dad", text: "Proud Bowling Dad" },
  { id: "grandma", label: "Proud Bowling Grandma", text: "Proud Bowling Grandma" },
  { id: "grandpa", label: "Proud Bowling Grandpa", text: "Proud Bowling Grandpa" },
  { id: "parent", label: "Proud Bowling Parent", text: "Proud Bowling Parent" },
  { id: "family", label: "Proud Bowling Family", text: "Proud Bowling Family" },
  { id: "coach", label: "Bowling Coach", text: "Bowling Coach" },
  { id: "supporter", label: "Bowling Team Supporter", text: "Bowling Team Supporter" },
  { id: "custom", label: "Custom text", text: "" },
] as const

type Zone = { top: number; left: number; width: number }

export type GarmentArt = {
  front: string
  back: string
  ratio: number
  zones: Partial<Record<string, Zone>>
  /** `bottom` is the lowest printable point for text (default 90): above a cap brim, inside a beanie cuff. */
  text: { front: number; backTop: number; bottom?: number }
  textWidth: number
}

const art = (
  file: string,
  width: number,
  height: number,
  zones: GarmentArt["zones"],
  text: GarmentArt["text"],
  textWidth = 46,
): GarmentArt => ({
  front: `/team-gear/mockups/${file}-front.webp`,
  back: `/team-gear/mockups/${file}-back.webp`,
  ratio: width / height,
  zones,
  text,
  textWidth,
})

/** Illustrative blank mockups (not supplier photos). Zone values are percentages of each image box. */
export const garmentArt: Record<string, GarmentArt> = {
  "ss-tee": art(
    "tee",
    522,
    579,
    {
      "front-center": { top: 37, left: 50, width: 40 },
      "left-chest": { top: 25, left: 64, width: 15 },
      "back-center": { top: 40, left: 50, width: 42 },
      "upper-back": { top: 19, left: 50, width: 30 },
      sleeve: { top: 18, left: 11, width: 10 },
    },
    { front: 36, backTop: 15 },
  ),
  "ls-shirt": art(
    "longsleeve",
    470,
    559,
    {
      "front-center": { top: 33, left: 50, width: 36 },
      "left-chest": { top: 22, left: 62, width: 13 },
      "back-center": { top: 37, left: 50, width: 38 },
      "upper-back": { top: 18, left: 50, width: 28 },
      sleeve: { top: 30, left: 13, width: 8 },
    },
    { front: 33, backTop: 14 },
    40,
  ),
  polo: art(
    "polo",
    482,
    574,
    {
      "front-center": { top: 40, left: 50, width: 36 },
      "left-chest": { top: 28, left: 64, width: 14 },
      pocket: { top: 33, left: 63, width: 12 },
      "back-center": { top: 40, left: 50, width: 40 },
      "upper-back": { top: 20, left: 50, width: 30 },
      sleeve: { top: 22, left: 10, width: 9 },
    },
    { front: 40, backTop: 16 },
  ),
  crew: art(
    "crew",
    478,
    530,
    {
      "front-center": { top: 35, left: 50, width: 36 },
      "left-chest": { top: 24, left: 62, width: 13 },
      "back-center": { top: 38, left: 50, width: 38 },
      "upper-back": { top: 19, left: 50, width: 28 },
      sleeve: { top: 36, left: 10, width: 8 },
    },
    { front: 35, backTop: 15 },
    42,
  ),
  hoodie: art(
    "hoodie",
    522,
    566,
    {
      "front-center": { top: 47, left: 50, width: 36 },
      "left-chest": { top: 40, left: 63, width: 13 },
      "back-center": { top: 52, left: 50, width: 38 },
      "upper-back": { top: 37, left: 50, width: 28 },
      sleeve: { top: 46, left: 11, width: 8 },
    },
    { front: 47, backTop: 33 },
    42,
  ),
  "zip-hoodie": art(
    "zip-hoodie",
    480,
    576,
    {
      "front-center": { top: 45, left: 50, width: 34 },
      "left-chest": { top: 38, left: 65, width: 13 },
      "back-center": { top: 50, left: 50, width: 38 },
      "upper-back": { top: 35, left: 50, width: 28 },
      sleeve: { top: 46, left: 9, width: 8 },
    },
    { front: 45, backTop: 31 },
    42,
  ),
  windbreaker: art(
    "windbreaker",
    464,
    565,
    {
      "front-center": { top: 37, left: 50, width: 34 },
      "left-chest": { top: 29, left: 64, width: 13 },
      "back-center": { top: 40, left: 50, width: 38 },
      "upper-back": { top: 24, left: 50, width: 28 },
    },
    { front: 37, backTop: 20 },
    42,
  ),
  "zip-jacket": art(
    "zip-jacket",
    426,
    540,
    {
      "front-center": { top: 38, left: 50, width: 34 },
      "left-chest": { top: 30, left: 64, width: 13 },
      "back-center": { top: 41, left: 50, width: 38 },
      "upper-back": { top: 25, left: 50, width: 28 },
    },
    { front: 38, backTop: 21 },
    42,
  ),
  cap: art(
    "cap",
    435,
    421,
    { "front-center": { top: 40, left: 50, width: 34 } },
    { front: 40, backTop: 40, bottom: 66 },
    50,
  ),
  beanie: art(
    "beanie",
    442,
    485,
    { "front-center": { top: 80, left: 50, width: 26 } },
    { front: 80, backTop: 80, bottom: 96 },
    56,
  ),
  tote: art(
    "tote",
    363,
    614,
    { "front-center": { top: 70, left: 50, width: 56 } },
    { front: 72, backTop: 72, bottom: 95 },
    64,
  ),
}

export const garmentTint: Record<GearColor, string | null> = {
  red: "#cf2431",
  blue: "#2350b5",
  white: null,
}

export const fitLabels: Record<GearFit, string> = {
  mens: "Men's",
  womens: "Women's",
  youth: "Youth",
}

export const NAME_LIMIT = 14
export const TEXT_LIMIT = 22
export const QTY_MAX = 10

export function productById(id: string) {
  return products.find((item) => item.id === id) ?? products[0]
}

export function logoById(id: string) {
  return logos.find((item) => item.id === id) ?? logos[0]
}

export function placementById(id: string) {
  return placements.find((item) => item.id === id)
}

export function presetById(id: string) {
  return presets.find((item) => item.id === id) ?? presets[0]
}

export function colorHex(color: GearColor) {
  return gearColors.find((item) => item.id === color)?.hex ?? "#1f4e9b"
}

export function productsInCategory(categoryId: string) {
  return products.filter((item) => item.categoryId === categoryId)
}

export function isOneSize(product: Product) {
  return product.fits.length === 0
}

/** Youth fit lists youth sizes; adult fits list adult sizes. */
export function sizesFor(product: Product, fit: GearFit) {
  if (isOneSize(product)) return product.sizes
  const youth = fit === "youth"
  return product.sizes.filter((size) => youthSizes.includes(size) === youth)
}

export function placementOffered(product: Product, placementId: string) {
  const placement = placementById(placementId)
  return Boolean(placement && !placement.unavailable && product.placements.includes(placementId))
}
