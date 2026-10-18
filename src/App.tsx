import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Bowlathon } from "./pages/Bowlathon"
import { Contact } from "./pages/Contact"
import { Faq } from "./pages/Faq"
import { Fundraisers } from "./pages/Fundraisers"
import { HomeReview } from "./pages/HomeReview"
import { NotFound } from "./pages/NotFound"
import { OurClub } from "./pages/OurClub"
import { Practices } from "./pages/Practices"
import { Resources } from "./pages/Resources"
import { SignInUnavailable } from "./pages/SignInUnavailable"
import { Sponsors } from "./pages/Sponsors"
import { TeamGear } from "./pages/TeamGear"
import { Tournaments } from "./pages/Tournaments"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeReview />} />
        <Route path="our-club" element={<OurClub />} />
        <Route path="practices" element={<Practices />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="fundraisers" element={<Fundraisers />} />
        <Route path="resources" element={<Resources />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<Faq />} />
        <Route path="bowl-a-thon" element={<Bowlathon />} />
        <Route path="team-gear" element={<TeamGear />} />
        <Route path="sign-in" element={<SignInUnavailable />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
