import { Link } from '@tanstack/react-router'
import { AtSign, FolderGit2, Mail } from 'lucide-react'
import { APP_NAME, APP_VERSION } from '@/config/site'
import { FOOTER_COLUMNS, FOOTER_SOCIAL_LINKS } from '@/config/footer'
import { Separator } from '@/components/ui/separator'

const SOCIAL_ICONS: Record<string, typeof Mail> = {
  GitHub: FolderGit2,
  'X (Twitter)': AtSign,
  이메일: Mail,
}

function FooterLinkItem({ label, href }: { label: string; href: string }) {
  const className = 'text-sm text-muted-foreground transition-colors hover:text-foreground'

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
  return (
    <footer className="shrink-0 border-t">
      <div className="flex flex-wrap gap-10 px-6 py-8">
        <div className="flex max-w-xs flex-col gap-3">
          <span className="text-base font-bold">{APP_NAME}</span>
          <p className="text-sm text-muted-foreground">
            TanStack Start 기반의 가벼운 어드민 셸 킷이에요.
          </p>
          <div className="mt-1 flex items-center gap-3">
            {FOOTER_SOCIAL_LINKS.map((link) => {
              const Icon = SOCIAL_ICONS[link.label] ?? Mail
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

        {FOOTER_COLUMNS.map((column) => (
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
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </span>
        <span>v{APP_VERSION}</span>
      </div>
    </footer>
  )
}
