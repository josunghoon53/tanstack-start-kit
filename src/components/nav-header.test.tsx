import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { NavHeader } from './nav-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'

describe('NavHeader', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('renders the brand and tagline', async () => {
    renderWithRouter(
      <SidebarProvider>
        <NavHeader />
      </SidebarProvider>,
    )

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for the brand text before asserting the rest.
    expect(await screen.findByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('관리자 콘솔')).toBeInTheDocument()
  })

  it('links to the dashboard', async () => {
    renderWithRouter(
      <SidebarProvider>
        <NavHeader />
      </SidebarProvider>,
    )

    expect(await screen.findByRole('link')).toHaveAttribute('href', '/')
  })
})
