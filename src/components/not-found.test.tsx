import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { NotFound } from './not-found'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'

describe('NotFound', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('renders the title and description', async () => {
    renderWithRouter(<NotFound />, {
      initialPath: '/not-found',
      extraPaths: ['/'],
    })

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for the title before asserting the rest.
    expect(
      await screen.findByText('아직 준비되지 않은 페이지예요'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '이 메뉴는 예시로만 등록돼 있고, 실제 화면은 아직 만들지 않았어요.',
      ),
    ).toBeInTheDocument()
  })

  it('renders a link back to the dashboard', async () => {
    renderWithRouter(<NotFound />, {
      initialPath: '/not-found',
      extraPaths: ['/'],
    })

    const link = await screen.findByRole('link', {
      name: '대시보드로 돌아가기',
    })
    expect(link).toHaveAttribute('href', '/')
  })
})
