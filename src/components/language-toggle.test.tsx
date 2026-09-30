import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { LanguageToggle } from './language-toggle'
import { useLocaleStore } from '@/i18n/locale-store'

describe('LanguageToggle', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('shows the current locale label', () => {
    render(<LanguageToggle />)

    expect(screen.getByRole('button', { name: /english/i })).toHaveTextContent(
      '한국어',
    )
  })

  it('switches the locale store to en on click', async () => {
    const user = userEvent.setup()
    render(<LanguageToggle />)

    await user.click(screen.getByRole('button'))

    expect(useLocaleStore.getState().locale).toBe('en')
  })

  it('toggles back to ko on a second click', async () => {
    const user = userEvent.setup()
    render(<LanguageToggle />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button'))

    expect(useLocaleStore.getState().locale).toBe('ko')
  })
})
