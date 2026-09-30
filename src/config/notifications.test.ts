import { describe, expect, it } from 'vitest'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ICONS,
  NOTIFICATIONS,
} from './notifications'

describe('NOTIFICATIONS', () => {
  it('is non-empty', () => {
    expect(NOTIFICATIONS.length).toBeGreaterThan(0)
  })

  it('every item has the expected shape', () => {
    for (const notification of NOTIFICATIONS) {
      expect(notification).toMatchObject({
        iconKey: expect.any(String),
        category: expect.any(String),
        message: expect.any(String),
        time: expect.any(String),
      })
    }
  })

  it('every iconKey has a corresponding icon component mapping', () => {
    for (const notification of NOTIFICATIONS) {
      expect(NOTIFICATION_ICONS).toHaveProperty(notification.iconKey)
    }
  })

  it('every category is included in NOTIFICATION_CATEGORIES', () => {
    for (const notification of NOTIFICATIONS) {
      expect(NOTIFICATION_CATEGORIES).toContain(notification.category)
    }
  })
})
