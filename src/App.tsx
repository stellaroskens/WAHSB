import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { AuthCallbackRedirect } from "./components/AuthCallbackRedirect"
import { Layout } from "./components/Layout"
import { RouteLoading } from "./components/RouteLoading"
import { RequireStaff } from "./lib/auth/RequireStaff"
import { RequireSuperAdmin } from "./lib/auth/RequireSuperAdmin"
import { Bowlathon } from "./pages/Bowlathon"
import { BowlerProfilePage } from "./pages/BowlerProfilePage"
import { Contact } from "./pages/Contact"
import { Donate } from "./pages/Donate"
import { FamilyDashboard } from "./pages/FamilyDashboard"
import { Faq } from "./pages/Faq"
import { Fundraisers } from "./pages/Fundraisers"
import { HomeReview } from "./pages/HomeReview"
import { MeetTheBowlers } from "./pages/MeetTheBowlers"
import { NotFound } from "./pages/NotFound"
import { OurClub } from "./pages/OurClub"
import { Practices } from "./pages/Practices"
import { Resources } from "./pages/Resources"
import { SignIn } from "./pages/SignIn"
import { SponsorQr } from "./pages/SponsorQr"
import { Sponsors } from "./pages/Sponsors"
import { StaffLogin } from "./pages/staff/StaffLogin"
import { TeamGear } from "./pages/TeamGear"
import { Tournaments } from "./pages/Tournaments"
import { Volunteer } from "./pages/Volunteer"

const AdminAnnouncements = lazy(() =>
  import("./pages/admin/AdminAnnouncements").then((module) => ({ default: module.AdminAnnouncements })),
)
const AdminConsent = lazy(() =>
  import("./pages/admin/AdminConsent").then((module) => ({ default: module.AdminConsent })),
)
const AdminHistory = lazy(() =>
  import("./pages/admin/AdminHistory").then((module) => ({ default: module.AdminHistory })),
)
const AdminLinks = lazy(() => import("./pages/admin/AdminLinks").then((module) => ({ default: module.AdminLinks })))
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia").then((module) => ({ default: module.AdminMedia })))
const AdminConnections = lazy(() =>
  import("./pages/admin/AdminConnections").then((module) => ({ default: module.AdminConnections })),
)
const AdminContent = lazy(() =>
  import("./pages/admin/AdminContent").then((module) => ({ default: module.AdminContent })),
)
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })),
)
const AdminDonations = lazy(() =>
  import("./pages/admin/AdminDonations").then((module) => ({ default: module.AdminDonations })),
)
const AdminFamily = lazy(() =>
  import("./pages/admin/AdminFamily").then((module) => ({ default: module.AdminFamily })),
)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then((module) => ({ default: module.AdminLayout })))
const AdminClub = lazy(() => import("./pages/admin/AdminRoleAccess").then((module) => ({ default: module.AdminClub })))
const AdminCoaches = lazy(() =>
  import("./pages/admin/AdminRoleAccess").then((module) => ({ default: module.AdminCoaches })),
)
const AdminSettings = lazy(() =>
  import("./pages/admin/AdminSettings").then((module) => ({ default: module.AdminSettings })),
)
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff").then((module) => ({ default: module.AdminStaff })))
const AdminSystemStatus = lazy(() =>
  import("./pages/admin/AdminSystemStatus").then((module) => ({ default: module.AdminSystemStatus })),
)
const AdminTournaments = lazy(() =>
  import("./pages/admin/AdminTournaments").then((module) => ({ default: module.AdminTournaments })),
)
const CoachDashboard = lazy(() =>
  import("./pages/coach/CoachDashboard").then((module) => ({ default: module.CoachDashboard })),
)
const StaffShell = lazy(() =>
  import("./components/staff/StaffShell").then((module) => ({ default: module.StaffShell })),
)
const StaffBowlerEditor = lazy(() =>
  import("./pages/staff/StaffBowlerEditor").then((module) => ({ default: module.StaffBowlerEditor })),
)
const TeamAdminDashboard = lazy(() =>
  import("./pages/teamAdmin/TeamAdminDashboard").then((module) => ({ default: module.TeamAdminDashboard })),
)

export default function App() {
  return (
    <>
      <AuthCallbackRedirect />
      <Suspense fallback={<RouteLoading />}>
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
      </Suspense>
    </>
  )
}
