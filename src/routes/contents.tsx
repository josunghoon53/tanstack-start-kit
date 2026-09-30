import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import { TablePagination } from '@/components/table-pagination'
import { TableRowDetail } from '@/components/table-row-detail'
import { TableSearchInput } from '@/components/table-search-input'
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
import { CONTENT_STATUS_TONE } from '@/config/contents'
import { contentsQueryOptions } from '@/server/contents'
import { useTranslation } from '@/i18n/use-translation'

export const Route = createFileRoute('/contents')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(contentsQueryOptions()),
  component: Contents,
})

function Contents() {
  const t = useTranslation()
  const { data: contents } = useSuspenseQuery(contentsQueryOptions())
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      contents,
      (content, q) =>
        content.title.toLowerCase().includes(q) ||
        content.author.toLowerCase().includes(q),
    )
  const { isOpen, setOpen } = useAccordionGroup()

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <TableSearchInput
          value={query}
          onChange={setQuery}
          placeholder={t.contents.searchPlaceholder}
        />
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t.contents.columns.title}</TableHead>
              <TableHead>{t.contents.columns.author}</TableHead>
              <TableHead>{t.contents.columns.status}</TableHead>
              <TableHead>{t.contents.columns.date}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((content) => {
              const details = [
                { label: t.contents.columns.author, value: content.author },
                { label: t.contents.columns.status, value: content.status },
                { label: t.contents.columns.date, value: content.date },
              ]
              const open = isOpen(content.title)

              return (
                <Fragment key={content.title}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(content.title, !open)}
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
