import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/i18n/use-translation'

// 라우트 loader가 느릴 때(실제 DB/외부 API를 붙였을 때) 페이지 전환이 멈춘 것처럼 보이지 않게 하는
// 전역 대기 화면. router.tsx의 defaultPendingComponent로 등록돼 있다.
export function PageLoading() {
  const t = useTranslation().common
  return (
    <Card className="flex-1">
      <CardContent
        role="status"
        aria-label={t.pageLoading}
        className="flex flex-col gap-4"
      >
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}
