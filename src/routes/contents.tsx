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
              <TableHead>{t.contents.columns.title}</TableHead>
              <TableHead>{t.contents.columns.author}</TableHead>
              <TableHead>{t.contents.columns.status}</TableHead>
              <TableHead>{t.contents.columns.date}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((content) => (
              <TableRow key={content.title}>
                <TableCell className="font-medium">{content.title}</TableCell>
                <TableCell>{content.author}</TableCell>
                <TableCell>
                  <StatusDot tone={CONTENT_STATUS_TONE[content.status]}>
                    {content.status}
                  </StatusDot>
                </TableCell>
                <TableCell>{content.date}</TableCell>
                <TableCell>
                  <RowActions label={content.title} />
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
