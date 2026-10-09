import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ColorThemePicker } from './color-theme-picker'
import { useLocaleStore } from '@/i18n/locale-store'

const KO_NAMES = [
  '톡톡 튀는 스타일',
  '선명한 레드 포인트',
  '네이비 옐로',
  '바이올렛 라임',
  '차콜 오렌지',
]

// 지금은 없는 예전 프리셋 id. 저장돼 있으면 기본(무채색)으로 돌아가야 한다.
const REMOVED_PRESETS = [
  'dreamy',
  'nature',
  'energy',
  'pop-color',
  'sweet',
  'cozy',
  'retro',
  'rest',
  'elegant',
  'clear',
]

beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' })
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-color')
})

describe('ColorThemePicker', () => {
  it('renders a radio group with the default and every palette', () => {
    render(<ColorThemePicker />)

    expect(
      screen.getByRole('radiogroup', { name: '컬러 팔레트' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(KO_NAMES.length + 1)
    for (const label of ['기본(무채색)', ...KO_NAMES]) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })

  it('shows the three role swatches on each card', () => {
    render(<ColorThemePicker />)

    const card = screen.getByRole('radio', { name: '톡톡 튀는 스타일' })
    expect(card.querySelector('[title="주색"]')).toHaveStyle({
      background: '#003FE2',
    })
    expect(card.querySelector('[title="포인트"]')).toHaveStyle({
      background: '#D6FC43',
    })
    expect(card.querySelector('[title="옅은 색"]')).toHaveStyle({
      background: '#F6F4F0',
    })
  })

  it('uses English names in the en locale', () => {
    useLocaleStore.setState({ locale: 'en' })
    render(<ColorThemePicker />)

    for (const label of [
      'Default (neutral)',
      'Pop',
      'Pop · Red accent',
      'Navy Yellow',
      'Violet Lime',
      'Charcoal Orange',
    ]) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })

  it('marks the default as checked when nothing is stored', () => {
    render(<ColorThemePicker />)

    expect(screen.getByRole('radio', { name: '기본(무채색)' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('applies and stores the chosen palette', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('radio', { name: '선명한 레드 포인트' }))

    expect(document.documentElement).toHaveAttribute('data-color', 'pop-red')
    expect(window.localStorage.getItem('theme-color')).toBe('pop-red')
    expect(
      screen.getByRole('radio', { name: '선명한 레드 포인트' }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('moves the selection with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    screen.getByRole('radio', { name: '기본(무채색)' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(document.documentElement).toHaveAttribute('data-color', 'pop')
    expect(
      screen.getByRole('radio', { name: '톡톡 튀는 스타일' }),
    ).toHaveFocus()

    // 처음(기본)에서 왼쪽으로 가면 마지막 프리셋으로 돈다.
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.documentElement).toHaveAttribute(
      'data-color',
      'charcoal-orange',
    )
  })

  it('clears the attribute and storage when the default is chosen again', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('radio', { name: '톡톡 튀는 스타일' }))
    await user.click(screen.getByRole('radio', { name: '기본(무채색)' }))

    expect(document.documentElement).not.toHaveAttribute('data-color')
    expect(window.localStorage.getItem('theme-color')).toBeNull()
  })

  it('restores a stored palette and treats legacy accent colors as the default', () => {
    window.localStorage.setItem('theme-color', 'pop-red')
    const { unmount } = render(<ColorThemePicker />)
    expect(
      screen.getByRole('radio', { name: '선명한 레드 포인트' }),
    ).toHaveAttribute('aria-checked', 'true')
    unmount()

    window.localStorage.setItem('theme-color', 'blue')
    render(<ColorThemePicker />)
    expect(screen.getByRole('radio', { name: '기본(무채색)' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
  it.each(REMOVED_PRESETS)(
    'treats the removed preset %s as the default',
    (removed) => {
      window.localStorage.setItem('theme-color', removed)
      render(<ColorThemePicker />)
      expect(
        screen.getByRole('radio', { name: '기본(무채색)' }),
      ).toHaveAttribute('aria-checked', 'true')
      expect(screen.queryAllByRole('radio', { checked: true })).toHaveLength(1)
    },
  )
})
