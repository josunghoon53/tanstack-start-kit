import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_NAME, APP_VERSION } from './site'

describe('site config', () => {
  it('has a non-empty APP_NAME', () => {
    expect(APP_NAME.length).toBeGreaterThan(0)
  })

  it('APP_VERSION matches package.json version', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'),
    ) as { version: string }

    expect(APP_VERSION).toBe(pkg.version)
  })
})
