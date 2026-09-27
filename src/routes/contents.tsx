import { createFileRoute } from '@tanstack/react-router'
import { RowActions } from '@/components/row-actions'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { statusBadgeClass } from '@/lib/status-badge'

export const Route = createFileRoute('/contents')({ component: Contents })

const STATUS_TONE = {
  발행: 'success',
  초안: 'neutral',
} as const

const CONTENTS = [
  { title: '9월 신규 기능 안내', author: '김민지', status: '발행' as const, date: '2026-09-15' },
  { title: '가을맞이 프로모션 소개', author: '이서준', status: '발행' as const, date: '2026-09-10' },
  { title: '고객센터 FAQ 개편안', author: '박지훈', status: '초안' as const, date: '2026-09-22' },
  { title: '10월 뉴스레터 초안', author: '최유나', status: '초안' as const, date: '2026-09-24' },
]

function Contents() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>작성자</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>작성일</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {CONTENTS.map((content) => (
          <TableRow key={content.title}>
            <TableCell className="font-medium">{content.title}</TableCell>
            <TableCell>{content.author}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={statusBadgeClass(STATUS_TONE[content.status])}
              >
                {content.status}
              </Badge>
            </TableCell>
            <TableCell>{content.date}</TableCell>
            <TableCell>
              <RowActions label={content.title} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
