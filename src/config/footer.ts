import { messages } from '@/i18n/messages'
import type { Locale } from '@/i18n/messages'

// 실제 서비스로 바꿀 때 이 배열들의 label/href만 프로젝트에 맞게 고치면 된다.
export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: Array<FooterLink>
}

export function getFooterColumns(locale: Locale): Array<FooterColumn> {
  const t = messages[locale].footer

  return [
    {
      title: t.columns.product,
      links: [
        { label: t.links.dashboard, href: '/' },
        { label: t.links.ordersManagement, href: '/orders' },
        { label: t.links.settings, href: '/settings' },
      ],
    },
    {
      title: t.columns.resources,
      links: [
        { label: t.links.docs, href: '#' },
        { label: t.links.github, href: '#' },
        { label: t.links.changelog, href: '#' },
      ],
    },
    {
      title: t.columns.legal,
      links: [
        { label: t.links.terms, href: '#' },
        { label: t.links.privacy, href: '#' },
      ],
    },
  ]
}

export function getFooterSocialLinks(locale: Locale): Array<FooterLink> {
  const t = messages[locale].footer

  return [
    { label: t.links.github, href: '#' },
    { label: t.links.twitter, href: '#' },
    { label: t.links.email, href: 'mailto:hello@example.com' },
  ]
}
