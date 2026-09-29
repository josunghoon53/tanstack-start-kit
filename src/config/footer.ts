// 실제 서비스로 바꿀 때 이 배열들의 label/href만 프로젝트에 맞게 고치면 된다.
export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: Array<FooterLink>
}

export const FOOTER_COLUMNS: Array<FooterColumn> = [
  {
    title: '제품',
    links: [
      { label: '대시보드', href: '/' },
      { label: '주문 관리', href: '/orders' },
      { label: '설정', href: '/settings' },
    ],
  },
  {
    title: '리소스',
    links: [
      { label: '문서', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: '변경 이력', href: '#' },
    ],
  },
  {
    title: '법적 정보',
    links: [
      { label: '이용약관', href: '#' },
      { label: '개인정보처리방침', href: '#' },
    ],
  },
]

export const FOOTER_SOCIAL_LINKS: Array<FooterLink> = [
  { label: 'GitHub', href: '#' },
  { label: 'X (Twitter)', href: '#' },
  { label: '이메일', href: 'mailto:hello@example.com' },
]
