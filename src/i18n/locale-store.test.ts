import { beforeEach, describe, expect, it } from 'vitest'
import { useLocaleStore } from './locale-store'

describe('useLocaleStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('defaults to ko', () => {
    expect(useLocaleStore.getState().locale).toBe('ko')
  })

  it('setLocale updates the store', () => {
    useLocaleStore.getState().setLocale('en')

    expect(useLocaleStore.getState().locale).toBe('en')
  })

  it('persists the selected locale to localStorage', () => {
    useLocaleStore.getState().setLocale('en')

    const stored = JSON.parse(window.localStorage.getItem('locale') ?? '{}')
    expect(stored.state.locale).toBe('en')
  })
})
