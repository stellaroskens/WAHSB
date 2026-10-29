import { Route, Routes } from "react-router-dom"
import { AuthCallbackRedirect } from "./components/AuthCallbackRedirect"
import { Layout } from "./components/Layout"
import { RequireStaff } from "./lib/auth/RequireStaff"
import { RequireSuperAdmin } from "./lib/auth/RequireSuperAdmin"
import { AdminAnnouncements } from "./pages/admin/AdminAnnouncements"
import { AdminConnections } from "./pages/admin/AdminConnections"
import { AdminContent } from "./pages/admin/AdminContent"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminLayout } from "./pages/admin/AdminLayout"
import { AdminSettings } from "./pages/admin/AdminSettings"
import { AdminStaff } from "./pages/admin/AdminStaff"
import { AdminTournaments } from "./pages/admin/AdminTournaments"
import { Bowlathon } from "./pages/Bowlathon"
import { CoachDashboard } from "./pages/coach/CoachDashboard"
import { Contact } from "./pages/Contact"
import { FamilyDashboard } from "./pages/FamilyDashboard"
import { Faq } from "./pages/Faq"
import { Fundraisers } from "./pages/Fundraisers"
import { HomeReview } from "./pages/HomeReview"
import { NotFound } from "./pages/NotFound"
import { OurClub } from "./pages/OurClub"
import { Practices } from "./pages/Practices"
import { Resources } from "./pages/Resources"
import { SignIn } from "./pages/SignIn"
import { SponsorQr } from "./pages/SponsorQr"
import { Sponsors } from "./pages/Sponsors"
import { StaffLogin } from "./pages/staff/StaffLogin"
import { TeamAdminDashboard } from "./pages/teamAdmin/TeamAdminDashboard"
import { TeamGear } from "./pages/TeamGear"
import { Tournaments } from "./pages/Tournaments"
import { Volunteer } from "./pages/Volunteer"

export default function App() {
  return (
    <>
      <AuthCallbackRedirect />
      <Routes>
        <Route path="staff/login" element={<StaffLogin />} />

        <Route
          path="admin"
          element={
            <RequireSuperAdmin>
              <AdminLayout />
            </RequireSuperAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="pages" element={<AdminContent />} />
          <Route path="connections" element={<AdminConnections />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>

        <Route
          path="coach"
          element={
            <RequireStaff allow={["coach", "super_admin"]}>
              <CoachDashboard />
            </RequireStaff>
          }
        />

        <Route
          path="team-administrator"
          element={
            <RequireStaff allow={["team_administrator", "super_admin"]}>
              <TeamAdminDashboard />
            </RequireStaff>
          }
        />

        <Route element={<Layout />}>
          <Route index element={<HomeReview />} />
          <Route path="our-club" element={<OurClub />} />
          <Route path="practices" element={<Practices />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="sponsor-qr" element={<SponsorQr />} />
          <Route path="fundraisers" element={<Fundraisers />} />
          <Route path="resources" element={<Resources />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="bowl-a-thon" element={<Bowlathon />} />
          <Route path="team-gear" element={<TeamGear />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="family" element={<FamilyDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
