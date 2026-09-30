import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { ContentItem } from '@/config/contents'

const MOCK_CONTENTS: Array<ContentItem> = [
  {
    title: '11월 이벤트 안내',
    author: '김민지',
    status: '발행',
    date: '2026-09-05',
  },
  {
    title: '연말 프로모션 초안',
    author: '이서준',
    status: '초안',
    date: '2026-09-06',
  },
  {
    title: '서비스 점검 공지',
    author: '박지훈',
    status: '발행',
    date: '2026-09-07',
  },
]

vi.mock('@/server/contents', () => ({
  contentsQueryOptions: () => ({
    queryKey: ['contents'],
    queryFn: async () => MOCK_CONTENTS,
  }),
}))

const { Route } = await import('@/routes/contents')
const Contents = Route.options.component as () => React.ReactElement

const t = messages.ko

describe('Contents route', () => {
  it('renders columns and rows for every mocked content', async () => {
    renderWithQueryClient(<Contents />)

    await screen.findByText('11월 이벤트 안내')

    expect(
      screen.getByRole('columnheader', { name: t.contents.columns.title }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.contents.columns.author }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.contents.columns.status }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.contents.columns.date }),
    ).toBeInTheDocument()

    for (const content of MOCK_CONTENTS) {
      expect(screen.getByText(content.title)).toBeInTheDocument()
      expect(screen.getByText(content.author)).toBeInTheDocument()
    }
  })

  it('renders pagination and row actions per row', async () => {
    renderWithQueryClient(<Contents />)

    await screen.findByText('11월 이벤트 안내')

    expect(screen.getByText(t.common.totalCount(3))).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /작업 열기/ })).toHaveLength(
      MOCK_CONTENTS.length,
    )
  })

  it('filters rows by title or author via the search input', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Contents />)

    await screen.findByText('11월 이벤트 안내')

    const search = screen.getByPlaceholderText(t.contents.searchPlaceholder)
    await user.type(search, '박지훈')

    expect(screen.queryByText('11월 이벤트 안내')).not.toBeInTheDocument()
    expect(screen.getByText('서비스 점검 공지')).toBeInTheDocument()
    expect(screen.queryByText('연말 프로모션 초안')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches the search query', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Contents />)

    await screen.findByText('11월 이벤트 안내')

    const search = screen.getByPlaceholderText(t.contents.searchPlaceholder)
    await user.type(search, '존재하지않는검색어')

    expect(await screen.findByText(t.common.noResults)).toBeInTheDocument()
  })
})
