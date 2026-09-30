import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePaginatedSearch } from './use-paginated-search'

interface Item {
  id: number
  name: string
}

function makeData(count: number): Array<Item> {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `item-${i + 1}`,
  }))
}

const matchesQuery = (item: Item, query: string) =>
  item.name.toLowerCase().includes(query)

describe('usePaginatedSearch', () => {
  it('returns all data paginated when there is no query', () => {
    const data = makeData(5)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    expect(result.current.query).toBe('')
    expect(result.current.page).toBe(1)
    expect(result.current.totalCount).toBe(5)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.pageItems).toEqual(data)
  })

  it('filters via matchesQuery and resets page to 1', () => {
    const data = makeData(30)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    act(() => {
      result.current.setPage(2)
    })
    expect(result.current.page).toBe(2)

    act(() => {
      result.current.setQuery('item-1')
    })

    // item-1, item-10..19 match "item-1"
    expect(result.current.query).toBe('item-1')
    expect(result.current.page).toBe(1)
    expect(result.current.totalCount).toBe(11)
  })

  it('setPage changes the current page', () => {
    const data = makeData(25)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    act(() => {
      result.current.setPage(3)
    })

    expect(result.current.page).toBe(3)
    expect(result.current.pageItems).toEqual(data.slice(20, 25))
  })

  it('slices pageItems correctly according to pageSize', () => {
    const data = makeData(25)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    expect(result.current.pageItems).toEqual(data.slice(0, 10))

    act(() => {
      result.current.setPage(2)
    })
    expect(result.current.pageItems).toEqual(data.slice(10, 20))
  })

  it('computes totalPages as max(1, ceil(filtered.length / pageSize))', () => {
    const empty: Array<Item> = []
    const { result: emptyResult } = renderHook(() =>
      usePaginatedSearch(empty, matchesQuery, 10),
    )
    expect(emptyResult.current.totalPages).toBe(1)

    const data = makeData(21)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )
    expect(result.current.totalPages).toBe(3)
  })

  it('clamps the current page down when filtering reduces totalPages below it', () => {
    const data = makeData(30)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)

    // Filter down to a query that only matches a handful of items (1 page),
    // without going through setQuery's page reset — simulate stale page by
    // setting query directly through setQuery (which resets page), then
    // manually pushing page forward again to confirm clamping recomputes.
    act(() => {
      result.current.setQuery('item-1')
    })
    act(() => {
      result.current.setPage(5)
    })

    // totalCount for "item-1" is 11 -> totalPages = 2, so page should clamp to 2
    expect(result.current.totalPages).toBe(2)
    expect(result.current.page).toBe(2)
  })

  it('still applies matchesQuery even when the search text is empty (for extra filters folded into the closure)', () => {
    const data = makeData(10)
    let onlyEvenIds = false
    const { result, rerender } = renderHook(
      ({ onlyEven }: { onlyEven: boolean }) =>
        usePaginatedSearch(
          data,
          (item, q) =>
            item.name.toLowerCase().includes(q) &&
            (!onlyEven || item.id % 2 === 0),
          10,
        ),
      { initialProps: { onlyEven: onlyEvenIds } },
    )

    // 검색어는 비어있는 채로, 외부 상태(필터)만 켜본다.
    expect(result.current.totalCount).toBe(10)

    onlyEvenIds = true
    rerender({ onlyEven: onlyEvenIds })

    expect(result.current.totalCount).toBe(5)
  })

  it('totalCount reflects filtered length, not raw data length', () => {
    const data = makeData(30)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    expect(result.current.totalCount).toBe(30)

    act(() => {
      result.current.setQuery('item-2')
    })
    // item-2, item-20..29 match "item-2"
    expect(result.current.totalCount).toBe(11)
    expect(result.current.totalCount).not.toBe(data.length)
  })

  it('filteredItems exposes the full filtered set, not just the current page slice', () => {
    const data = makeData(25)
    const { result } = renderHook(() =>
      usePaginatedSearch(data, matchesQuery, 10),
    )

    expect(result.current.filteredItems).toHaveLength(25)
    expect(result.current.pageItems).toHaveLength(10)

    act(() => {
      result.current.setQuery('item-1')
    })

    // item-1, item-10..19 match "item-1" -> 11 items, but only page 1 (10) shows
    expect(result.current.filteredItems).toHaveLength(11)
    expect(result.current.pageItems).toHaveLength(10)
  })
})
