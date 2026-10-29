import {
  AuthError,
  acceptInvite,
  getUser,
  handleAuthCallback,
  logout as identityLogout,
  login as identityLogin,
  onAuthChange,
  requestPasswordRecovery,
  updateUser,
  type User,
} from "@netlify/identity"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { activationProblemFromError, displayNameUpdate } from "./activation"
import { isAdminAuthUiEnabled } from "./config"
import { isSuperAdmin, primaryStaffRole } from "./roles"
import { rolesFromUser, usernameFromUser } from "./session"

export type AuthCallbackKind = "invite" | "recovery" | "confirmation" | "oauth" | "email_change" | null

type AuthContextValue = {
  user: User | null
  loading: boolean
  authUiEnabled: boolean
  callbackKind: AuthCallbackKind
  callbackProblem: string | null
  inviteToken: string | null
  isSuperAdminUser: boolean
  username: string | null
  primaryRole: ReturnType<typeof primaryStaffRole>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  acceptStaffInvite: (password: string) => Promise<User>
  saveDisplayName: (source: User, fullName: string) => Promise<User>
  completeInviteSetup: () => void
  requestRecovery: (email: string) => Promise<void>
  setNewPassword: (password: string) => Promise<void>
  clearCallback: () => void
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function messageFromUnknown(error: unknown): string {
  if (error instanceof AuthError) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong. Try again."
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [callbackKind, setCallbackKind] = useState<AuthCallbackKind>(null)
  const [callbackProblem, setCallbackProblem] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const authUiEnabled = isAdminAuthUiEnabled()

  const refreshUser = useCallback(async () => {
    const current = await getUser()
    setUser(current)
    return current
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const hasAuthLink =
        typeof window !== "undefined" &&
        /invite_token|recovery_token|confirmation_token|email_change_token|access_token/.test(window.location.hash)
      try {
        const result = await handleAuthCallback()
        if (cancelled) return
        if (result?.type === "invite" && result.token) {
          setCallbackKind("invite")
          setInviteToken(result.token)
        } else if (result?.type === "recovery") {
          setCallbackKind("recovery")
        } else if (result?.type) {
          setCallbackKind(result.type)
        }
        await refreshUser()
      } catch (error) {
        if (!cancelled && hasAuthLink) setCallbackProblem(activationProblemFromError(error))
        if (!(error instanceof AuthError) && import.meta.env.DEV) {
          console.warn("Auth bootstrap:", messageFromUnknown(error))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const unsubscribe = onAuthChange((_event, currentUser) => {
      if (!cancelled) setUser(currentUser)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const next = await identityLogin(email.trim(), password)
    setUser(next)
  }, [])

  const logout = useCallback(async () => {
    await identityLogout()
    setUser(null)
  }, [])

  const acceptStaffInvite = useCallback(
    async (password: string) => {
      if (!inviteToken) throw new Error("Invite token missing. Open the invite link from your email again.")
      const next = await acceptInvite(inviteToken, password)
      setUser(next)
      setInviteToken(null)
      return next
    },
    [inviteToken],
  )

  const saveDisplayName = useCallback(async (source: User, fullName: string) => {
    const updates = displayNameUpdate(source, fullName)
    if (!updates) return source
    const next = await updateUser(updates)
    setUser(next)
    return next
  }, [])

  const completeInviteSetup = useCallback(() => {
    setCallbackKind(null)
    setInviteToken(null)
  }, [])

  const requestRecovery = useCallback(async (email: string) => {
    await requestPasswordRecovery(email.trim())
  }, [])

  const setNewPassword = useCallback(async (password: string) => {
    const next = await updateUser({ password })
    setUser(next)
    setCallbackKind(null)
  }, [])

  const clearCallback = useCallback(() => {
    setCallbackKind(null)
    setInviteToken(null)
    setCallbackProblem(null)
  }, [])

  const roles = rolesFromUser(user)
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authUiEnabled,
      callbackKind,
      callbackProblem,
      inviteToken,
      isSuperAdminUser: isSuperAdmin(roles),
      username: usernameFromUser(user),
      primaryRole: primaryStaffRole(roles),
      login,
      logout,
      acceptStaffInvite,
      saveDisplayName,
      completeInviteSetup,
      requestRecovery,
      setNewPassword,
      clearCallback,
      refreshUser,
    }),
    [
      user,
      loading,
      authUiEnabled,
      callbackKind,
      callbackProblem,
      inviteToken,
      roles,
      login,
      logout,
      acceptStaffInvite,
      saveDisplayName,
      completeInviteSetup,
      requestRecovery,
      setNewPassword,
      clearCallback,
      refreshUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
