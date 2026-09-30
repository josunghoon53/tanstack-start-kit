import { describe, expect, it } from 'vitest'
import { CONTENT_STATUS_TONE, CONTENTS } from './contents'

describe('CONTENTS', () => {
  it('is non-empty', () => {
    expect(CONTENTS.length).toBeGreaterThan(0)
  })

  it('every item has the expected shape', () => {
    for (const content of CONTENTS) {
      expect(content).toMatchObject({
        title: expect.any(String),
        author: expect.any(String),
        status: expect.any(String),
        date: expect.any(String),
      })
    }
  })

  it('every status has a corresponding tone mapping', () => {
    for (const content of CONTENTS) {
      expect(CONTENT_STATUS_TONE).toHaveProperty(content.status)
    }
  })
})
