import { describe, expect, it, vi } from 'vitest'
import { downloadCsv, toCsv } from './csv'

interface Item {
  id: string
  name: string
  note: string
}

describe('toCsv', () => {
  it('builds a header row plus one row per item', () => {
    const rows: Array<Item> = [
      { id: '1', name: '홍길동', note: '메모' },
      { id: '2', name: '김철수', note: '' },
    ]
    const csv = toCsv(rows, [
      { header: 'ID', accessor: (r) => r.id },
      { header: '이름', accessor: (r) => r.name },
      { header: '메모', accessor: (r) => r.note },
    ])

    expect(csv).toBe('ID,이름,메모\n1,홍길동,메모\n2,김철수,')
  })

  it('quotes and escapes values containing commas, quotes, or newlines', () => {
    const rows = [{ note: 'a,b "c"\nd' }]
    const csv = toCsv(rows, [{ header: 'note', accessor: (r) => r.note }])

    expect(csv).toBe('note\n"a,b ""c""\nd"')
  })

  it('returns just the header row for an empty dataset', () => {
    const csv = toCsv([], [{ header: 'ID', accessor: () => '' }])
    expect(csv).toBe('ID')
  })
})

describe('downloadCsv', () => {
  it('creates an object URL, triggers a click on an anchor, then revokes the URL', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') el.click = clickSpy
      return el
    })

    downloadCsv('orders.csv', 'a,b\n1,2')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
})
