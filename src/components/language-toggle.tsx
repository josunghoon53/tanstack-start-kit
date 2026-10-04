import { Button } from '@/components/ui/button'
import { useLocaleStore } from '@/i18n/locale-store'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/messages'

// 언어 이름(한국어/English)은 각 언어 표기 그대로 보여주는 고유명사라 번역 딕셔너리에
// 넣지 않는다 — 언어 선택 UI에서는 보통 각 언어를 그 언어 자체로 표기한다.
const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}

const NEXT_LOCALE: Record<Locale, Locale> = {
  ko: 'en',
  en: 'ko',
}

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const nextLocale = NEXT_LOCALE[locale]

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(className)}
      onClick={() => setLocale(nextLocale)}
      aria-label={`Switch language to ${LOCALE_LABELS[nextLocale]}`}
      title={`Switch language to ${LOCALE_LABELS[nextLocale]}`}
    >
      {LOCALE_LABELS[locale]}
    </Button>
  )
}
