import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NavUser } from './nav-user'
import { SidebarProvider } from '@/components/ui/sidebar'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'
import { logoutFn } from '@/server/auth'

vi.mock('@/server/auth', () => ({
  loginFn: vi.fn(),
  logoutFn: vi.fn(),
}))

describe('NavUser', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    vi.mocked(logoutFn).mockReset()
    vi.mocked(logoutFn).mockResolvedValue({ ok: true })
  })

  function renderNavUser() {
    return renderWithRouter(
      <SidebarProvider>
        <NavUser />
      </SidebarProvider>,
      { initialPath: '/', extraPaths: ['/login', '/settings'] },
    )
  }

  it('opens the dropdown showing profile/settings/logout items', async () => {
    const user = userEvent.setup()
    renderNavUser()

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for the trigger before interacting with it.
    await user.click(await screen.findByRole('button'))

    expect(screen.getByRole('menuitem', { name: '프로필' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '설정' })).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: '로그아웃' }),
    ).toBeInTheDocument()
  })

  it('opens a confirm dialog when clicking logout, and cancel closes it without calling logoutFn', async () => {
    const user = userEvent.setup()
    renderNavUser()

    await user.click(await screen.findByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: '로그아웃' }))

    expect(screen.getByText('로그아웃할까요?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.queryByText('로그아웃할까요?')).not.toBeInTheDocument()
    expect(logoutFn).not.toHaveBeenCalled()
  })

  it('calls logoutFn when confirming logout', async () => {
    const user = userEvent.setup()
    renderNavUser()

    await user.click(await screen.findByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: '로그아웃' }))

    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: '로그아웃' }))

    expect(logoutFn).toHaveBeenCalled()
  })
})
