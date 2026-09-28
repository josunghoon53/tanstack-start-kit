import { Link } from '@tanstack/react-router'
import { Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export function NotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Construction className="size-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle>아직 준비되지 않은 페이지예요</CardTitle>
          <CardDescription>이 메뉴는 예시로만 등록돼 있고, 실제 화면은 아직 만들지 않았어요.</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link to="/">대시보드로 돌아가기</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
