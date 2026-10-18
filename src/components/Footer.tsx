import { NavLink } from "react-router-dom"
import { SocialConnections } from "./SocialConnections"
import { websiteLogo } from "../content/media"
import { club, nav } from "../content/site"

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <img
            src={websiteLogo.src}
            srcSet={websiteLogo.srcSet}
            sizes="128px"
            width={websiteLogo.width}
            height={websiteLogo.height}
            alt=""
            loading="lazy"
          />
          <p className="footer-name">{club.name}</p>
          <p>{club.place}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="footer-links">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-contact">
          <h2>Contact</h2>
          <p>
            <a href={`mailto:${club.email}`}>{club.email}</a>
          </p>
          <ul className="footer-links">
            {club.social.map((item) => (
              <li key={item.href}>
                <a href={item.href} rel="noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="footer-schools">
            {club.schools.map((school) => (
              <span key={school.name}>{school.name}</span>
            ))}
          </p>
        </div>
      </div>
      <div className="wrap">
        <SocialConnections />
      </div>
    </footer>
  )
}
