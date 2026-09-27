import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/contents')({ component: Contents })

const CONTENTS = [
  { title: '9월 신규 기능 안내', author: '김민지', status: '발행' as const, date: '2026-09-15' },
  { title: '가을맞이 프로모션 소개', author: '이서준', status: '발행' as const, date: '2026-09-10' },
  { title: '고객센터 FAQ 개편안', author: '박지훈', status: '초안' as const, date: '2026-09-22' },
  { title: '10월 뉴스레터 초안', author: '최유나', status: '초안' as const, date: '2026-09-24' },
]

function Contents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>콘텐츠</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CONTENTS.map((content) => (
              <TableRow key={content.title}>
                <TableCell className="font-medium">{content.title}</TableCell>
                <TableCell>{content.author}</TableCell>
                <TableCell>
                  <Badge variant={content.status === '발행' ? 'default' : 'secondary'}>
                    {content.status}
                  </Badge>
                </TableCell>
                <TableCell>{content.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
