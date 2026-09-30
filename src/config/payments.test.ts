import { describe, expect, it } from 'vitest'
import { PAYMENT_STATUS_TONE, PAYMENTS } from './payments'

describe('PAYMENTS', () => {
  it('is non-empty', () => {
    expect(PAYMENTS.length).toBeGreaterThan(0)
  })

  it('every item has the expected shape', () => {
    for (const payment of PAYMENTS) {
      expect(payment).toMatchObject({
        id: expect.any(String),
        status: expect.any(String),
        approvedAt: expect.any(String),
        orderNo: expect.any(String),
        pg: expect.any(String),
        orderName: expect.any(String),
        customer: expect.any(String),
        method: expect.any(String),
        amount: expect.any(Number),
      })
    }
  })

  it('every status has a corresponding tone mapping', () => {
    for (const payment of PAYMENTS) {
      expect(PAYMENT_STATUS_TONE).toHaveProperty(payment.status)
    }
  })

  it('has at least one payment with 결제완료 status so the cancel-button-enabled path in payments.tsx is reachable in the demo data', () => {
    expect(PAYMENTS.some((payment) => payment.status === '결제완료')).toBe(true)
  })
})
