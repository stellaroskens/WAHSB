import { Link } from "react-router-dom"
import { useGearCartCount } from "../../lib/gearCart"
import { CartIcon } from "./icons"

/** Opens the Team Gear preview cart. The count is the real saved preview cart; ordering is not open. */
export function CartLink() {
  const count = useGearCartCount()
  return (
    <Link className="header-icon header-cart" to="/team-gear" state={{ openCart: true }}>
      <CartIcon />
      <span className="header-icon__label">Cart</span>
      {count > 0 ? <span className="header-cart__count" aria-hidden="true">{count}</span> : null}
      <span className="visually-hidden">{count === 1 ? ", 1 item in the Team Gear preview" : `, ${count} items in the Team Gear preview`}</span>
    </Link>
  )
}
