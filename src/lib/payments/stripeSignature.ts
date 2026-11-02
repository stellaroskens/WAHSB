const MAX_AGE_SECONDS = 300

/** Stripe's signed payload is `${timestamp}.${rawBody}`, compared with the v1 HMAC. */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds: number,
): Promise<"valid" | "missing" | "invalid"> {
  if (!header || !secret) return "missing"
  const items = header.split(",").map((part) => {
    const splitAt = part.indexOf("=")
    return [part.slice(0, splitAt), part.slice(splitAt + 1)] as const
  })
  const timestamp = items.find(([key]) => key === "t")?.[1]
  const signatures = items.filter(([key]) => key === "v1").map(([, value]) => value)
  const seconds = Number(timestamp)
  if (!timestamp || !Number.isFinite(seconds) || signatures.length === 0) return "invalid"
  if (Math.abs(nowSeconds - seconds) > MAX_AGE_SECONDS) return "invalid"
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${seconds}.${payload}`)))
  const expected = [...mac].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  const matches = signatures.some((signature) => timingSafeEqual(expected, signature))
  return matches ? "valid" : "invalid"
}

function timingSafeEqual(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index)
  }
  return difference === 0
}
