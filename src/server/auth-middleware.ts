import { createMiddleware } from '@tanstack/react-start'
import { getAuthSession } from './session'
import type { SessionUser } from './session'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getAuthSession()
    const user: SessionUser | null = session.data.email
      ? { email: session.data.email }
      : null

    return next({ context: { user } })
  },
)
