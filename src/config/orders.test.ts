import { describe, expect, it } from 'vitest'
import { ORDER_STATUS_TONE, ORDERS } from './orders'

describe('ORDERS', () => {
  it('is non-empty', () => {
    expect(ORDERS.length).toBeGreaterThan(0)
  })

  it('every item has the expected shape', () => {
    for (const order of ORDERS) {
      expect(order).toMatchObject({
        id: expect.any(String),
        customer: expect.any(String),
        amount: expect.any(String),
        status: expect.any(String),
        date: expect.any(String),
      })
    }
  })

  it('every status has a corresponding tone mapping', () => {
    for (const order of ORDERS) {
      expect(ORDER_STATUS_TONE).toHaveProperty(order.status)
    }
  })
})
