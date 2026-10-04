import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ColorThemePicker } from './color-theme-picker'
import { useLocaleStore } from '@/i18n/locale-store'

beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' })
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-color')
})

describe('ColorThemePicker', () => {
  it('renders the default option and 5 colors', () => {
    render(<ColorThemePicker />)

    for (const label of ['기본', '블루', '그린', '퍼플', '로즈', '오렌지']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('marks 기본 as selected when nothing is stored', () => {
    render(<ColorThemePicker />)

    expect(screen.getByRole('button', { name: '기본' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('applies and stores the chosen color', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('button', { name: '그린' }))

    expect(document.documentElement).toHaveAttribute('data-color', 'green')
    expect(window.localStorage.getItem('theme-color')).toBe('green')
    expect(screen.getByRole('button', { name: '그린' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('clears the attribute and storage when 기본 is chosen again', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('button', { name: '로즈' }))
    await user.click(screen.getByRole('button', { name: '기본' }))

    expect(document.documentElement).not.toHaveAttribute('data-color')
    expect(window.localStorage.getItem('theme-color')).toBeNull()
  })

  it('restores a stored color and treats the legacy slate value as 기본', () => {
    window.localStorage.setItem('theme-color', 'purple')
    const { unmount } = render(<ColorThemePicker />)
    expect(screen.getByRole('button', { name: '퍼플' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    unmount()

    window.localStorage.setItem('theme-color', 'slate')
    render(<ColorThemePicker />)
    expect(screen.getByRole('button', { name: '기본' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
