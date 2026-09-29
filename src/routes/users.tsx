import { useSuspenseQuery } from '@tanstack/react-query'
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
import { USER_STATUS_TONE } from '@/config/users'
import { usersQueryOptions } from '@/server/users'

export const Route = createFileRoute('/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQueryOptions()),
  component: Users,
})

function Users() {
  const { data: users } = useSuspenseQuery(usersQueryOptions())
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      users,
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
                <StatusDot tone={USER_STATUS_TONE[user.status]}>{user.status}</StatusDot>
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
