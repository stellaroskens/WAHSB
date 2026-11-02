import { library, venues } from "./site"
import type { LibraryListing } from "../lib/content/siteContent"

export type DirectoryListing = LibraryListing
export const proShops = library.resources.proShops
export const bowlingCenters = library.resources.bowlingCenters

export function listingDetails(listing: DirectoryListing) {
  const venue = listing.venueId ? venues.find((item) => item.id === listing.venueId) : undefined
  return {
    address: listing.address ?? venue?.address ?? null,
    phone: listing.phone ?? venue?.phone ?? null,
    website: listing.website ?? venue?.website ?? null,
  }
}

export function businessDirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}
