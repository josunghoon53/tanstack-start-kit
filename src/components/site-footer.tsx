import { Link } from '@tanstack/react-router'
import { AtSign, FolderGit2, Mail } from 'lucide-react'
import { APP_NAME, APP_VERSION } from '@/config/site'
import { getFooterColumns, getFooterSocialLinks } from '@/config/footer'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/i18n/use-translation'
import { useLocaleStore } from '@/i18n/locale-store'

// 번역된 라벨 텍스트로 아이콘을 찾으면 번역이 바뀔 때 깨지므로, FOOTER_SOCIAL_LINKS와
// 같은 순서(GitHub/X/이메일)의 배열로 고정 매핑한다.
const SOCIAL_ICONS_IN_ORDER = [FolderGit2, AtSign, Mail]

function FooterLinkItem({ label, href }: { label: string; href: string }) {
  const className =
    'text-sm text-muted-foreground transition-colors hover:text-foreground'

  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <a href={href} className={className}>
      {label}
    </a>
  )
}

export function SiteFooter() {
  const t = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const footerColumns = getFooterColumns(locale)
  const footerSocialLinks = getFooterSocialLinks(locale)

  return (
    <footer className="shrink-0 border-t bg-background">
      <div className="flex flex-wrap gap-10 px-6 py-8">
        <div className="flex max-w-xs flex-col gap-3">
          <span className="text-base font-bold">{APP_NAME}</span>
          <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
          <div className="mt-1 flex items-center gap-3">
            {footerSocialLinks.map((link, index) => {
              const Icon = SOCIAL_ICONS_IN_ORDER[index] ?? Mail
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              )
            })}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="text-sm font-semibold">{column.title}</span>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <FooterLinkItem label={link.label} href={link.href} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between px-6 py-4 text-xs text-muted-foreground">
        <span>
          &copy; {new Date().getFullYear()} {APP_NAME}.{' '}
          {t.footer.copyrightSuffix}
        </span>
        <span>v{APP_VERSION}</span>
      </div>
    </footer>
  )
}
