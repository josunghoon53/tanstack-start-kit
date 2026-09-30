import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { UserItem } from '@/config/users'

const MOCK_USERS: Array<UserItem> = [
  {
    name: '김민지',
    email: 'minji@example.com',
    role: '관리자',
    status: '활성',
    joinedAt: '2026-01-10',
  },
  {
    name: '이서준',
    email: 'seojun@example.com',
    role: '편집자',
    status: '활성',
    joinedAt: '2026-02-11',
  },
  {
    name: '박지훈',
    email: 'jihoon@example.com',
    role: '뷰어',
    status: '비활성',
    joinedAt: '2026-03-12',
  },
]

vi.mock('@/server/users', () => ({
  usersQueryOptions: () => ({
    queryKey: ['users'],
    queryFn: async () => MOCK_USERS,
  }),
}))

const { Route } = await import('@/routes/users')
const Users = Route.options.component as () => React.ReactElement

const t = messages.ko

describe('Users route', () => {
  it('renders columns and rows for every mocked user', async () => {
    renderWithQueryClient(<Users />)

    await screen.findByText('김민지')

    expect(
      screen.getByRole('columnheader', { name: t.users.columns.name }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.users.columns.role }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.users.columns.status }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.users.columns.joinedAt }),
    ).toBeInTheDocument()

    for (const user of MOCK_USERS) {
      expect(screen.getByText(user.name)).toBeInTheDocument()
      expect(screen.getByText(user.email)).toBeInTheDocument()
    }
  })

  it('renders pagination and row actions per row', async () => {
    renderWithQueryClient(<Users />)

    await screen.findByText('김민지')

    expect(screen.getByText(t.common.totalCount(3))).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /작업 열기/ })).toHaveLength(
      MOCK_USERS.length,
    )
  })

  it('filters rows by name or email via the search input', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Users />)

    await screen.findByText('김민지')

    const search = screen.getByPlaceholderText(t.users.searchPlaceholder)
    await user.type(search, 'jihoon')

    expect(screen.queryByText('김민지')).not.toBeInTheDocument()
    expect(screen.getByText('박지훈')).toBeInTheDocument()
    expect(screen.queryByText('이서준')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches the search query', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Users />)

    await screen.findByText('김민지')

    const search = screen.getByPlaceholderText(t.users.searchPlaceholder)
    await user.type(search, '존재하지않는검색어')

    expect(await screen.findByText(t.common.noResults)).toBeInTheDocument()
  })
})
