import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import { NOTIFICATION_CATEGORIES } from '@/config/notifications'
import type { NotificationItem } from '@/config/notifications'

const MOCK_NOTIFICATIONS: Array<NotificationItem> = [
  {
    iconKey: 'signup',
    category: '가입',
    message: '테스트유저1 님이 새로 가입했어요.',
    time: '5분 전',
  },
  {
    iconKey: 'signup',
    category: '가입',
    message: '테스트유저2 님이 새로 가입했어요.',
    time: '10분 전',
  },
  {
    iconKey: 'order',
    category: '주문',
    message: 'ORD-9001 주문이 배송을 시작했어요.',
    time: '1시간 전',
  },
  {
    iconKey: 'payment',
    category: '결제',
    message: 'PAY-9001 결제가 완료됐어요.',
    time: '2시간 전',
  },
]

vi.mock('@/server/notifications', () => ({
  notificationsQueryOptions: () => ({
    queryKey: ['notifications'],
    queryFn: async () => MOCK_NOTIFICATIONS,
  }),
}))

const { NotificationsMenu } = await import('@/components/notifications-menu')

const t = messages.ko

describe('NotificationsMenu', () => {
  it('shows the unread count badge on the bell button', async () => {
    renderWithQueryClient(<NotificationsMenu />)

    expect(
      await screen.findByText(String(MOCK_NOTIFICATIONS.length)),
    ).toBeInTheDocument()
  })

  it('opens a dropdown listing notifications with a category filter for each category', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<NotificationsMenu />)

    await screen.findByText(String(MOCK_NOTIFICATIONS.length))
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`^${t.notificationsMenu.srLabel}`),
      }),
    )

    expect(
      await screen.findByRole('button', { name: t.notificationsMenu.all }),
    ).toBeInTheDocument()
    for (const category of NOTIFICATION_CATEGORIES) {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument()
    }

    for (const item of MOCK_NOTIFICATIONS) {
      expect(screen.getByText(item.message)).toBeInTheDocument()
    }
  })

  it('filters the list to the selected category', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<NotificationsMenu />)

    await screen.findByText(String(MOCK_NOTIFICATIONS.length))
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`^${t.notificationsMenu.srLabel}`),
      }),
    )
    await screen.findByRole('button', { name: t.notificationsMenu.all })

    await user.click(screen.getByRole('button', { name: '가입' }))

    expect(
      screen.getByText('테스트유저1 님이 새로 가입했어요.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('테스트유저2 님이 새로 가입했어요.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('ORD-9001 주문이 배송을 시작했어요.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('PAY-9001 결제가 완료됐어요.'),
    ).not.toBeInTheDocument()
  })

  it('shows the empty state for a category with no matching notifications', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<NotificationsMenu />)

    await screen.findByText(String(MOCK_NOTIFICATIONS.length))
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`^${t.notificationsMenu.srLabel}`),
      }),
    )
    await screen.findByRole('button', { name: t.notificationsMenu.all })

    // 재고 카테고리에는 목 데이터가 없다.
    await user.click(screen.getByRole('button', { name: '재고' }))

    expect(
      await screen.findByText(t.notificationsMenu.empty),
    ).toBeInTheDocument()
  })
})
