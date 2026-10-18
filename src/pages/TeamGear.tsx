import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { PageMeta } from "../components/PageMeta"
import { GearCustomizer } from "../components/team-gear/GearCustomizer"
import { GearHeader } from "../components/team-gear/GearHeader"
import { GearHero, GearSteps, GearTrust } from "../components/team-gear/GearHero"
import { GearProvider, useGear, type CartLine } from "../components/team-gear/gearContext"
import { SpiritWear } from "../components/team-gear/SpiritWear"
import { useDialog } from "../components/team-gear/useDialog"
import { gearColors, productById } from "../content/teamGearCatalog"
import "../styles/team-gear.css"

export function TeamGear() {
  return (
    <GearProvider>
      <PageMeta
        title="Team Gear | Albany High School Bowling"
        description="Team gear preview for Albany High School Bowling. Ordering is not open."
      />
      <div className="gear-viewport">
        <div className="gear-shell">
          <GearHeader />
          <GearHero />
          <GearSteps />
          <SpiritWear />
          <GearCustomizer />
          <GearTrust />
        </div>
      </div>
      <GearCart />
    </GearProvider>
  )
}

function lineLabel(line: CartLine) {
  const product = productById(line.config.productId)
  const color = gearColors.find((item) => item.id === line.config.color)?.label ?? ""
  return [product.name, color, line.config.name].filter(Boolean).join(" · ")
}

function GearCart() {
  const { cartOpen, setCartOpen, cart, wishlist, removeLine, removeWish } = useGear()
  const panelRef = useDialog<HTMLDivElement>(cartOpen, () => setCartOpen(false))
  const location = useLocation()

  useEffect(() => {
    if ((location.state as { openCart?: boolean } | null)?.openCart) setCartOpen(true)
  }, [location.state, setCartOpen])

  if (!cartOpen) return null

  return (
    <div className="gear-dialog" role="presentation" onClick={() => setCartOpen(false)}>
      <div
        ref={panelRef}
        className="gear-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gear-cart-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="gear-dialog__close" onClick={() => setCartOpen(false)}>
          Close
        </button>
        <h2 id="gear-cart-title">Cart</h2>
        <p className="gear-cart__closed">
          Ordering isn't connected yet, so nothing can be added to the cart or purchased. There are no prices or checkout.
        </p>
        {cart.length > 0 ? (
          <>
            <h3>Older preview items on this device</h3>
            <ul className="gear-cart__list">
              {cart.map((line) => (
                <li key={line.id}>
                  <span>
                    {lineLabel(line)} <small>× {line.quantity}</small>
                  </span>
                  <button type="button" onClick={() => removeLine(line.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Your cart is empty.</p>
        )}
        <h3>Wishlist drafts on this device</h3>
        {wishlist.length === 0 ? (
          <p>No saved designs yet. Use “Save to wishlist” in the customizer to keep a draft in this browser.</p>
        ) : (
          <ul className="gear-cart__list">
            {wishlist.map((line) => (
              <li key={line.id}>
                <span>{lineLabel(line)}</span>
                <button type="button" onClick={() => removeWish(line.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="gear-cart__fine">Drafts stay in this browser only. Nothing is sent to the team.</p>
      </div>
    </div>
  )
}
