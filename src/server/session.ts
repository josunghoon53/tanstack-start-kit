import { useSession } from '@tanstack/react-start/server'

// Dev-only secret used to seal the session cookie. Move this to an env var
// (and rotate it) before deploying this kit for real.
const SESSION_PASSWORD = 'tanstack-start-kit-dev-only-session-secret-change-me'

export interface SessionUser {
  email: string
}

export function getAuthSession() {
  return useSession<SessionUser>({
    password: SESSION_PASSWORD,
    name: 'admin_session',
  })
}
