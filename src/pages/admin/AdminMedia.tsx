import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"

const ASSETS = [
  { label: "Website logo", path: "/brand/website-logo-480.webp", use: "Header and Our Club" },
  { label: "Homepage hero artwork", path: "/images/home-hero-banner-1280.webp", use: "Homepage hero. Alt text is edited with the homepage hero section." },
  { label: "Cliff Meredith portrait", path: "/coaches/cliff-meredith-640.webp", use: "Our Club. This is an approved coach portrait, not a student photo." },
  { label: "Chris Breshears portrait", path: "/coaches/chris-breshears-640.webp", use: "Our Club. This is an approved coach portrait, not a student photo." },
  { label: "Practices card", path: "/images/home-card-practices.png", use: "Homepage card" },
  { label: "Tournaments card", path: "/images/home-card-tournaments.png", use: "Homepage card" },
  { label: "Lakeshore Lanes logo", path: "/lakeshore-lanes.avif", use: "Homepage, Practices, and Sponsors" },
  { label: "Panda Express flyer", path: "/flyers/panda-express.pdf", use: "Fundraiser page" },
  { label: "Burgerville flyer", path: "/flyers/burgerville.pdf", use: "Fundraiser page" },
  {
    label: "Bowler silhouette",
    path: "/images/bowler-silhouette.svg",
    use: "Older placeholder. Player cards now use a school logo or the AHSB logo.",
  },
  { label: "AHSB logo", path: "/images/schools/ahsb-main-logo.png", use: "Meet the Bowlers branding. Not a student photo." },
  { label: "South Albany logo", path: "/images/schools/south-albany-logo.png", use: "South Albany player cards. Full logo." },
  { label: "South Albany eagle", path: "/images/schools/south-albany-mark.png", use: "South Albany simplified mark." },
  { label: "West Albany logo", path: "/images/schools/west-albany-logo.png", use: "West Albany player cards. Full logo." },
  { label: "West Albany bulldog", path: "/images/schools/west-albany-mark.png", use: "West Albany simplified mark." },
  { label: "Lebanon logo", path: "/images/schools/lebanon-logo.png", use: "Lebanon player cards. Full logo." },
  { label: "Lebanon initials", path: "/images/schools/lebanon-mark.png", use: "Lebanon simplified mark." },
]

export function AdminMedia() {
  return (
    <div className="admin-page">
      <PageMeta title="Media Library | Albany High School Bowling" description="Approved public files for Albany High School Bowling." />
      <div className="admin-page__intro">
        <h2>Media library</h2>
        <p>
          These are approved public files already on the website. Uploading a new file is not available because secure
          upload storage is not configured. Do not add student photographs here.
        </p>
      </div>
      <p className="admin-alert" role="status">
        To accept uploads later, connect Netlify Blobs for site-scoped public assets and keep private records out of
        the repository. Until then, a developer adds an approved file. Alt text for homepage images is edited in{" "}
        <Link to="/admin/content?page=home">Website Pages</Link>.
      </p>
      <ul className="admin-section-list">
        {ASSETS.map((asset) => (
          <li key={asset.path} className="admin-section-list__item">
            <div>
              <h3>{asset.label}</h3>
              <p>
                {asset.path} · {asset.use}
              </p>
            </div>
            <span className="admin-badge">On the site</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
