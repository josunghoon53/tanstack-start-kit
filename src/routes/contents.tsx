import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Download, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
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
import {
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/components/animated-table-row'
import { TableBulkActionsBar } from '@/components/table-bulk-actions-bar'
import { TableDateRangeFilter } from '@/components/table-date-range-filter'
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
import { isWithinDateRange } from '@/lib/date'
import { sortItems } from '@/lib/sort'
import { cn } from '@/lib/utils'
import { CONTENT_STATUS_TONE } from '@/config/contents'
import type { ContentItem, ContentStatus } from '@/config/contents'
import { contentsQueryOptions } from '@/server/contents'
import { useTranslation } from '@/i18n/use-translation'

const CONTENT_STATUSES: Array<ContentStatus> = ['발행', '초안']

type ContentSortKey = 'title' | 'author' | 'status' | 'date'

const CONTENT_SORT_VALUES: Record<
  ContentSortKey,
  (content: ContentItem) => string | number
> = {
  title: (content) => content.title,
  author: (content) => content.author,
  status: (content) => content.status,
  date: (content) => content.date,
}

export const Route = createFileRoute('/contents')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(contentsQueryOptions()),
  component: Contents,
})

function Contents() {
  const t = useTranslation()
  const { data: contents } = useSuspenseQuery(contentsQueryOptions())
  const [statusFilter, setStatusFilter] = useState(TABLE_FILTER_ALL)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const { sortKey, direction, toggleSort } = useSort<ContentSortKey>()
  const sortedContents = useMemo(
    () =>
      sortItems(
        contents,
        sortKey ? CONTENT_SORT_VALUES[sortKey] : undefined,
        direction,
      ),
    [contents, sortKey, direction],
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
  } = usePaginatedSearch(sortedContents, (content, q) => {
    const matchesText =
      content.title.toLowerCase().includes(q) ||
      content.author.toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === TABLE_FILTER_ALL || content.status === statusFilter
    const matchesDate = isWithinDateRange(content.date, dateRange)
    return matchesText && matchesStatus && matchesDate
  })
  const { isOpen, setOpen } = useAccordionGroup()
  const selection = useRowSelection<ContentItem>((content) => content.title)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  function exportRows(rows: Array<ContentItem>) {
    const csv = toCsv(rows, [
      { header: t.contents.columns.title, accessor: (c) => c.title },
      { header: t.contents.columns.author, accessor: (c) => c.author },
      { header: t.contents.columns.status, accessor: (c) => c.status },
      { header: t.contents.columns.date, accessor: (c) => c.date },
    ])
    downloadCsv('contents.csv', csv)
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
            placeholder={t.contents.searchPlaceholder}
          />
          <TableSelectFilter
            ariaLabel={t.contents.columns.status}
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel={t.common.all}
            options={CONTENT_STATUSES.map((status) => ({
              label: status,
              value: status,
            }))}
            className="w-32"
          />
          <TableDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            placeholder={t.common.dateRangePlaceholder}
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
                    pageItems.filter((content) =>
                      selection.isSelected(content),
                    ),
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
                sortKey="title"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.contents.columns.title}
              </SortableTableHead>
              <SortableTableHead
                sortKey="author"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.contents.columns.author}
              </SortableTableHead>
              <SortableTableHead
                sortKey="status"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.contents.columns.status}
              </SortableTableHead>
              <SortableTableHead
                sortKey="date"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.contents.columns.date}
              </SortableTableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <AnimatedTableBody
            layoutKey={pageItems.map((content) => content.title).join('|')}
          >
            {pageItems.map((content) => {
              const details = [
                { label: t.contents.columns.author, value: content.author },
                { label: t.contents.columns.status, value: content.status },
                { label: t.contents.columns.date, value: content.date },
              ]
              const open = isOpen(content.title)

              return (
                <Fragment key={content.title}>
                  <AnimatedTableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(content.title, !open)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={t.common.selectRow(content.title)}
                        checked={selection.isSelected(content)}
                        onCheckedChange={(checked) =>
                          selection.toggle(content, checked === true)
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
                          ? t.common.collapseRow(content.title)
                          : t.common.expandRow(content.title)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {content.title}
                    </TableCell>
                    <TableCell>{content.author}</TableCell>
                    <TableCell>
                      <StatusDot tone={CONTENT_STATUS_TONE[content.status]}>
                        {content.status}
                      </StatusDot>
                    </TableCell>
                    <TableCell>{content.date}</TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <RowActions label={content.title} details={details} />
                    </TableCell>
                  </AnimatedTableRow>
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
          </AnimatedTableBody>
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
