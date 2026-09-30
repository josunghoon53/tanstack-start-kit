import { useState } from 'react'

// 체크박스 다중 선택 상태. 선택은 id(문자열) 집합으로 들고 있어서 페이지를 넘겨도
// (현재 페이지에 안 보이는 행이라도) 유지된다 — "전체 선택"은 현재 페이지에 보이는
// 행 기준으로만 동작한다(관례적인 동작).
export function useRowSelection<T>(idOf: (item: T) => string) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(item: T, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(idOf(item))
      else next.delete(idOf(item))
      return next
    })
  }

  function toggleAll(items: Array<T>, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const item of items) {
        if (checked) next.add(idOf(item))
        else next.delete(idOf(item))
      }
      return next
    })
  }

  function isSelected(item: T) {
    return selected.has(idOf(item))
  }

  function isAllSelected(items: Array<T>) {
    return items.length > 0 && items.every((item) => selected.has(idOf(item)))
  }

  function isSomeSelected(items: Array<T>) {
    return (
      items.some((item) => selected.has(idOf(item))) && !isAllSelected(items)
    )
  }

  function clear() {
    setSelected(new Set())
  }

  return {
    count: selected.size,
    toggle,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
    clear,
  }
}
