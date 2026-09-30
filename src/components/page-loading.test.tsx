import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PageLoading } from './page-loading'
import { useLocaleStore } from '@/i18n/locale-store'

describe('PageLoading', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('announces the loading state to assistive tech', () => {
    render(<PageLoading />)

    expect(
      screen.getByRole('status', { name: '페이지를 불러오는 중…' }),
    ).toBeInTheDocument()
  })
})
