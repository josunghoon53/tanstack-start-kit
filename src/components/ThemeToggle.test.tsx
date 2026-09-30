import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import ThemeToggle from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to Auto when no theme is stored', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button')).toHaveTextContent('Auto')
  })

  it('cycles light -> dark -> auto -> light on click, persisting each mode', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button')

    // 최초 상태는 auto. 1번째 클릭 -> light
    await user.click(button)
    expect(button).toHaveTextContent('Light')
    expect(window.localStorage.getItem('theme')).toBe('light')

    // 2번째 클릭 -> dark
    await user.click(button)
    expect(button).toHaveTextContent('Dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')

    // 3번째 클릭 -> auto
    await user.click(button)
    expect(button).toHaveTextContent('Auto')
    expect(window.localStorage.getItem('theme')).toBe('auto')

    // 4번째 클릭 -> light (한 바퀴 순환 확인)
    await user.click(button)
    expect(button).toHaveTextContent('Light')
    expect(window.localStorage.getItem('theme')).toBe('light')
  })
})
