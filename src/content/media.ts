/**
 * Web display copies of approved artwork. Each is a straight resize of its master file
 * (logos are lossless). Masters are kept unpublished in archive/website-cleanup/public/
 * at the same relative paths, for print and future edits.
 */
export const websiteLogo = {
  src: "/brand/website-logo-480.webp",
  srcSet: "/brand/website-logo-480.webp 480w, /brand/website-logo-960.webp 960w",
  width: 4269,
  height: 2400,
} as const

export const clothingLogo = {
  src: "/brand/clothing-logo-640.webp",
  width: 4269,
  height: 2400,
} as const

export const clothingLogoTransparent = {
  src: "/brand/clothing-logo-transparent-800.webp",
  srcSet: "/brand/clothing-logo-transparent-800.webp 800w, /brand/clothing-logo-transparent-1600.webp 1600w",
  width: 2309,
  height: 1068,
} as const

/** Website logo with its white background made transparent (edge flood fill only; artwork pixels untouched). */
export const websiteLogoTransparent = {
  src: "/brand/website-logo-transparent-800.webp",
  srcSet: "/brand/website-logo-transparent-800.webp 639w, /brand/website-logo-transparent-1600.webp 1279w",
  width: 1279,
  height: 853,
} as const

/** Approved bowling pins logo, trimmed from references/4.png. */
export const pinsLogo = {
  src: "/brand/pins-logo-800.webp",
  srcSet: "/brand/pins-logo-400.webp 400w, /brand/pins-logo-800.webp 800w",
  width: 800,
  height: 660,
} as const

export const homeHeroBanner = {
  src: "/images/home-hero-banner-1280.webp",
  srcSet: "/images/home-hero-banner-1280.webp 1280w, /images/home-hero-banner-2176.webp 2176w",
  width: 2176,
  height: 1025,
} as const

export const coachPortraits = {
  "cliff-meredith": {
    src: "/coaches/cliff-meredith-640.webp",
    srcSet: "/coaches/cliff-meredith-640.webp 640w, /coaches/cliff-meredith-1254.webp 1254w",
  },
  "chris-breshears": {
    src: "/coaches/chris-breshears-640.webp",
    srcSet: "/coaches/chris-breshears-640.webp 640w, /coaches/chris-breshears-1254.webp 1254w",
  },
} as const
