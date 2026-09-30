import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRowSelection } from './use-row-selection'

interface Item {
  id: string
}

const ITEMS: Array<Item> = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

describe('useRowSelection', () => {
  it('starts with nothing selected', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))
    expect(result.current.count).toBe(0)
    expect(result.current.isSelected(ITEMS[0])).toBe(false)
  })

  it('toggles a single item on and off', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))

    act(() => {
      result.current.toggle(ITEMS[0], true)
    })
    expect(result.current.isSelected(ITEMS[0])).toBe(true)
    expect(result.current.count).toBe(1)

    act(() => {
      result.current.toggle(ITEMS[0], false)
    })
    expect(result.current.isSelected(ITEMS[0])).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it('selects and deselects every item at once via toggleAll', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))

    act(() => {
      result.current.toggleAll(ITEMS, true)
    })
    expect(result.current.count).toBe(3)
    expect(result.current.isAllSelected(ITEMS)).toBe(true)

    act(() => {
      result.current.toggleAll(ITEMS, false)
    })
    expect(result.current.count).toBe(0)
  })

  it('reports partial selection via isSomeSelected, distinct from isAllSelected', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))

    act(() => {
      result.current.toggle(ITEMS[0], true)
    })

    expect(result.current.isSomeSelected(ITEMS)).toBe(true)
    expect(result.current.isAllSelected(ITEMS)).toBe(false)

    act(() => {
      result.current.toggleAll(ITEMS, true)
    })

    expect(result.current.isAllSelected(ITEMS)).toBe(true)
    expect(result.current.isSomeSelected(ITEMS)).toBe(false)
  })

  it('isAllSelected is false for an empty item list', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))
    expect(result.current.isAllSelected([])).toBe(false)
  })

  it('clear empties the selection', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))

    act(() => {
      result.current.toggleAll(ITEMS, true)
    })
    act(() => {
      result.current.clear()
    })

    expect(result.current.count).toBe(0)
  })

  it('keeps selection for items on other pages (selection tracked by id, not by the given list)', () => {
    const { result } = renderHook(() => useRowSelection<Item>((i) => i.id))

    act(() => {
      result.current.toggle(ITEMS[0], true)
    })

    // "페이지 2"에는 선택한 아이템이 없어도, count는 여전히 1이어야 한다.
    expect(result.current.isAllSelected([ITEMS[1], ITEMS[2]])).toBe(false)
    expect(result.current.count).toBe(1)
  })
})
