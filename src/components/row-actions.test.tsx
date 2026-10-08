import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { RowActions, joinSummary } from './row-actions'
import type { ComponentProps } from 'react'
import { useLocaleStore } from '@/i18n/locale-store'
import { MotionProvider } from '@/lib/motion'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function renderRowActions(props: ComponentProps<typeof RowActions>) {
  return render(
    <MotionProvider>
      <RowActions {...props} />
    </MotionProvider>,
  )
}

async function openSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))
  await user.click(screen.getByRole('menuitem', { name: '보기' }))
  return screen.findByRole('dialog')
}

describe('joinSummary', () => {
  it('joins non-empty parts with a middle dot', () => {
    expect(
      joinSummary('관리자', '', undefined, false, '가입일 2026-01-14'),
    ).toBe('관리자 · 가입일 2026-01-14')
    expect(joinSummary()).toBe('')
  })
})

describe('RowActions', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    vi.clearAllMocks()
  })

  it('opens the dropdown menu with 보기/수정/삭제 items', async () => {
    const user = userEvent.setup()
    render(<RowActions label="상품 A" />)

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))

    expect(screen.getByRole('menuitem', { name: '보기' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '수정' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '삭제' })).toBeInTheDocument()
  })

  it('opens a view sheet with the given details and closes it', async () => {
    const user = userEvent.setup()
    render(
      <RowActions
        label="상품 A"
        details={[
          { label: '카테고리', value: '전자기기' },
          { label: '재고', value: 12 },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))
    await user.click(screen.getByRole('menuitem', { name: '보기' }))

    expect(
      await screen.findByRole('heading', { name: '상품 A' }),
    ).toBeInTheDocument()
    expect(screen.getByText('카테고리')).toBeInTheDocument()
    expect(screen.getByText('전자기기')).toBeInTheDocument()
    expect(screen.getByText('재고')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '닫기' }))

    expect(screen.queryByText('전자기기')).not.toBeInTheDocument()
  })

  it('renders the view sheet without a details list, summary or status when none is given', async () => {
    const user = userEvent.setup()
    renderRowActions({ label: '상품 A' })

    const sheet = await openSheet(user)

    expect(
      within(sheet).getByRole('heading', { name: '상품 A' }),
    ).toBeInTheDocument()
    // 예전의 일반 문구 대신, 요약이 없으면 요약 줄을 그리지 않는다.
    expect(
      screen.queryByText('간단한 정보를 확인하세요.'),
    ).not.toBeInTheDocument()
    expect(sheet).not.toHaveAttribute('aria-describedby')
    expect(sheet.querySelector('dl')).toBeNull()
    expect(sheet.querySelector('[data-slot="row-status"]')).toBeNull()
  })

  it('shows the summary, status badge and a definition list row per detail', async () => {
    const user = userEvent.setup()
    renderRowActions({
      label: '상품 A',
      summary: '전자기기 · 가격 128,000원',
      status: { label: '판매중', tone: 'success' },
      details: [
        { label: '카테고리', value: '전자기기' },
        { label: '재고', value: 12 },
        { label: '상태', value: '판매중' },
      ],
    })

    const sheet = await openSheet(user)

    expect(sheet).toHaveAccessibleDescription('전자기기 · 가격 128,000원')
    // 헤더: 제목 첫 글자 원형(장식) + 상태 배지
    expect(sheet.querySelector('[aria-hidden="true"]')).toHaveTextContent('상')
    const badge = sheet.querySelector('[data-slot="row-status"]')
    expect(badge).toHaveTextContent('판매중')
    expect(badge?.querySelector('.bg-success')).not.toBeNull()

    const rows = sheet.querySelectorAll('dl > [data-slot="row-detail"]')
    expect(rows).toHaveLength(3)
    expect(
      Array.from(rows, (row) => [
        row.querySelector('dt')?.textContent,
        row.querySelector('dd')?.textContent,
      ]),
    ).toEqual([
      ['카테고리', '전자기기'],
      ['재고', '12'],
      ['상태', '판매중'],
    ])
    // 상태 줄의 값은 글자 대신 같은 배지로 보여준다.
    expect(rows[2].querySelector('[data-slot="row-status"]')).not.toBeNull()
    // 진입 모션이 끝나면 모든 줄이 보인다(테스트는 skipAnimations).
    await waitFor(() => {
      for (const row of rows) expect(row).toBeVisible()
    })
  })

  it('has 삭제, 닫기, 수정 in the sheet footer in that order', async () => {
    const user = userEvent.setup()
    renderRowActions({ label: '상품 A' })

    const sheet = await openSheet(user)
    const footer = sheet.querySelector(
      '[data-slot="sheet-footer"]',
    ) as HTMLElement

    expect(
      within(footer)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['삭제', '닫기', '수정'])
  })

  it('opens the same edit dialog from the sheet, closing the sheet first', async () => {
    const user = userEvent.setup()
    renderRowActions({
      label: '상품 A',
      details: [{ label: '재고', value: 12 }],
    })

    const sheet = await openSheet(user)
    await user.click(within(sheet).getByRole('button', { name: '수정' }))

    const input = await screen.findByLabelText('이름')
    expect(input).toHaveValue('상품 A')
    expect(input).toHaveFocus()
    expect(screen.queryByText('재고')).not.toBeInTheDocument()

    await user.clear(input)
    await user.type(input, '상품 B')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(toast.success).toHaveBeenCalledWith('상품 B(으)로 수정됐어요.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /상품 A 작업 열기/ }),
    ).toHaveFocus()
  })

  it('opens the same delete confirmation from the sheet', async () => {
    const user = userEvent.setup()
    renderRowActions({ label: '상품 A' })

    const sheet = await openSheet(user)
    await user.click(within(sheet).getByRole('button', { name: '삭제' }))

    const alert = await screen.findByRole('alertdialog')
    expect(
      within(alert).getByText('상품 A을(를) 삭제할까요?'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(within(alert).getByRole('button', { name: '삭제' }))

    expect(toast.success).toHaveBeenCalledWith('상품 A 삭제됐어요.')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('closes the sheet with Escape and returns focus to the row trigger', async () => {
    const user = userEvent.setup()
    renderRowActions({ label: '상품 A' })

    await openSheet(user)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /상품 A 작업 열기/ }),
    ).toHaveFocus()
  })

  it('edits and saves via the dialog, toasting success and closing', async () => {
    const user = userEvent.setup()
    render(<RowActions label="상품 A" />)

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))
    await user.click(screen.getByRole('menuitem', { name: '수정' }))

    const input = await screen.findByLabelText('이름')
    expect(input).toHaveValue('상품 A')

    await user.clear(input)
    await user.type(input, '상품 B')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(toast.success).toHaveBeenCalledWith('상품 B(으)로 수정됐어요.')

    // 다이얼로그가 닫혀야 한다
    expect(screen.queryByLabelText('이름')).not.toBeInTheDocument()
  })

  it('confirms delete via the alert dialog and toasts success', async () => {
    const user = userEvent.setup()
    render(<RowActions label="상품 A" />)

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))
    await user.click(screen.getByRole('menuitem', { name: '삭제' }))

    expect(
      await screen.findByText('상품 A을(를) 삭제할까요?'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(toast.success).toHaveBeenCalledWith('상품 A 삭제됐어요.')
  })
})
