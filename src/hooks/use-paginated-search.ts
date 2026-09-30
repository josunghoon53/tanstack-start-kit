import { useMemo, useState } from 'react'

export function usePaginatedSearch<T>(
  data: Array<T>,
  matchesQuery: (item: T, query: string) => boolean,
  pageSize = 10,
) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  // 빈 검색어일 때 matchesQuery를 건너뛰고 data를 그대로 반환하지 않는다 — 그러면
  // 상태/날짜 필터처럼 matchesQuery 클로저 안에 같이 접어넣은 다른 조건들이 검색어를
  // 입력하기 전까지는 전혀 적용되지 않는다. `''.includes('')`처럼 빈 문자열은 항상
  // 매치되므로, 텍스트 전용 matchesQuery를 쓰는 기존 호출부는 동작이 그대로다.
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    return data.filter((item) => matchesQuery(item, trimmed))
  }, [data, query, matchesQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function updateQuery(next: string) {
    setQuery(next)
    setPage(1)
  }

  return {
    query,
    setQuery: updateQuery,
    page: currentPage,
    setPage,
    totalPages,
    pageItems,
    totalCount: filtered.length,
  }
}
