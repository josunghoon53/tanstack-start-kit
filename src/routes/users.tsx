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
import { Card, CardContent } from '@/components/ui/card'
import { USER_STATUS_TONE } from '@/config/users'
import { usersQueryOptions } from '@/server/users'
import { useTranslation } from '@/i18n/use-translation'

export const Route = createFileRoute('/users')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usersQueryOptions()),
  component: Users,
})

function Users() {
  const t = useTranslation()
  const { data: users } = useSuspenseQuery(usersQueryOptions())
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      users,
      (user, q) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    )

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <TableSearchInput
          value={query}
          onChange={setQuery}
          placeholder={t.users.searchPlaceholder}
        />
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead>{t.users.columns.name}</TableHead>
              <TableHead>{t.users.columns.role}</TableHead>
              <TableHead>{t.users.columns.status}</TableHead>
              <TableHead>{t.users.columns.joinedAt}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <StatusDot tone={USER_STATUS_TONE[user.status]}>
                    {user.status}
                  </StatusDot>
                </TableCell>
                <TableCell>{user.joinedAt}</TableCell>
                <TableCell>
                  <RowActions label={user.name} />
                </TableCell>
              </TableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t.common.noResults}
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
      </CardContent>
    </Card>
  )
}
