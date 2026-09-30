import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTranslation } from './use-translation'
import { useLocaleStore } from './locale-store'

describe('useTranslation', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('returns the ko dictionary by default', () => {
    const { result } = renderHook(() => useTranslation())

    expect(result.current.login.title).toBe('관리자 로그인')
  })

  it('re-renders with the en dictionary when the locale changes', () => {
    const { result } = renderHook(() => useTranslation())

    act(() => {
      useLocaleStore.getState().setLocale('en')
    })

    expect(result.current.login.title).toBe('Admin login')
  })
})
