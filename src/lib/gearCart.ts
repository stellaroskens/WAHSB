import { useEffect, useState } from "react"

export const GEAR_CART_KEY = "wahsb-gear-preview-cart"

/** Item count of the Team Gear preview cart saved in this browser. Ordering is not open. */
export function readGearCartCount() {
  try {
    const lines = JSON.parse(localStorage.getItem(GEAR_CART_KEY) ?? "[]") as { quantity?: number }[]
    return Array.isArray(lines) ? lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0) : 0
  } catch {
    return 0
  }
}

export function useGearCartCount() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const update = () => setCount(readGearCartCount())
    update()
    window.addEventListener("storage", update)
    return () => window.removeEventListener("storage", update)
  }, [])
  return count
}
