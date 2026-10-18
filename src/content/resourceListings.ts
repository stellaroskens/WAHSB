import { venues, type Venue } from "./site"

export type BusinessHours = {
  day: string
  text: string
}

export type DirectoryListing = {
  id: string
  name: string
  city: string
  venueId?: Venue["id"]
  address?: string
  phone?: string
  phoneNote?: string
  website?: string
  hours?: readonly BusinessHours[]
  hoursNote?: string
  status?: string
  points: readonly string[]
}

const hoursNotConfirmed = "Hours: Not confirmed — please contact the business."

export const proShops: readonly DirectoryListing[] = [
  {
    id: "albany-bowling-center-pro-shop",
    name: "Albany Bowling Center Pro Shop",
    city: "Albany, OR",
    status: "An operating pro shop under this name in Albany, Oregon could not be confirmed.",
    hoursNote: hoursNotConfirmed,
    points: ["Ball plugging and redrilling", "Resurfacing", "Engraving", "Finger and thumb inserts"],
  },
  {
    id: "players-edge-pro-shop",
    name: "Players Edge Pro Shop",
    city: "Lebanon, OR",
    address: "2250 S. Main Road, Lebanon, OR 97355",
    phone: "(541) 451-3900",
    phoneNote: "Published phone for Linn Lanes. A separate pro shop number is not listed.",
    website: "https://linnlanes.com/ProShop/proshop.htm",
    hours: [{ day: "Monday", text: "By appointment only" }],
    hoursNote:
      "By appointment — contact business to confirm availability. Tuesday through Sunday are not listed on the shop page.",
    points: [
      "Inside Linn Lanes",
      "Aaron Heintzman",
      "By appointment",
      "Bowling balls, bags, and shoes",
      "Custom drilling",
      "Oval thumb-hole fitting",
    ],
  },
  {
    id: "emerald-lanes-pro-shop",
    name: "Emerald Lanes Pro Shop",
    city: "Eugene, OR",
    address: "140 Oakway Rd, Eugene, OR 97401",
    phone: "(541) 342-2611",
    website: "https://emeraldlaneseugene.com/bowling-pro-shop-eugene/",
    hoursNote: `${hoursNotConfirmed} The center website does not list a separate pro shop schedule.`,
    points: [
      "Full-service bowling pro shop",
      "Bowling balls and equipment",
      "Reactive bowling balls",
      "Starter equipment packages",
    ],
  },
  {
    id: "bowtech-factory-pro-shop",
    name: "Bowtech Factory Pro Shop",
    city: "Eugene, OR",
    status: "An active public bowling pro shop under this name could not be confirmed.",
    hoursNote: hoursNotConfirmed,
    points: ["Factory-direct bowling equipment", "Pro shop services"],
  },
  {
    id: "larrys-pro-shop",
    name: "Larry's Pro Shop",
    city: "Portland — Lents",
    address: "3550 SE 92nd Ave, Portland, OR 97266-1955",
    phone: "(503) 772-2142",
    website: "https://larrysproshop.net/",
    hours: [
      { day: "Monday", text: "12:00 PM – 7:00 PM" },
      { day: "Tuesday", text: "12:00 PM – 7:00 PM" },
      { day: "Wednesday", text: "12:00 PM – 7:00 PM" },
      { day: "Thursday", text: "12:00 PM – 7:00 PM" },
      { day: "Friday", text: "12:00 PM – 7:00 PM" },
      { day: "Saturday", text: "12:00 PM – 6:00 PM" },
      { day: "Sunday", text: "12:00 PM – 6:00 PM" },
    ],
    points: ["Custom ball drilling", "Resurfacing", "Ball de-oiling"],
  },
  {
    id: "the-pro-shoppe",
    name: "The Pro Shoppe",
    city: "Gresham, OR",
    address: "2311 E Powell Blvd, Gresham, OR 97080",
    website: "https://mthoodlanes.com/bowling/pro-shoppe",
    hours: [
      { day: "Monday", text: "Closed" },
      { day: "Tuesday", text: "2:00 PM – 7:00 PM" },
      { day: "Wednesday", text: "2:00 PM – 7:00 PM" },
      { day: "Thursday", text: "2:00 PM – 7:00 PM" },
      { day: "Friday", text: "2:00 PM – 7:00 PM" },
      { day: "Saturday", text: "10:00 AM – 5:00 PM" },
      { day: "Sunday", text: "Closed" },
    ],
    hoursNote: "Inside Mt. Hood Lanes. These are the shop hours published on the center’s pro shop page.",
    points: ["Independent bowling equipment shop", "Bowling balls and accessories"],
  },
  {
    id: "tendown-pro-shop",
    name: "TenDown Pro Shop",
    city: "Roseburg, OR",
    address: "2400 NE Diamond Lake Blvd, Roseburg, OR 97470",
    phone: "(541) 672-3601",
    website: "https://tendownbowling.com/pro-shop/",
    hoursNote: `${hoursNotConfirmed} The shop page does not list a schedule separate from the bowling center.`,
    points: ["Bowling balls", "Bags and shoes", "Custom fitting", "On-site drilling"],
  },
]

export const bowlingCenters: readonly DirectoryListing[] = [
  {
    id: "highland-bowl",
    name: "Highland Bowl",
    city: "Corvallis, OR",
    address: "2123 NW 9th St, Corvallis, OR 97330",
    phone: "(541) 753-6161",
    website: "http://www.highlandbowl.com/",
    hours: [{ day: "Every day", text: "10:00 AM – Midnight" }],
    points: ["Food", "Leagues", "Family bowling"],
  },
  {
    id: "linn-lanes",
    name: "Linn Lanes",
    city: "Lebanon, OR",
    address: "2250 S. Main Road, Lebanon, OR 97355",
    phone: "(541) 451-3900",
    website: "https://linnlanes.com/",
    hours: [
      { day: "Sunday", text: "11:00 AM – 10:00 PM" },
      { day: "Monday", text: "11:00 AM – 10:00 PM" },
      { day: "Tuesday", text: "9:00 AM – 10:00 PM" },
      { day: "Wednesday", text: "9:00 AM – 10:00 PM" },
      { day: "Thursday", text: "11:00 AM – 10:00 PM" },
      { day: "Friday", text: "11:00 AM – 12:00 AM" },
      { day: "Saturday", text: "10:00 AM – 12:00 AM" },
    ],
    hoursNote: "Bowling center hours. The lounge schedule on the same page is not shown here.",
    points: ["Bowling center and Head Pin Restaurant"],
  },
  {
    id: "northgate-bowl",
    name: "Northgate Bowl",
    city: "Salem, OR",
    venueId: "northgate-bowl",
    address: "2380 Northgate Avenue NE, Salem, OR 97301",
    phone: "(503) 581-1634",
    website: "https://www.northgatebowl.com/",
    hours: [{ day: "Every day", text: "9:00 AM – 10:00 PM" }],
    hoursNote: "Lanes are not rented after 9:15 PM.",
    points: ["24 lanes", "Leagues", "Bumper bowling"],
  },
  {
    id: "amf-firebird-lanes",
    name: "AMF Firebird Lanes",
    city: "Salem, OR",
    address: "4303 Center St NE, Salem, OR 97301",
    phone: "(503) 581-1697",
    website: "https://www.amf.com/location/amf-firebird-lanes",
    hours: [
      { day: "Monday", text: "4:00 PM – 11:00 PM" },
      { day: "Tuesday", text: "2:00 PM – 11:00 PM" },
      { day: "Wednesday", text: "12:00 PM – 11:00 PM" },
      { day: "Thursday", text: "2:00 PM – 11:00 PM" },
      { day: "Friday", text: "2:00 PM – 12:00 AM" },
      { day: "Saturday", text: "11:00 AM – 12:00 AM" },
      { day: "Sunday", text: "11:00 AM – 11:00 PM" },
    ],
    hoursNote: "Published as this week’s hours on the official location page.",
    points: ["32 lanes", "Arcade"],
  },
  {
    id: "silver-creek-lanes",
    name: "Silver Creek Lanes",
    city: "Silverton, OR",
    venueId: "silver-creek-lanes",
    address: "500 West C Street, Silverton, OR 97381",
    phone: "(503) 873-5316",
    website: "https://www.silvercreeklanes.com/",
    hoursNote: `${hoursNotConfirmed} The website publishes summer hours for May through August: Monday 4 pm–9 pm, Tuesday through Saturday 11 am–9 pm, Sunday 12 pm–7 pm.`,
    points: ["Practice tournament venue for Albany High School Bowling"],
  },
  {
    id: "emerald-lanes",
    name: "Emerald Lanes",
    city: "Eugene, OR",
    address: "140 Oakway Rd, Eugene, OR 97401",
    phone: "(541) 342-2611",
    website: "https://emeraldlaneseugene.com/",
    hours: [
      { day: "Monday–Thursday", text: "9:30 AM – 10:00 PM" },
      { day: "Friday", text: "10:00 AM – 12:00 AM" },
      { day: "Saturday", text: "9:30 AM – 12:00 AM" },
      { day: "Sunday", text: "10:00 AM – 10:00 PM" },
    ],
    points: ["24 synthetic lanes", "Bowling technology", "Pro shop"],
  },
  {
    id: "milwaukie-bowl",
    name: "Milwaukie Bowl",
    city: "Milwaukie, OR",
    address: "3056 SE Harrison St, Milwaukie, OR 97222",
    phone: "(503) 654-7719",
    website: "https://www.milwaukiebowl.com/",
    hours: [
      { day: "Monday–Thursday", text: "9:00 AM – 11:00 PM" },
      { day: "Friday–Saturday", text: "9:00 AM – Midnight" },
      { day: "Sunday", text: "9:00 AM – 10:00 PM" },
    ],
    hoursNote: "Bowling hours from the center’s “To Bowl” list.",
    points: ["Wood lanes", "Bumpers", "Leagues"],
  },
  {
    id: "kingpins-beaverton",
    name: "KingPins — Beaverton",
    city: "Beaverton, OR",
    address: "2725 SW Cedar Hills Blvd, Beaverton, OR 97005",
    phone: "(503) 646-1116",
    website: "https://mykingpins.com/beaverton/",
    hours: [
      { day: "Monday", text: "11:30 AM – 11:30 PM" },
      { day: "Tuesday", text: "10:00 AM – 11:30 PM" },
      { day: "Wednesday", text: "11:30 AM – 11:30 PM" },
      { day: "Thursday", text: "10:00 AM – Midnight" },
      { day: "Friday", text: "11:30 AM – 1:00 AM" },
      { day: "Saturday", text: "9:00 AM – 1:00 AM" },
      { day: "Sunday", text: "10:00 AM – 11:30 PM" },
    ],
    points: ["Laser tag", "Arcade", "Family entertainment"],
  },
  {
    id: "grand-central-bowl",
    name: "Grand Central Bowl",
    city: "Portland — Buckman",
    address: "808 SE Morrison St, Portland, OR 97214",
    phone: "(503) 236-2695",
    website: "https://www.grandcentralbowl.com/",
    hours: [
      { day: "Monday", text: "4:00 PM – 10:00 PM" },
      { day: "Tuesday–Thursday", text: "4:00 PM – 11:00 PM" },
      { day: "Friday", text: "4:00 PM – 12:00 AM" },
      { day: "Saturday", text: "11:00 AM – 12:00 AM" },
      { day: "Sunday", text: "11:00 AM – 10:00 PM" },
    ],
    points: ["12 lanes", "HD screens", "Sports bar"],
  },
  {
    id: "kingpins-portland",
    name: "KingPins — Portland",
    city: "Portland — Lents",
    address: "3550 SE 92nd Ave, Portland, OR 97266",
    phone: "(503) 788-7889",
    website: "https://mykingpins.com/portland/",
    hours: [
      { day: "Monday", text: "11:00 AM – Midnight" },
      { day: "Tuesday", text: "11:00 AM – 11:30 PM" },
      { day: "Wednesday", text: "11:00 AM – 11:30 PM" },
      { day: "Thursday", text: "12:00 PM – 11:30 PM" },
      { day: "Friday", text: "10:00 AM – Midnight" },
      { day: "Saturday", text: "9:00 AM – Midnight" },
      { day: "Sunday", text: "9:00 AM – 11:30 PM" },
    ],
    points: ["40 lanes", "Arcade", "Virtual reality entertainment"],
  },
  {
    id: "mt-hood-lanes",
    name: "Mt. Hood Lanes",
    city: "Gresham, OR",
    address: "2311 E Powell Blvd, Gresham, OR 97080",
    phone: "(503) 492-9820",
    website: "https://mthoodlanes.com/",
    hours: [
      { day: "Monday", text: "2:00 PM – 11:00 PM" },
      { day: "Tuesday", text: "2:00 PM – 11:00 PM" },
      { day: "Wednesday", text: "2:00 PM – 12:00 AM" },
      { day: "Thursday", text: "2:00 PM – 11:00 PM" },
      { day: "Friday", text: "2:00 PM – 12:00 AM" },
      { day: "Saturday", text: "12:00 PM – 12:00 AM" },
      { day: "Sunday", text: "11:00 AM – 11:00 PM" },
    ],
    hoursNote: "The center says hours may change based on season, leagues, and special events.",
    points: ["Arcade", "Lava Lounge", "Parties", "Leagues"],
  },
  {
    id: "ten-down-bowling",
    name: "Ten Down Bowling",
    city: "Roseburg, OR",
    address: "2400 NE Diamond Lake Blvd, Roseburg, OR 97470",
    phone: "(541) 672-3601",
    website: "https://tendownbowling.com/",
    hours: [
      { day: "Monday", text: "9:00 AM – 10:00 PM" },
      { day: "Tuesday", text: "Closed" },
      { day: "Wednesday", text: "12:00 PM – 10:00 PM" },
      { day: "Thursday", text: "9:00 AM – 10:00 PM" },
      { day: "Friday", text: "12:00 PM – 10:00 PM" },
      { day: "Saturday", text: "12:00 PM – 10:00 PM" },
      { day: "Sunday", text: "12:00 PM – 10:00 PM" },
    ],
    hoursNote: "Last lanes issued at 9:00 PM.",
    points: ["Bowling center along the I-5 corridor"],
  },
  {
    id: "caveman-bowl",
    name: "Caveman Bowl",
    city: "Grants Pass, OR",
    address: "1230 Rogue River Hwy, Grants Pass, OR 97527",
    phone: "(541) 479-2311",
    website: "https://www.cavemanbowl.com/",
    hours: [
      { day: "Monday–Thursday", text: "9:00 AM – 9:00 PM" },
      { day: "Friday", text: "9:00 AM – 11:00 PM" },
      { day: "Saturday", text: "12:00 PM – 11:00 PM" },
      { day: "Sunday", text: "12:00 PM – 8:00 PM" },
    ],
    hoursNote: "Published as winter hours.",
    points: ["Bowling center near I-5"],
  },
  {
    id: "lava-lanes",
    name: "Lava Lanes",
    city: "Medford, OR",
    address: "2980 Crater Lake Hwy, Medford, OR 97504",
    phone: "(541) 245-2755",
    website: "https://lavalanes.com/",
    hours: [
      { day: "Monday–Thursday", text: "11:00 AM – 11:00 PM" },
      { day: "Friday", text: "11:00 AM – 1:00 AM" },
      { day: "Saturday", text: "10:00 AM – 1:00 AM" },
      { day: "Sunday", text: "10:00 AM – 11:00 PM" },
    ],
    hoursNote: "Published as bowling hours. The site says the center is open 365 days a year.",
    points: ["40 lanes", "Cosmic bowling", "Sports bar"],
  },
]

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
