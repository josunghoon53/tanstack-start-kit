import { useState } from 'react'

export type SortDirection = 'asc' | 'desc'

/**
 * 컬럼 정렬 상태만 들고 있는 훅 — 실제 정렬은 `sortByKey`(같은 폴더 아님, `@/lib/sort`)로
 * 한다. 헤더를 클릭할 때마다 asc -> desc -> 정렬 해제 순서로 순환한다(세 번째 클릭에서
 * `sortKey`가 `undefined`가 되어 원래 순서로 돌아온다).
 */
export function useSort<K extends string>() {
  const [sortKey, setSortKey] = useState<K | undefined>(undefined)
  const [direction, setDirection] = useState<SortDirection>('asc')

  function toggleSort(key: K) {
    if (sortKey !== key) {
      setSortKey(key)
      setDirection('asc')
      return
    }
    if (direction === 'asc') {
      setDirection('desc')
      return
    }
    setSortKey(undefined)
  }

  return { sortKey, direction, toggleSort }
}
