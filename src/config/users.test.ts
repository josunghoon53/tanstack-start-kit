import { describe, expect, it } from 'vitest'
import { USER_STATUS_TONE, USERS } from './users'

describe('USERS', () => {
  it('is non-empty', () => {
    expect(USERS.length).toBeGreaterThan(0)
  })

  it('every item has the expected shape', () => {
    for (const user of USERS) {
      expect(user).toMatchObject({
        name: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        status: expect.any(String),
        joinedAt: expect.any(String),
      })
    }
  })

  it('every status has a corresponding tone mapping', () => {
    for (const user of USERS) {
      expect(USER_STATUS_TONE).toHaveProperty(user.status)
    }
  })
})
