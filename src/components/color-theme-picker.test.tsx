import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ColorThemePicker } from './color-theme-picker'
import { useLocaleStore } from '@/i18n/locale-store'

const KO_NAMES = [
  '톡톡 튀는 스타일',
  '선명한 레드 포인트',
  '몽환적인 분위기',
  '차분한 자연의 감성',
  '강렬한 에너지',
  '경쾌한 팝 컬러',
  '달콤한 즐거움',
  '포근한 달콤함',
  '경쾌한 레트로',
  '편안한 휴식',
  '부드러운 우아함',
  '맑고 깨끗한 분위기',
]

beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' })
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-color')
})

describe('ColorThemePicker', () => {
  it('renders a radio group with the default and the 12 palettes', () => {
    render(<ColorThemePicker />)

    expect(
      screen.getByRole('radiogroup', { name: '컬러 팔레트' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(13)
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

    for (const label of ['Default (neutral)', 'Pop', 'Pop · Red accent']) {
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

    await user.click(screen.getByRole('radio', { name: '차분한 자연의 감성' }))

    expect(document.documentElement).toHaveAttribute('data-color', 'nature')
    expect(window.localStorage.getItem('theme-color')).toBe('nature')
    expect(
      screen.getByRole('radio', { name: '차분한 자연의 감성' }),
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

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.documentElement).toHaveAttribute('data-color', 'clear')
  })

  it('clears the attribute and storage when the default is chosen again', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('radio', { name: '부드러운 우아함' }))
    await user.click(screen.getByRole('radio', { name: '기본(무채색)' }))

    expect(document.documentElement).not.toHaveAttribute('data-color')
    expect(window.localStorage.getItem('theme-color')).toBeNull()
  })

  it('restores a stored palette and treats legacy accent colors as the default', () => {
    window.localStorage.setItem('theme-color', 'retro')
    const { unmount } = render(<ColorThemePicker />)
    expect(
      screen.getByRole('radio', { name: '경쾌한 레트로' }),
    ).toHaveAttribute('aria-checked', 'true')
    unmount()

    window.localStorage.setItem('theme-color', 'blue')
    render(<ColorThemePicker />)
    expect(screen.getByRole('radio', { name: '기본(무채색)' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
