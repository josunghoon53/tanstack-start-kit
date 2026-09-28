import { createFileRoute } from '@tanstack/react-router'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import { TablePagination } from '@/components/table-pagination'
import { TableSearchInput } from '@/components/table-search-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePaginatedSearch } from '@/hooks/use-paginated-search'

export const Route = createFileRoute('/users')({ component: Users })

const STATUS_TONE = {
  활성: 'success',
  비활성: 'neutral',
} as const

const USERS = [
  { name: '김민지', email: 'minji.kim@example.com', role: '관리자', status: '활성' as const, joinedAt: '2026-01-14' },
  { name: '이서준', email: 'seojun.lee@example.com', role: '편집자', status: '활성' as const, joinedAt: '2026-02-03' },
  { name: '박지훈', email: 'jihoon.park@example.com', role: '뷰어', status: '비활성' as const, joinedAt: '2026-03-21' },
  { name: '최유나', email: 'yuna.choi@example.com', role: '편집자', status: '활성' as const, joinedAt: '2026-05-09' },
]

function Users() {
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      USERS,
      (user, q) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
    )

  return (
    <div className="flex flex-col gap-3">
      <TableSearchInput value={query} onChange={setQuery} placeholder="이름, 이메일로 검색" />
      <Table className="border-y">
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((user) => (
            <TableRow key={user.email}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <StatusDot tone={STATUS_TONE[user.status]}>{user.status}</StatusDot>
              </TableCell>
              <TableCell>{user.joinedAt}</TableCell>
              <TableCell>
                <RowActions label={user.name} />
              </TableCell>
            </TableRow>
          ))}
          {pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                검색 결과가 없어요.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </div>
  )
}
