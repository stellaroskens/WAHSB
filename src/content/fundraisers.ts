import { club } from "./site"

export const fundraiserContact = {
  name: "Maranda",
  email: club.email,
} as const

export const fundraisers = [
  {
    id: "panda-express",
    business: "Panda Express",
    place: "Albany",
    when: "Friday, October 30, 2026",
    time: "9:30 AM – 10:00 PM",
    image: "/flyers/panda-express-960.webp",
    imageWidth: 1271,
    imageHeight: 1800,
    flyer: "/flyers/panda-express.pdf",
  },
  {
    id: "burgerville",
    business: "Burgerville",
    place: "Albany",
    when: "Sunday, November 8, 2026",
    time: "4:00 PM – 8:00 PM",
    image: "/flyers/burgerville-960.webp",
    imageWidth: 1390,
    imageHeight: 1800,
    flyer: "/flyers/burgerville.pdf",
  },
] as const
