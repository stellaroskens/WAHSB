import { useState } from "react"
import {
  NAME_LIMIT,
  QTY_MAX,
  TEXT_LIMIT,
  fitLabels,
  garmentArt,
  gearColors,
  isOneSize,
  logoById,
  logos,
  placementById,
  placementOffered,
  placements,
  presetById,
  presets,
  productById,
  products,
  sizesFor,
  type GearFace,
} from "../../content/teamGearCatalog"
import { GarmentPreview, TintedGarment, previewParts } from "./GarmentPreview"
import { useGear } from "./gearContext"
import { useDialog } from "./useDialog"

const sizeLabels: Record<string, string> = {
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "XL",
  "2XL": "2XL",
  YS: "Youth small",
  YM: "Youth medium",
  YL: "Youth large",
  YXL: "Youth XL",
}

const featuredStyles = ["hoodie", "ss-tee", "ls-shirt", "polo", "zip-hoodie"]

const ORDERING_CLOSED = "Ordering isn't connected yet. There are no prices, stock, or checkout, so nothing can be purchased."
const DISCLAIMER = "Preview is illustrative; final garment colors and print placement may vary."

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
        transform="translate(-1 0)"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M6 6h15l-2 9H8L6 6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 6 5 3H2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function GearCustomizer() {
  const gear = useGear()
  const { config, notice, previewFace, setPreviewFace, setReviewOpen } = gear
  const [logoFace, setLogoFace] = useState<GearFace>("front")
  const product = productById(config.productId)
  const artwork = garmentArt[product.id] ?? garmentArt.hoodie
  const styleChoices = featuredStyles.includes(config.productId)
    ? featuredStyles.map(productById)
    : [...featuredStyles.slice(0, -1).map(productById), product]
  const colorLabel = gearColors.find((item) => item.id === config.color)?.label ?? ""
  const backAllowed = product.placements.some((id) => placementById(id)?.face === "back")
  const activeFace = logoFace === "back" && !backAllowed ? "front" : logoFace
  const activeLogoId = activeFace === "front" ? config.frontLogoId : config.backLogoId
  const oneSize = isOneSize(product)
  const sizeChoices = sizesFor(product, config.fit)
  const hasFrontLogo = config.frontLogoId !== "none"
  const hasBackLogo = backAllowed && config.backLogoId !== "none"
  const placementSummary =
    [
      hasFrontLogo ? placementById(config.frontPlacement)?.label : null,
      hasBackLogo ? placementById(config.backPlacement)?.label : null,
    ]
      .filter(Boolean)
      .join(" / ") || "No logo chosen"
  const saying = config.presetId === "custom" ? config.customText : presetById(config.presetId).text
  const customText = [config.name.trim(), saying].filter(Boolean).join(" / ")
  const textFace: GearFace =
    config.textFace === "none" ? (product.personalization === "full" ? "back" : "front") : config.textFace
  const lowContrast =
    config.color === "blue" &&
    (config.frontLogoId === "full-league" || (backAllowed && config.backLogoId === "full-league"))
  const textLeftOff =
    config.textFace !== "none" && previewParts(config, config.textFace).layout?.fits === false
  const previewLimits = [
    product.kind === "hat" || product.kind === "tote"
      ? "Hats and bags are shown flat. Curved or textured surfaces will print differently."
      : hasFrontLogo && config.frontPlacement === "sleeve"
        ? "Sleeve position and size are approximate."
        : "",
    textLeftOff
      ? `Your text doesn't fit in the print area on this ${product.name.toLowerCase()}, so the preview leaves it off. It is still listed in the summary.`
      : "",
  ].filter(Boolean)
  const unavailablePlacements = placements.filter((placement) => placement.unavailable)

  const showFace = (face: GearFace) => {
    setLogoFace(face)
    setPreviewFace(face)
  }
  const resetAll = () => {
    gear.resetDesign()
    setLogoFace("front")
  }

  const summary: [string, string][] = [
    ["Product", product.name],
    ["Color", colorLabel],
    ["Front logo", hasFrontLogo ? logoById(config.frontLogoId).name : "None"],
    ["Back logo", !backAllowed ? "Not offered" : hasBackLogo ? logoById(config.backLogoId).name : "None"],
    ["Logo placement", placementSummary],
    ["Fit", oneSize ? "Not applicable" : fitLabels[config.fit]],
    ["Size", config.size ? sizeLabels[config.size] ?? config.size : "Not chosen"],
    ["Custom text", customText ? `${customText} (${textFace})` : "None"],
  ]

  return (
    <section id="customize" className="customizer" aria-labelledby="customizer-title">
      <div className="customizer__bar">
        <h2 id="customizer-title">
          <GearIcon />
          Customize your gear
        </h2>
        <p>Choose your product, add a logo, select colors, and personalize it for the perfect team gear!</p>
      </div>

      <div className="customizer__layout">
        <div className="customizer__controls">
          <fieldset className="customizer__step">
            <legend>1. Product style</legend>
            <label className="visually-hidden" htmlFor="gear-product">
              Product
            </label>
            <select id="gear-product" value={config.productId} onChange={(event) => gear.setProduct(event.target.value)}>
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="customizer__thumbs">
              {styleChoices.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="thumb"
                  aria-pressed={item.id === config.productId}
                  aria-label={item.name}
                  title={item.name}
                  onClick={() => gear.setProduct(item.id)}
                >
                  <TintedGarment productId={item.id} color="white" face="front" />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset id="gear-colors" className="customizer__step">
            <legend>2. Color</legend>
            <div className="customizer__swatches">
              {gearColors
                .filter((color) => product.colors.includes(color.id))
                .map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className="swatch"
                    aria-pressed={config.color === color.id}
                    aria-label={color.label}
                    title={color.label}
                    style={{ background: color.hex }}
                    onClick={() => gear.setColor(color.id)}
                  />
                ))}
            </div>
          </fieldset>

          <fieldset id="gear-logos" className="customizer__step">
            <legend>3. Logo selection</legend>
            <div className="customizer__face" role="group" aria-label="Apply logo to">
              {(["front", "back"] as const).map((face) => (
                <button
                  key={face}
                  type="button"
                  aria-pressed={activeFace === face}
                  disabled={face === "back" && !backAllowed}
                  title={face === "back" && !backAllowed ? `A back print is not offered for this ${product.name}.` : undefined}
                  onClick={() => showFace(face)}
                >
                  {face === "front" ? "Front" : "Back"}
                </button>
              ))}
            </div>
            <div className="customizer__logos">
              {logos
                .filter((logo) => logo.id !== "none")
                .map((logo) => {
                  const selected = activeLogoId === logo.id
                  return (
                    <button
                      key={logo.id}
                      type="button"
                      className="logo-tile"
                      aria-pressed={selected}
                      aria-label={logo.available ? `${logo.name}, ${activeFace}` : `${logo.name}: ${logo.reason}`}
                      disabled={!logo.available}
                      title={logo.available ? logo.name : logo.reason}
                      onClick={() => {
                        const next = selected ? "none" : logo.id
                        if (activeFace === "front") gear.setFrontLogo(next)
                        else gear.setBackLogo(next)
                        setPreviewFace(activeFace)
                      }}
                    >
                      <span className="logo-tile__art">
                        {logo.src ? (
                          <img src={logo.src} width={logo.width} height={logo.height} alt="" />
                        ) : (
                          <span className="logo-tile__missing">Artwork not on file</span>
                        )}
                      </span>
                      <span className="logo-tile__name">{logo.name}</span>
                    </button>
                  )
                })}
            </div>
            <p className="customizer__hint">Select a logo again to remove it. Missing artwork stays off until the approved file is supplied.</p>
          </fieldset>

          <fieldset className="customizer__step">
            <legend>4. Logo placement</legend>
            {(["front", "back"] as const).map((face) => {
              const faceLogoId = face === "front" ? config.frontLogoId : config.backLogoId
              const faceAllowed = face === "front" || backAllowed
              const status = !faceAllowed
                ? `No back print on this ${product.name}`
                : faceLogoId === "none"
                  ? `No ${face} logo chosen yet`
                  : logoById(faceLogoId).name
              return (
                <div key={face} className="customizer__place-group">
                  <p className="customizer__place-head">
                    <strong>{face === "front" ? "Front" : "Back"}</strong>
                    <span>{status}</span>
                  </p>
                  <div className="customizer__placements">
                    {placements
                      .filter((placement) => placement.face === face)
                      .map((placement) => {
                        const zone = artwork.zones[placement.id]
                        const offered = placementOffered(product, placement.id) && Boolean(zone)
                        const selected =
                          face === "front" ? config.frontPlacement === placement.id : config.backPlacement === placement.id
                        const idle = faceAllowed && faceLogoId === "none"
                        return (
                          <button
                            key={placement.id}
                            type="button"
                            className={idle ? "place-tile is-idle" : "place-tile"}
                            aria-pressed={offered && selected}
                            disabled={!offered}
                            title={
                              offered
                                ? placement.label
                                : placement.unavailable ?? `${placement.label} is not offered for this ${product.name}.`
                            }
                            onClick={() => {
                              if (face === "front") gear.setFrontPlacement(placement.id)
                              else gear.setBackPlacement(placement.id)
                              showFace(face)
                            }}
                          >
                            <span className="place-tile__art" aria-hidden="true">
                              <span className="place-tile__fit" style={{ aspectRatio: artwork.ratio }}>
                                <TintedGarment productId={product.id} color="white" face={face} />
                                {zone && offered ? (
                                  <i
                                    className="place-tile__zone"
                                    style={{
                                      top: `${zone.top}%`,
                                      left: `${zone.left}%`,
                                      width: `${Math.max(zone.width, 14)}%`,
                                    }}
                                  />
                                ) : null}
                              </span>
                            </span>
                            <span>{placement.label}</span>
                            {offered ? null : <small className="place-tile__off">Not offered</small>}
                          </button>
                        )
                      })}
                  </div>
                </div>
              )
            })}
            {unavailablePlacements.map((placement) => (
              <p key={placement.id} className="customizer__hint">
                {placement.unavailable}
              </p>
            ))}
          </fieldset>

          <fieldset className="customizer__step">
            <legend>5. Size &amp; fit</legend>
            <div className="customizer__pair">
              <label>
                Fit
                {oneSize ? (
                  <select id="gear-fit" value="" disabled>
                    <option value="">Not applicable</option>
                  </select>
                ) : (
                  <select id="gear-fit" value={config.fit} onChange={(event) => gear.setFit(event.target.value as typeof config.fit)}>
                    {product.fits.map((fit) => (
                      <option key={fit} value={fit}>
                        {fitLabels[fit]}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <label>
                Size
                <select
                  id="gear-size"
                  value={config.size}
                  disabled={oneSize}
                  onChange={(event) => gear.setSize(event.target.value)}
                >
                  {oneSize ? null : <option value="">Choose a size</option>}
                  {sizeChoices.map((size) => (
                    <option key={size} value={size}>
                      {sizeLabels[size] ?? size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="customizer__hint">Sizes are for planning only. Supplier sizing and fit are not confirmed yet.</p>
          </fieldset>
        </div>

        <div className="customizer__stage">
          <div className="customizer__preview" data-face={previewFace}>
            {(["front", "back"] as const).map((face) => (
              <figure key={face} className={previewFace === face ? "is-active" : undefined}>
                <GarmentPreview config={config} face={face} />
                <figcaption>
                  <button type="button" aria-pressed={previewFace === face} onClick={() => showFace(face)}>
                    {face === "front" ? "Front view" : "Back view"}
                  </button>
                </figcaption>
              </figure>
            ))}
            <p className="customizer__mocknote">Illustrative mockup — not a supplier photo.</p>
            {previewLimits.map((note) => (
              <p key={note} className="customizer__mocknote">
                {note}
              </p>
            ))}
            {lowContrast ? (
              <p className="customizer__mocknote customizer__mocknote--warn">
                The full league logo has navy lettering, which is hard to read on blue. Ask the supplier about print options
                before ordering.
              </p>
            ) : null}
          </div>

          <fieldset id="gear-personalize" className="customizer__step customizer__personal">
            <legend>6. Personalization (optional)</legend>
            <div className="customizer__pair customizer__pair--name">
              <label>
                Last name
                <input
                  value={config.name}
                  maxLength={NAME_LIMIT}
                  placeholder="Last name"
                  autoComplete="off"
                  aria-describedby="gear-name-hint"
                  onChange={(event) => {
                    gear.setName(event.target.value.toUpperCase())
                    setPreviewFace(textFace)
                  }}
                />
              </label>
              <label>
                Print on
                <select
                  value={textFace}
                  onChange={(event) => {
                    const face = event.target.value as GearFace
                    gear.setTextFace(face)
                    setPreviewFace(face)
                  }}
                >
                  <option value="front">Front</option>
                  {product.personalization === "full" ? <option value="back">Back</option> : null}
                </select>
              </label>
            </div>
            <label className="customizer__saying">
              Supporter wording
              <select
                value={config.presetId}
                onChange={(event) => {
                  gear.setPreset(event.target.value)
                  setPreviewFace(textFace)
                }}
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            {config.presetId === "custom" ? (
              <label className="customizer__saying">
                Custom text (letters only, up to {TEXT_LIMIT})
                <input
                  value={config.customText}
                  maxLength={TEXT_LIMIT}
                  autoComplete="off"
                  onChange={(event) => {
                    gear.setCustomText(event.target.value)
                    setPreviewFace(textFace)
                  }}
                />
              </label>
            ) : null}
            <p id="gear-name-hint" className="customizer__hint">
              Add a last name (up to {NAME_LIMIT} letters) and supporter wording for a custom look!
            </p>
          </fieldset>
        </div>

        <aside className="order-summary" aria-labelledby="order-summary-title">
          <h3 id="order-summary-title">
            <CartIcon />
            Order summary
          </h3>
          <dl>
            {summary.map(([label, value]) => (
              <div key={label}>
                <dt>{label}:</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>
                <label htmlFor="gear-qty">Quantity:</label>
              </dt>
              <dd>
                <input
                  id="gear-qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={QTY_MAX}
                  step={1}
                  value={config.quantity}
                  onChange={(event) => gear.setQuantity(Number(event.target.value) || 1)}
                />
              </dd>
            </div>
          </dl>
          <div className="order-summary__actions">
            <button type="button" className="order-summary__review" onClick={() => setReviewOpen(true)}>
              Review design
              <span aria-hidden="true">›</span>
            </button>
            <button type="button" className="order-summary__cart" disabled aria-describedby="gear-ordering-closed">
              <CartIcon />
              Add to cart
            </button>
            <p id="gear-ordering-closed" className="order-summary__closed">
              {ORDERING_CLOSED}
            </p>
            <button type="button" className="order-summary__wish" onClick={() => gear.saveWishlist()}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              Save to wishlist <small>(this device only)</small>
            </button>
            <button type="button" className="order-summary__reset" onClick={resetAll}>
              Reset design
            </button>
          </div>
          <p className="order-summary__status" role="status">
            {notice}
          </p>
          <p className="order-summary__note">{DISCLAIMER}</p>
        </aside>
      </div>
      <GearReview summary={summary} />
    </section>
  )
}

function GearReview({ summary }: { summary: [string, string][] }) {
  const { config, reviewOpen, setReviewOpen } = useGear()
  const panelRef = useDialog<HTMLDivElement>(reviewOpen, () => setReviewOpen(false))
  const product = productById(config.productId)
  const backAllowed = product.placements.some((id) => placementById(id)?.face === "back")

  if (!reviewOpen) return null

  return (
    <div className="gear-dialog" role="presentation" onClick={() => setReviewOpen(false)}>
      <div
        ref={panelRef}
        className="gear-dialog__panel gear-review"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gear-review-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="gear-dialog__close" onClick={() => setReviewOpen(false)}>
          Close
        </button>
        <h2 id="gear-review-title">Review design</h2>
        <div className="gear-review__views">
          <figure>
            <GarmentPreview config={config} face="front" />
            <figcaption>Front</figcaption>
          </figure>
          {backAllowed ? (
            <figure>
              <GarmentPreview config={config} face="back" />
              <figcaption>Back</figcaption>
            </figure>
          ) : null}
        </div>
        <dl>
          {summary.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div>
            <dt>Quantity</dt>
            <dd>{config.quantity}</dd>
          </div>
        </dl>
        <p>{ORDERING_CLOSED}</p>
        <p className="gear-review__note">
          This review stays on this screen. Nothing has been ordered or sent to a supplier. {DISCLAIMER} Illustrative mockup —
          not a supplier photo.
        </p>
      </div>
    </div>
  )
}
