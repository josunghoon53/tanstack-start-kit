import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { StyleThemePicker } from './style-theme-picker'
import { useLocaleStore } from '@/i18n/locale-store'

beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' })
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-style')
})

describe('StyleThemePicker', () => {
  it('renders the 4 styles with their descriptions', () => {
    render(<StyleThemePicker />)

    for (const name of ['Clean', 'Soft', 'Editorial', 'Crisp']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`^${name}`) }),
      ).toBeInTheDocument()
    }
    expect(
      screen.getByText('크게 둥근 카드와 부드러운 그림자, 둥근 글꼴'),
    ).toBeInTheDocument()
  })

  it('marks Clean as selected when nothing is stored', () => {
    render(<StyleThemePicker />)

    expect(screen.getByRole('button', { name: /^Clean/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('applies and stores the chosen style', async () => {
    const user = userEvent.setup()
    render(<StyleThemePicker />)

    await user.click(screen.getByRole('button', { name: /^Soft/ }))

    expect(document.documentElement).toHaveAttribute('data-style', 'soft')
    expect(window.localStorage.getItem('theme-style')).toBe('soft')
    expect(screen.getByRole('button', { name: /^Soft/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('restores a stored style and falls back to Clean for invalid values', () => {
    window.localStorage.setItem('theme-style', 'crisp')
    const { unmount } = render(<StyleThemePicker />)
    expect(screen.getByRole('button', { name: /^Crisp/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    unmount()

    window.localStorage.setItem('theme-style', 'bogus')
    render(<StyleThemePicker />)
    expect(screen.getByRole('button', { name: /^Clean/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('maps legacy stored styles to their new equivalents', () => {
    window.localStorage.setItem('theme-style', 'warm')
    const { unmount } = render(<StyleThemePicker />)
    expect(screen.getByRole('button', { name: /^Soft/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    unmount()

    window.localStorage.setItem('theme-style', 'graphite')
    render(<StyleThemePicker />)
    expect(screen.getByRole('button', { name: /^Clean/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
