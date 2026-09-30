import { describe, expect, it } from 'vitest'
import { PRODUCT_STATUS_TONE, PRODUCTS } from './products'

describe('PRODUCTS', () => {
  it('is non-empty', () => {
    expect(PRODUCTS.length).toBeGreaterThan(0)
  })

  it('every item has the expected shape', () => {
    for (const product of PRODUCTS) {
      expect(product).toMatchObject({
        name: expect.any(String),
        category: expect.any(String),
        stock: expect.any(Number),
        price: expect.any(String),
        status: expect.any(String),
      })
    }
  })

  it('every status has a corresponding tone mapping', () => {
    for (const product of PRODUCTS) {
      expect(PRODUCT_STATUS_TONE).toHaveProperty(product.status)
    }
  })
})
