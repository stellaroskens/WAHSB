import { categories, type GearColor } from "../../content/teamGearCatalog"
import { TintedGarment } from "./GarmentPreview"
import { useGear } from "./gearContext"

const cardArt: Record<string, [string, GearColor][]> = {
  tshirts: [
    ["ss-tee", "white"],
    ["ss-tee", "red"],
    ["ss-tee", "blue"],
  ],
  longsleeve: [
    ["ls-shirt", "white"],
    ["ls-shirt", "red"],
    ["ls-shirt", "blue"],
  ],
  polos: [
    ["polo", "white"],
    ["polo", "red"],
    ["polo", "blue"],
  ],
  fleece: [
    ["crew", "white"],
    ["hoodie", "red"],
    ["zip-hoodie", "blue"],
  ],
  jackets: [
    ["zip-jacket", "white"],
    ["windbreaker", "red"],
    ["zip-jacket", "blue"],
  ],
  accessories: [
    ["cap", "white"],
    ["tote", "blue"],
    ["beanie", "red"],
  ],
}

export function SpiritWear() {
  const { config, setCategory } = useGear()

  return (
    <section className="spirit-wear" aria-labelledby="spirit-wear-title">
      <h2 id="spirit-wear-title">
        <span>Albany High School Bowling — Team Spirit Wear</span>
      </h2>
      <p className="spirit-wear__lead">
        Parents, students, grandparents, alumni and supporters can customize apparel and show their support for Albany High
        School Bowling!
      </p>
      <ul className="spirit-wear__grid">
        {categories.map((category) => {
          const active = config.categoryId === category.id
          return (
            <li key={category.id}>
              <button
                type="button"
                className="spirit-card"
                aria-pressed={active}
                onClick={() => {
                  setCategory(category.id)
                  document.getElementById("customize")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
              >
                <span className={`spirit-card__art spirit-card__art--${category.id}`} aria-hidden="true">
                  {(cardArt[category.id] ?? []).map(([productId, color], index) => (
                    <span key={`${productId}-${color}-${index}`} className="spirit-card__garment">
                      <TintedGarment productId={productId} color={color} face="front" />
                    </span>
                  ))}
                </span>
                <strong>{category.label}</strong>
                <small>{category.detail}</small>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="spirit-wear__note">Illustrative mockups — not supplier photos. Choose a category to start a blank design below.</p>
    </section>
  )
}
