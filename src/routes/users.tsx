import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import { TableMultiSelectFilter } from '@/components/table-multi-select-filter'
import { TablePagination } from '@/components/table-pagination'
import { TableRowDetail } from '@/components/table-row-detail'
import { TableSearchInput } from '@/components/table-search-input'
import {
  TABLE_FILTER_ALL,
  TableSelectFilter,
} from '@/components/table-select-filter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAccordionGroup } from '@/hooks/use-accordion-group'
import { usePaginatedSearch } from '@/hooks/use-paginated-search'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { USER_STATUS_TONE } from '@/config/users'
import type { UserStatus } from '@/config/users'
import { usersQueryOptions } from '@/server/users'
import { useTranslation } from '@/i18n/use-translation'

const USER_STATUSES: Array<UserStatus> = ['활성', '비활성']

export const Route = createFileRoute('/users')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usersQueryOptions()),
  component: Users,
})

function Users() {
  const t = useTranslation()
  const { data: users } = useSuspenseQuery(usersQueryOptions())
  const roles = useMemo(
    () => Array.from(new Set(users.map((user) => user.role))).sort(),
    [users],
  )
  const [roleFilter, setRoleFilter] = useState<Array<string>>([])
  const [statusFilter, setStatusFilter] = useState(TABLE_FILTER_ALL)
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(users, (user, q) => {
      const matchesText =
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      const matchesRole =
        roleFilter.length === 0 || roleFilter.includes(user.role)
      const matchesStatus =
        statusFilter === TABLE_FILTER_ALL || user.status === statusFilter
      return matchesText && matchesRole && matchesStatus
    })
  const { isOpen, setOpen } = useAccordionGroup()

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.users.searchPlaceholder}
          />
          <TableMultiSelectFilter
            label={t.users.columns.role}
            options={roles.map((role) => ({ label: role, value: role }))}
            selected={roleFilter}
            onChange={setRoleFilter}
          />
          <TableSelectFilter
            ariaLabel={t.users.columns.status}
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel={t.common.all}
            options={USER_STATUSES.map((status) => ({
              label: status,
              value: status,
            }))}
            className="w-32"
          />
        </div>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t.users.columns.name}</TableHead>
              <TableHead>{t.users.columns.role}</TableHead>
              <TableHead>{t.users.columns.status}</TableHead>
              <TableHead>{t.users.columns.joinedAt}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((user) => {
              const details = [
                { label: t.users.columns.role, value: user.role },
                { label: t.users.columns.status, value: user.status },
                { label: t.users.columns.joinedAt, value: user.joinedAt },
              ]
              const open = isOpen(user.email)

              return (
                <Fragment key={user.email}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(user.email, !open)}
                  >
                    <TableCell>
                      <ChevronRight
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          open && 'rotate-90',
                        )}
                      />
                      <span className="sr-only">
                        {open
                          ? t.common.collapseRow(user.name)
                          : t.common.expandRow(user.name)}
                      </span>
                    </TableCell>
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
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <RowActions label={user.name} details={details} />
                    </TableCell>
                  </TableRow>
                  {open && <TableRowDetail colSpan={6} details={details} />}
                </Fragment>
              )
            })}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
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
