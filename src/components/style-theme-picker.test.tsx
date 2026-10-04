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

    for (const name of ['Graphite', 'Warm Paper', 'Editorial', 'Nordic']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`^${name}`) }),
      ).toBeInTheDocument()
    }
    expect(
      screen.getByText('크림 톤에 둥근 폰트와 바탕체 제목'),
    ).toBeInTheDocument()
  })

  it('marks Graphite as selected when nothing is stored', () => {
    render(<StyleThemePicker />)

    expect(
      screen.getByRole('button', { name: /^Graphite/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies and stores the chosen style', async () => {
    const user = userEvent.setup()
    render(<StyleThemePicker />)

    await user.click(screen.getByRole('button', { name: /^Warm Paper/ }))

    expect(document.documentElement).toHaveAttribute('data-style', 'warm')
    expect(window.localStorage.getItem('theme-style')).toBe('warm')
    expect(
      screen.getByRole('button', { name: /^Warm Paper/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('restores a stored style and falls back to Graphite for invalid values', () => {
    window.localStorage.setItem('theme-style', 'nordic')
    const { unmount } = render(<StyleThemePicker />)
    expect(
      screen.getByRole('button', { name: /^Nordic/ }),
    ).toHaveAttribute('aria-pressed', 'true')
    unmount()

    window.localStorage.setItem('theme-style', 'bogus')
    render(<StyleThemePicker />)
    expect(
      screen.getByRole('button', { name: /^Graphite/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
