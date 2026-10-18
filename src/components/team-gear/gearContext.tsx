import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  NAME_LIMIT,
  ONE_SIZE,
  QTY_MAX,
  TEXT_LIMIT,
  fitLabels,
  isOneSize,
  logoById,
  placementById,
  placementOffered,
  productById,
  productsInCategory,
  sizesFor,
  type Product,
  type GearColor,
  type GearFace,
  type GearFit,
} from "../../content/teamGearCatalog"
import { GEAR_CART_KEY } from "../../lib/gearCart"

const CART_KEY = GEAR_CART_KEY
const WISH_KEY = "wahsb-gear-preview-wishlist"
const LEGACY_COACH_KEY = "wahsb-coach-preview"

/** Team gear personalization is a last name and supporter wording only. There is no player number. */
export type TeamGearCustomization = {
  categoryId: string
  productId: string
  color: GearColor
  fit: GearFit
  size: string
  frontLogoId: string
  backLogoId: string
  frontPlacement: string
  backPlacement: string
  name: string
  presetId: string
  customText: string
  textFace: GearFace | "none"
  quantity: number
}

export type ShopConfig = TeamGearCustomization

export type CartLine = {
  id: string
  fingerprint: string
  config: ShopConfig
  quantity: number
  savedAt: string
}

type GearContextValue = {
  config: ShopConfig
  notice: string
  cart: CartLine[]
  wishlist: CartLine[]
  cartCount: number
  menuOpen: boolean
  search: string
  searchOpen: boolean
  cartOpen: boolean
  reviewOpen: boolean
  previewFace: GearFace
  setMenuOpen: (open: boolean) => void
  setSearch: (value: string) => void
  setSearchOpen: (open: boolean) => void
  setCartOpen: (open: boolean) => void
  setReviewOpen: (open: boolean) => void
  setPreviewFace: (face: GearFace) => void
  setCategory: (categoryId: string) => void
  setProduct: (productId: string) => void
  setColor: (color: GearColor) => void
  setFit: (fit: GearFit) => void
  setSize: (size: string) => void
  setFrontLogo: (logoId: string) => void
  setBackLogo: (logoId: string) => void
  setFrontPlacement: (placementId: string) => void
  setBackPlacement: (placementId: string) => void
  setName: (value: string) => void
  setPreset: (presetId: string) => void
  setCustomText: (value: string) => void
  setTextFace: (face: GearFace | "none") => void
  setQuantity: (quantity: number) => void
  resetDesign: () => void
  removeLine: (id: string) => void
  saveWishlist: () => string
  removeWish: (id: string) => void
}

const GearContext = createContext<GearContextValue | null>(null)

const blankConfig = (): ShopConfig => ({
  categoryId: "fleece",
  productId: "hoodie",
  color: "blue",
  fit: "mens",
  size: "",
  frontLogoId: "none",
  backLogoId: "none",
  frontPlacement: "front-center",
  backPlacement: "back-center",
  name: "",
  presetId: "none",
  customText: "",
  textFace: "none",
  quantity: 1,
})

export function cleanName(value: string) {
  return value.replace(/[^A-Za-z .'-]/g, "").slice(0, NAME_LIMIT)
}

function cleanText(value: string) {
  return value.replace(/[^A-Za-z .,'’!-]/g, "").slice(0, TEXT_LIMIT)
}

function fingerprint(config: ShopConfig) {
  return JSON.stringify({
    productId: config.productId,
    color: config.color,
    fit: config.fit,
    size: config.size,
    frontLogoId: config.frontLogoId,
    backLogoId: config.backLogoId,
    frontPlacement: config.frontPlacement,
    backPlacement: config.backPlacement,
    name: config.name.trim().toUpperCase(),
    presetId: config.presetId,
    customText: config.customText.trim(),
    textFace: config.textFace,
  })
}

/** Rebuilds a saved design from known fields only, so older saves that held a number lose it. */
function sanitizeConfig(raw: Partial<ShopConfig> | undefined): ShopConfig {
  const base = blankConfig()
  if (!raw || typeof raw !== "object") return base
  const product = productById(String(raw.productId ?? base.productId))
  const restored: ShopConfig = {
    categoryId: product.categoryId,
    productId: product.id,
    color: raw.color === "red" || raw.color === "white" ? raw.color : "blue",
    fit: raw.fit === "womens" || raw.fit === "youth" ? raw.fit : "mens",
    size: typeof raw.size === "string" ? raw.size : "",
    frontLogoId: typeof raw.frontLogoId === "string" ? raw.frontLogoId : "none",
    backLogoId: typeof raw.backLogoId === "string" ? raw.backLogoId : "none",
    frontPlacement: typeof raw.frontPlacement === "string" ? raw.frontPlacement : base.frontPlacement,
    backPlacement: typeof raw.backPlacement === "string" ? raw.backPlacement : base.backPlacement,
    name: cleanName(typeof raw.name === "string" ? raw.name : "").toUpperCase(),
    presetId: typeof raw.presetId === "string" ? raw.presetId : "none",
    customText: cleanText(typeof raw.customText === "string" ? raw.customText : ""),
    textFace: raw.textFace === "front" || raw.textFace === "back" ? raw.textFace : "none",
    quantity: Math.min(QTY_MAX, Math.max(1, Number(raw.quantity) || 1)),
  }
  if (!logoById(restored.frontLogoId).available) restored.frontLogoId = "none"
  if (!logoById(restored.backLogoId).available) restored.backLogoId = "none"
  return applyProductChange(restored, product.id).config
}

function readLines(key: string): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]") as Partial<CartLine>[]
    if (!Array.isArray(raw)) return []
    return raw.map((line) => {
      const config = sanitizeConfig(line.config)
      return {
        id: typeof line.id === "string" ? line.id : crypto.randomUUID(),
        fingerprint: fingerprint(config),
        config,
        quantity: Math.min(QTY_MAX, Math.max(1, Number(line.quantity) || 1)),
        savedAt: typeof line.savedAt === "string" ? line.savedAt : new Date().toISOString(),
      }
    })
  } catch {
    return []
  }
}

/** Keeps a size only if it is listed for the product and fit; one-size items always use their single size. */
function fittedSize(product: Product, fit: ShopConfig["fit"], size: string) {
  if (isOneSize(product)) return ONE_SIZE
  return sizesFor(product, fit).includes(size) ? size : ""
}

function applyProductChange(current: ShopConfig, productId: string) {
  const product = productById(productId)
  const next: ShopConfig = {
    ...current,
    productId: product.id,
    categoryId: product.categoryId,
  }
  const notes: string[] = []
  if (!isOneSize(product) && !product.fits.includes(next.fit)) {
    next.fit = product.fits[0]
    notes.push(`${fitLabels[next.fit]} is the fit offered for this item.`)
  }
  if (!product.colors.includes(next.color)) next.color = product.colors[0]
  next.size = fittedSize(product, next.fit, next.size)
  if (!placementOffered(product, next.frontPlacement)) {
    if (next.frontLogoId !== "none") {
      notes.push(`${placementById(next.frontPlacement)?.label ?? "That placement"} is not offered for this ${product.name}.`)
    }
    next.frontPlacement = product.placements[0]
  }
  if (!placementOffered(product, next.backPlacement)) {
    const back = product.placements.find((id) => placementById(id)?.face === "back")
    if (!back) {
      if (next.backLogoId !== "none" || next.textFace === "back") notes.push("A back print is not offered for this item, so the back design was cleared.")
      next.backLogoId = "none"
      next.backPlacement = product.placements[0]
      if (next.textFace === "back") next.textFace = "front"
    } else {
      if (next.backLogoId !== "none") {
        notes.push(`${placementById(next.backPlacement)?.label ?? "That back placement"} is not offered for this ${product.name}.`)
      }
      next.backPlacement = back
    }
  }
  if (product.personalization === "front-only") {
    next.backLogoId = "none"
    if (next.textFace === "back") next.textFace = "front"
  }
  return { config: next, notice: notes[0] ?? "" }
}

export function GearProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ShopConfig>(blankConfig)
  const [notice, setNotice] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [wishlist, setWishlist] = useState<CartLine[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [previewFace, setPreviewFace] = useState<GearFace>("front")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCart(readLines(CART_KEY))
    setWishlist(readLines(WISH_KEY))
    localStorage.removeItem(LEGACY_COACH_KEY)
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, ready])

  useEffect(() => {
    if (ready) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist))
  }, [wishlist, ready])

  const update = (patch: Partial<ShopConfig>, nextNotice = "") => {
    setConfig((current) => ({ ...current, ...patch }))
    setNotice(nextNotice)
  }

  const value = useMemo<GearContextValue>(() => {
    const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
    return {
      config,
      notice,
      cart,
      wishlist,
      cartCount,
      menuOpen,
      search,
      searchOpen,
      cartOpen,
      reviewOpen,
      previewFace,
      setMenuOpen,
      setSearch,
      setSearchOpen,
      setCartOpen,
      setReviewOpen,
      setPreviewFace,
      setCategory: (categoryId) => {
        const first = productsInCategory(categoryId)[0]
        if (!first) return
        const applied = applyProductChange(config, first.id)
        setConfig(applied.config)
        setNotice(applied.notice)
      },
      setProduct: (productId) => {
        const applied = applyProductChange(config, productId)
        setConfig(applied.config)
        setNotice(applied.notice)
      },
      setColor: (color) => {
        if (!productById(config.productId).colors.includes(color)) {
          setNotice("That color is not offered for this item.")
          return
        }
        update({ color })
      },
      setFit: (fit) => {
        const product = productById(config.productId)
        if (!product.fits.includes(fit)) {
          setNotice(`${fitLabels[fit]} is not offered for this item.`)
          return
        }
        const size = fittedSize(product, fit, config.size)
        update({ fit, size }, config.size && !size ? `Choose a ${fitLabels[fit]} size.` : "")
      },
      setSize: (size) => {
        const product = productById(config.productId)
        if (size && !sizesFor(product, config.fit).includes(size)) {
          setNotice("That size is not listed for this fit.")
          return
        }
        update({ size })
      },
      setFrontLogo: (logoId) => {
        const logo = logoById(logoId)
        if (!logo.available) {
          setNotice(logo.reason)
          return
        }
        update({ frontLogoId: logoId })
      },
      setBackLogo: (logoId) => {
        const product = productById(config.productId)
        const logo = logoById(logoId)
        if (!logo.available) {
          setNotice(logo.reason)
          return
        }
        if (logoId !== "none" && !product.placements.some((id) => placementById(id)?.face === "back")) {
          setNotice("A back logo is not offered for this item.")
          return
        }
        update({ backLogoId: logoId })
      },
      setFrontPlacement: (placementId) => {
        const product = productById(config.productId)
        const placement = placementById(placementId)
        if (!placement || placement.face !== "front" || !placementOffered(product, placementId)) {
          setNotice(placement?.unavailable ?? "That front placement is not offered for this item.")
          return
        }
        update({ frontPlacement: placementId })
      },
      setBackPlacement: (placementId) => {
        const product = productById(config.productId)
        const placement = placementById(placementId)
        if (!placement || placement.face !== "back" || !placementOffered(product, placementId)) {
          setNotice(placement?.unavailable ?? "That back placement is not offered for this item.")
          return
        }
        update({ backPlacement: placementId })
      },
      setName: (value) => {
        const name = cleanName(value)
        const product = productById(config.productId)
        const textFace = config.textFace === "none" && name ? "back" : config.textFace
        update({
          name,
          textFace: product.personalization === "front-only" && textFace === "back" ? "front" : textFace,
        })
      },
      setPreset: (presetId) => {
        const textFace = presetId === "none" ? config.textFace : config.textFace === "none" ? "back" : config.textFace
        const product = productById(config.productId)
        update({
          presetId,
          customText: presetId === "custom" ? config.customText : "",
          textFace: product.personalization === "front-only" && textFace === "back" ? "front" : textFace,
        })
      },
      setCustomText: (value) => {
        const product = productById(config.productId)
        const textFace = config.textFace === "none" ? "back" : config.textFace
        update({
          customText: cleanText(value),
          presetId: "custom",
          textFace: product.personalization === "front-only" && textFace === "back" ? "front" : textFace,
        })
      },
      setTextFace: (face) => {
        const product = productById(config.productId)
        if (face === "back" && product.personalization !== "full") {
          setNotice("Back text is not offered for this item.")
          return
        }
        update({ textFace: face })
      },
      setQuantity: (quantity) => update({ quantity: Math.min(QTY_MAX, Math.max(1, Math.round(quantity))) }),
      resetDesign: () => {
        const product = productById(config.productId)
        const fit = isOneSize(product) || product.fits.includes(config.fit) ? config.fit : product.fits[0]
        setConfig({
          ...blankConfig(),
          categoryId: product.categoryId,
          productId: product.id,
          color: config.color,
          fit,
          size: fittedSize(product, fit, ""),
        })
        setPreviewFace("front")
        setNotice("Design cleared. The garment is blank again.")
      },
      removeLine: (id) => setCart((current) => current.filter((line) => line.id !== id)),
      saveWishlist: () => {
        const linePrint = fingerprint(config)
        const already = wishlist.some((line) => line.fingerprint === linePrint)
        const message = already
          ? "This design is already saved on this device."
          : "Saved as a draft on this device only. Nothing was sent or ordered."
        if (!already) {
          setWishlist((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              fingerprint: linePrint,
              config: { ...config, quantity: 1 },
              quantity: 1,
              savedAt: new Date().toISOString(),
            },
          ])
        }
        setNotice(message)
        return message
      },
      removeWish: (id) => setWishlist((current) => current.filter((line) => line.id !== id)),
    }
  }, [cart, cartOpen, config, menuOpen, notice, previewFace, reviewOpen, search, searchOpen, wishlist])

  return <GearContext.Provider value={value}>{children}</GearContext.Provider>
}

export function useGear() {
  const value = useContext(GearContext)
  if (!value) throw new Error("useGear must be used inside GearProvider")
  return value
}
