import { describe, expect, it } from 'vitest'
import { DEMO_ACCOUNT } from './auth'

describe('DEMO_ACCOUNT', () => {
  it('has a non-empty email and password', () => {
    expect(DEMO_ACCOUNT.email.length).toBeGreaterThan(0)
    expect(DEMO_ACCOUNT.password.length).toBeGreaterThan(0)
  })
})
