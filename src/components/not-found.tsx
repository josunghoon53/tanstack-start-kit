import { Link } from '@tanstack/react-router'
import { Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/i18n/use-translation'

export function NotFound() {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Construction className="size-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle>{t.notFound.title}</CardTitle>
          <CardDescription>{t.notFound.description}</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link to="/">{t.notFound.backToDashboard}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
