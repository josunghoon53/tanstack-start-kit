import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAccordionGroup } from './use-accordion-group'

describe('useAccordionGroup', () => {
  it('starts with nothing open when no defaultKey is given', () => {
    const { result } = renderHook(() => useAccordionGroup())

    expect(result.current.isOpen('a')).toBe(false)
    expect(result.current.isOpen('b')).toBe(false)
  })

  it('starts with defaultKey open', () => {
    const { result } = renderHook(() => useAccordionGroup('a'))

    expect(result.current.isOpen('a')).toBe(true)
    expect(result.current.isOpen('b')).toBe(false)
  })

  it('opening a new key closes the previously open one', () => {
    const { result } = renderHook(() => useAccordionGroup('a'))

    act(() => {
      result.current.setOpen('b', true)
    })

    expect(result.current.isOpen('a')).toBe(false)
    expect(result.current.isOpen('b')).toBe(true)
  })

  it('setOpen(key, false) closes it', () => {
    const { result } = renderHook(() => useAccordionGroup('a'))

    act(() => {
      result.current.setOpen('a', false)
    })

    expect(result.current.isOpen('a')).toBe(false)
  })
})
