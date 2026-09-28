import { useMemo, useState } from 'react'

export function usePaginatedSearch<T>(
  data: Array<T>,
  matchesQuery: (item: T, query: string) => boolean,
  pageSize = 10,
) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return data
    return data.filter((item) => matchesQuery(item, trimmed))
  }, [data, query, matchesQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
