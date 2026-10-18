import { Link } from "react-router-dom"
import { UserIcon } from "./icons"

export function SignInLink() {
  return (
    <Link className="header-icon header-account" to="/sign-in">
      <UserIcon />
      <span className="header-icon__label">Sign In</span>
    </Link>
  )
}

export function AccountButton() {
  return <SignInLink />
}
