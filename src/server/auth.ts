import { createServerFn } from '@tanstack/react-start'
import { DEMO_ACCOUNT } from '@/config/auth'
import { authMiddleware } from './auth-middleware'
import { getAuthSession } from './session'

export const getCurrentUserFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => context.user)

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (data.email !== DEMO_ACCOUNT.email || data.password !== DEMO_ACCOUNT.password) {
      return { ok: false as const, error: '이메일 또는 비밀번호가 올바르지 않아요.' }
    }

    const session = await getAuthSession()
    await session.update({ email: data.email })

    return { ok: true as const }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await getAuthSession()
  await session.clear()
  return { ok: true as const }
})
