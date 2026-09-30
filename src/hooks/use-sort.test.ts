import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSort } from './use-sort'

type Key = 'name' | 'amount'

describe('useSort', () => {
  it('starts with no sort key', () => {
    const { result } = renderHook(() => useSort<Key>())
    expect(result.current.sortKey).toBeUndefined()
    expect(result.current.direction).toBe('asc')
  })

  it('sets the key with asc direction on first toggle', () => {
    const { result } = renderHook(() => useSort<Key>())

    act(() => {
      result.current.toggleSort('name')
    })

    expect(result.current.sortKey).toBe('name')
    expect(result.current.direction).toBe('asc')
  })

  it('flips to desc on a second toggle of the same key', () => {
    const { result } = renderHook(() => useSort<Key>())

    act(() => {
      result.current.toggleSort('name')
    })
    act(() => {
      result.current.toggleSort('name')
    })

    expect(result.current.sortKey).toBe('name')
    expect(result.current.direction).toBe('desc')
  })

  it('clears the sort key on a third toggle of the same key', () => {
    const { result } = renderHook(() => useSort<Key>())

    act(() => {
      result.current.toggleSort('name')
    })
    act(() => {
      result.current.toggleSort('name')
    })
    act(() => {
      result.current.toggleSort('name')
    })

    expect(result.current.sortKey).toBeUndefined()
  })

  it('switches to the new key with asc direction when a different key is toggled', () => {
    const { result } = renderHook(() => useSort<Key>())

    act(() => {
      result.current.toggleSort('name')
    })
    act(() => {
      result.current.toggleSort('name')
    })
    act(() => {
      result.current.toggleSort('amount')
    })

    expect(result.current.sortKey).toBe('amount')
    expect(result.current.direction).toBe('asc')
  })
})
