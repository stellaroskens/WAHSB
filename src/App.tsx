import { Route, Routes } from "react-router-dom"
import { AuthCallbackRedirect } from "./components/AuthCallbackRedirect"
import { Layout } from "./components/Layout"
import { RequireStaff } from "./lib/auth/RequireStaff"
import { RequireSuperAdmin } from "./lib/auth/RequireSuperAdmin"
import { AdminAnnouncements } from "./pages/admin/AdminAnnouncements"
import { AdminConsent } from "./pages/admin/AdminConsent"
import { AdminHistory } from "./pages/admin/AdminHistory"
import { AdminLinks } from "./pages/admin/AdminLinks"
import { AdminMedia } from "./pages/admin/AdminMedia"
import { AdminConnections } from "./pages/admin/AdminConnections"
import { AdminContent } from "./pages/admin/AdminContent"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminDonations } from "./pages/admin/AdminDonations"
import { AdminFamily } from "./pages/admin/AdminFamily"
import { AdminLayout } from "./pages/admin/AdminLayout"
import { AdminClub, AdminCoaches } from "./pages/admin/AdminRoleAccess"
import { AdminSettings } from "./pages/admin/AdminSettings"
import { AdminStaff } from "./pages/admin/AdminStaff"
import { AdminSystemStatus } from "./pages/admin/AdminSystemStatus"
import { AdminTournaments } from "./pages/admin/AdminTournaments"
import { Bowlathon } from "./pages/Bowlathon"
import { CoachDashboard } from "./pages/coach/CoachDashboard"
import { Contact } from "./pages/Contact"
import { Donate } from "./pages/Donate"
import { FamilyDashboard } from "./pages/FamilyDashboard"
import { Faq } from "./pages/Faq"
import { Fundraisers } from "./pages/Fundraisers"
import { HomeReview } from "./pages/HomeReview"
import { BowlerProfilePage } from "./pages/BowlerProfilePage"
import { MeetTheBowlers } from "./pages/MeetTheBowlers"
import { StaffShell } from "./components/staff/StaffShell"
import { StaffBowlerEditor } from "./pages/staff/StaffBowlerEditor"
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
          <Route path="bowlers" element={<StaffBowlerEditor />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="club" element={<AdminClub />} />
          <Route path="connections" element={<AdminConnections />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="links" element={<AdminLinks />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="family" element={<AdminFamily />} />
          <Route path="consent" element={<AdminConsent />} />
          <Route path="status" element={<AdminSystemStatus />} />
        </Route>

        <Route
          path="coach"
          element={
            <RequireStaff allow={["coach", "super_admin"]}>
              <StaffShell area="coach" />
            </RequireStaff>
          }
        >
          <Route index element={<CoachDashboard />} />
          <Route path="bowlers" element={<StaffBowlerEditor />} />
        </Route>

        <Route
          path="team-administrator"
          element={
            <RequireStaff allow={["team_administrator", "super_admin"]}>
              <StaffShell area="club" />
            </RequireStaff>
          }
        >
          <Route index element={<TeamAdminDashboard />} />
          <Route path="bowlers" element={<StaffBowlerEditor />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<HomeReview />} />
          <Route path="our-club" element={<OurClub />} />
          <Route path="meet-the-bowlers" element={<MeetTheBowlers />} />
          <Route path="meet-the-bowlers/:playerId" element={<BowlerProfilePage />} />
          <Route path="practices" element={<Practices />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="donate" element={<Donate />} />
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
