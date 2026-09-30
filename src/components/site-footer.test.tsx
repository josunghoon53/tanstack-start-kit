import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SiteFooter } from './site-footer'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'
import { getFooterColumns } from '@/config/footer'
import { APP_NAME, APP_VERSION } from '@/config/site'

describe('SiteFooter', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('renders the app name, tagline, and version', async () => {
    renderWithRouter(<SiteFooter />, {
      initialPath: '/',
      extraPaths: ['/orders', '/settings'],
    })

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for content before asserting the rest.
    expect((await screen.findAllByText(APP_NAME)).length).toBeGreaterThan(0)
    expect(
      screen.getByText('TanStack Start 기반의 가벼운 어드민 셸 킷이에요.'),
    ).toBeInTheDocument()
    expect(screen.getByText(`v${APP_VERSION}`)).toBeInTheDocument()
  })

  it('renders the footer columns from config', async () => {
    renderWithRouter(<SiteFooter />, {
      initialPath: '/',
      extraPaths: ['/orders', '/settings'],
    })

    const columns = getFooterColumns('ko')
    await screen.findByText(columns[0].title)
    for (const column of columns) {
      expect(screen.getByText(column.title)).toBeInTheDocument()
      for (const link of column.links) {
        expect(screen.getByText(link.label)).toBeInTheDocument()
      }
    }
  })

  it('renders internal footer links as router links pointing to their href', async () => {
    renderWithRouter(<SiteFooter />, {
      initialPath: '/',
      extraPaths: ['/orders', '/settings'],
    })

    expect((await screen.findByText('대시보드')).closest('a')).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByText('주문 관리').closest('a')).toHaveAttribute(
      'href',
      '/orders',
    )
    expect(screen.getByText('설정').closest('a')).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('renders external/hash links as plain anchors', async () => {
    renderWithRouter(<SiteFooter />, {
      initialPath: '/',
      extraPaths: ['/orders', '/settings'],
    })

    expect((await screen.findByText('문서')).closest('a')).toHaveAttribute(
      'href',
      '#',
    )
    expect(screen.getByLabelText('이메일')).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    )
  })
})
