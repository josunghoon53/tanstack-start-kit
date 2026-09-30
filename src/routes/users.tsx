import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Download, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RowActions } from '@/components/row-actions'
import { SortableTableHead } from '@/components/sortable-table-head'
import { StatusDot } from '@/components/status-dot'
import { TableBulkActionsBar } from '@/components/table-bulk-actions-bar'
import { TableMultiSelectFilter } from '@/components/table-multi-select-filter'
import { TablePagination } from '@/components/table-pagination'
import { TableRowDetail } from '@/components/table-row-detail'
import { TableSearchInput } from '@/components/table-search-input'
import {
  TABLE_FILTER_ALL,
  TableSelectFilter,
} from '@/components/table-select-filter'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useRowSelection } from '@/hooks/use-row-selection'
import { useSort } from '@/hooks/use-sort'
import { Card, CardContent } from '@/components/ui/card'
import { downloadCsv, toCsv } from '@/lib/csv'
import { sortItems } from '@/lib/sort'
import { cn } from '@/lib/utils'
import { USER_STATUS_TONE } from '@/config/users'
import type { UserItem, UserStatus } from '@/config/users'
import { usersQueryOptions } from '@/server/users'
import { useTranslation } from '@/i18n/use-translation'

const USER_STATUSES: Array<UserStatus> = ['활성', '비활성']

type UserSortKey = 'name' | 'role' | 'status' | 'joinedAt'

const USER_SORT_VALUES: Record<
  UserSortKey,
  (user: UserItem) => string | number
> = {
  name: (user) => user.name,
  role: (user) => user.role,
  status: (user) => user.status,
  joinedAt: (user) => user.joinedAt,
}

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
  const { sortKey, direction, toggleSort } = useSort<UserSortKey>()
  const sortedUsers = useMemo(
    () =>
      sortItems(
        users,
        sortKey ? USER_SORT_VALUES[sortKey] : undefined,
        direction,
      ),
    [users, sortKey, direction],
  )
  const {
    query,
    setQuery,
    page,
    setPage,
    totalPages,
    pageItems,
    filteredItems,
    totalCount,
  } = usePaginatedSearch(sortedUsers, (user, q) => {
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
  const selection = useRowSelection<UserItem>((user) => user.email)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  function exportRows(rows: Array<UserItem>) {
    const csv = toCsv(rows, [
      { header: t.users.columns.name, accessor: (u) => u.name },
      { header: 'Email', accessor: (u) => u.email },
      { header: t.users.columns.role, accessor: (u) => u.role },
      { header: t.users.columns.status, accessor: (u) => u.status },
      { header: t.users.columns.joinedAt, accessor: (u) => u.joinedAt },
    ])
    downloadCsv('users.csv', csv)
  }

  function handleBulkDelete() {
    setBulkDeleteOpen(false)
    toast.success(t.common.deleteSelectedToast(selection.count))
    selection.clear()
  }

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
          <div className="ml-auto flex items-center gap-2">
            <TableBulkActionsBar
              count={selection.count}
              onClear={selection.clear}
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  exportRows(
                    pageItems.filter((user) => selection.isSelected(user)),
                  )
                }
              >
                <Download className="size-4" />
                {t.common.exportCsv}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                {t.common.deleteSelected}
              </Button>
            </TableBulkActionsBar>
            {selection.count === 0 && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportRows(filteredItems)}
              >
                <Download className="size-4" />
                {t.common.exportCsv}
              </Button>
            )}
          </div>
        </div>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  aria-label={t.common.selectAllRows}
                  checked={
                    selection.isAllSelected(pageItems)
                      ? true
                      : selection.isSomeSelected(pageItems)
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) =>
                    selection.toggleAll(pageItems, checked === true)
                  }
                />
              </TableHead>
              <TableHead className="w-8" />
              <SortableTableHead
                sortKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.users.columns.name}
              </SortableTableHead>
              <SortableTableHead
                sortKey="role"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.users.columns.role}
              </SortableTableHead>
              <SortableTableHead
                sortKey="status"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.users.columns.status}
              </SortableTableHead>
              <SortableTableHead
                sortKey="joinedAt"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.users.columns.joinedAt}
              </SortableTableHead>
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
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={t.common.selectRow(user.name)}
                        checked={selection.isSelected(user)}
                        onCheckedChange={(checked) =>
                          selection.toggle(user, checked === true)
                        }
                      />
                    </TableCell>
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
                  {open && <TableRowDetail colSpan={7} details={details} />}
                </Fragment>
              )
            })}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.common.deleteSelectedTitle(selection.count)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.deleteSelectedDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleBulkDelete}>
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
