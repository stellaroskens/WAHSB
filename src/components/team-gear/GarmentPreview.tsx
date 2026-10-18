import type { CSSProperties } from "react"
import {
  garmentArt,
  garmentTint,
  logoById,
  placementById,
  presetById,
  type GearColor,
  type GearFace,
} from "../../content/teamGearCatalog"
import type { ShopConfig } from "./gearContext"

type PreviewProps = {
  config: ShopConfig
  face: GearFace
}

/** A white blank mockup photo, tinted to the chosen color only where the garment is opaque. */
export function TintedGarment({
  productId,
  color,
  face,
  label,
}: {
  productId: string
  color: GearColor
  face: GearFace
  label?: string
}) {
  const artwork = garmentArt[productId] ?? garmentArt.hoodie
  const src = face === "front" ? artwork.front : artwork.back
  const tint = garmentTint[color]
  const mask = `url("${src}")`
  return (
    <span className="garment" style={{ aspectRatio: artwork.ratio }}>
      <img src={src} alt={label ?? ""} loading="lazy" decoding="async" />
      {tint ? (
        <span
          className="garment__tint"
          aria-hidden="true"
          style={{ background: tint, WebkitMaskImage: mask, maskImage: mask } as CSSProperties}
        />
      ) : null}
    </span>
  )
}

export function GarmentPreview({ config, face }: PreviewProps) {
  const artwork = garmentArt[config.productId] ?? garmentArt.hoodie
  const ink = config.color === "white" ? "#102c8d" : "#ffffff"
  const { logo, zone, saying, layout } = previewParts(config, face)
  const textStyle = { color: ink, width: `${artwork.textWidth}%` }
  const productLabel = face === "front" ? "Front view" : "Back view"
  const blocks = layout?.blocks ?? []

  return (
    <div className="mock">
      <TintedGarment productId={config.productId} color={config.color} face={face} label={productLabel} />
      {zone && logo.src ? (
        <img
          className="mock-logo"
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt=""
          style={{ top: `${zone.top}%`, left: `${zone.left}%`, width: `${zone.width}%` }}
        />
      ) : null}
      {blocks.map((block) => {
        const name = block.name && config.name ? config.name : ""
        const words = block.saying ? saying : ""
        if (!name && !words) return null
        return (
          <p
            key={block.anchor + block.top}
            className="mock-text"
            style={{ ...textStyle, top: `${block.top}%`, transform: anchorShift[block.anchor] }}
          >
            {name ? (
              <span className="mock-name" style={{ fontSize: `${layout?.nameSize}cqw` }}>
                {name}
              </span>
            ) : null}
            {words ? <span className="mock-saying">{words}</span> : null}
          </p>
        )
      })}
    </div>
  )
}

type Anchor = "center" | "top" | "bottom"
type TextBlock = { top: number; anchor: Anchor; name: boolean; saying: boolean }
type TextLayout = { blocks: TextBlock[]; nameSize: number; fits: boolean }

const anchorShift: Record<Anchor, string> = {
  center: "translate(-50%, -50%)",
  top: "translate(-50%, 0)",
  bottom: "translate(-50%, -100%)",
}

const TEXT_GAP = 2.5
const NAME_SIZE = 8.6
const SAYING_SIZE = 4.6
const LINE_HEIGHT = 0.95
/** Widest average uppercase character of the display face, in em, so estimates err toward wrapping. */
const CHAR_EM = 0.62

/** The logo and text layout for one face, shared by the preview and the customizer's fit note. */
export function previewParts(config: ShopConfig, face: GearFace) {
  const artwork = garmentArt[config.productId] ?? garmentArt.hoodie
  const placementId = face === "front" ? config.frontPlacement : config.backPlacement
  const logo = logoById(face === "front" ? config.frontLogoId : config.backLogoId)
  const zone = artwork.zones[placementId]
  const showLogo = Boolean(logo.available && logo.src && placementById(placementId)?.face === face && zone)
  const saying = config.presetId === "custom" ? config.customText : presetById(config.presetId).text
  const layout =
    config.textFace === face && (config.name || saying)
      ? textLayout(artwork, showLogo ? zone : undefined, logo, placementId, face, config.name, saying)
      : null
  return { logo, zone: showLogo ? zone : undefined, saying, layout }
}

function lineCount(text: string, size: number, width: number) {
  const perLine = Math.max(1, Math.floor(width / (size * CHAR_EM)))
  let lines = 1
  let used = 0
  for (const word of text.trim().split(/\s+/)) {
    const next = used ? used + 1 + word.length : word.length
    if (next <= perLine) {
      used = next
      continue
    }
    if (used) lines += 1
    lines += Math.ceil(word.length / perLine) - 1
    used = word.length % perLine || perLine
  }
  return lines
}

/**
 * Places the name and wording clear of the logo, using the logo's real proportions, and reports
 * whether they fit above the garment's lowest printable point. Values are % of the image box height.
 */
function textLayout(
  artwork: (typeof garmentArt)[string],
  zone: { top: number; width: number } | undefined,
  logo: { width?: number; height?: number },
  placementId: string,
  face: GearFace,
  name: string,
  saying: string,
): TextLayout {
  const nameSize = name ? Math.min(NAME_SIZE, artwork.textWidth / (name.length * CHAR_EM)) : 0
  const nameHeight = nameSize * LINE_HEIGHT * artwork.ratio
  const sayingHeight = saying
    ? lineCount(saying, SAYING_SIZE, artwork.textWidth) * SAYING_SIZE * LINE_HEIGHT * artwork.ratio
    : 0
  const height = nameHeight + sayingHeight + (name && saying ? 1 : 0)
  const lowest = artwork.text.bottom ?? 90
  const placed = (blocks: TextBlock[], bottom: number): TextLayout => {
    const fits = bottom <= lowest
    return { blocks: fits ? blocks : [], nameSize, fits }
  }
  const all = (top: number, anchor: Anchor): TextBlock[] => [{ top, anchor, name: true, saying: true }]

  if (!zone || placementId === "sleeve") {
    const center = face === "front" ? artwork.text.front : artwork.text.backTop
    return placed(all(center, "center"), center + height / 2)
  }

  const logoRatio = logo.width && logo.height ? logo.width / logo.height : 2
  const half = (zone.width * artwork.ratio) / logoRatio / 2
  const logoTop = zone.top - half
  const logoBottom = zone.top + half

  if (face === "back" && placementId === "back-center" && name && logoTop - TEXT_GAP - nameHeight / 2 >= artwork.text.backTop) {
    return placed(
      [
        { top: logoTop - TEXT_GAP, anchor: "bottom", name: true, saying: false },
        { top: logoBottom + TEXT_GAP, anchor: "top", name: false, saying: true },
      ],
      saying ? logoBottom + TEXT_GAP + sayingHeight : logoTop,
    )
  }
  return placed(all(logoBottom + TEXT_GAP, "top"), logoBottom + TEXT_GAP + height)
}
