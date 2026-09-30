import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { ProductItem } from '@/config/products'

const MOCK_PRODUCTS: Array<ProductItem> = [
  {
    name: '무선 마우스',
    category: '전자기기',
    stock: 42,
    price: '25,000원',
    status: '판매중',
  },
  {
    name: '캠핑 의자',
    category: '레저',
    stock: 0,
    price: '45,000원',
    status: '품절',
  },
  {
    name: '핸드드립 세트',
    category: '리빙',
    stock: 8,
    price: '32,000원',
    status: '판매중',
  },
]

vi.mock('@/server/products', () => ({
  productsQueryOptions: () => ({
    queryKey: ['products'],
    queryFn: async () => MOCK_PRODUCTS,
  }),
}))

const { Route } = await import('@/routes/products')
const Products = Route.options.component as () => React.ReactElement

const t = messages.ko

describe('Products route', () => {
  it('renders columns and rows for every mocked product', async () => {
    renderWithQueryClient(<Products />)

    await screen.findByText('무선 마우스')

    expect(
      screen.getByRole('columnheader', { name: t.products.columns.name }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.products.columns.category }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.products.columns.stock }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.products.columns.price }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.products.columns.status }),
    ).toBeInTheDocument()

    for (const product of MOCK_PRODUCTS) {
      expect(screen.getByText(product.name)).toBeInTheDocument()
      expect(screen.getByText(product.category)).toBeInTheDocument()
    }
  })

  it('renders pagination and row actions per row', async () => {
    renderWithQueryClient(<Products />)

    await screen.findByText('무선 마우스')

    expect(screen.getByText(t.common.totalCount(3))).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /작업 열기/ })).toHaveLength(
      MOCK_PRODUCTS.length,
    )
  })

  it('filters rows by product name or category via the search input', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Products />)

    await screen.findByText('무선 마우스')

    const search = screen.getByPlaceholderText(t.products.searchPlaceholder)
    await user.type(search, '캠핑')

    expect(screen.queryByText('무선 마우스')).not.toBeInTheDocument()
    expect(screen.getByText('캠핑 의자')).toBeInTheDocument()
    expect(screen.queryByText('핸드드립 세트')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches the search query', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Products />)

    await screen.findByText('무선 마우스')

    const search = screen.getByPlaceholderText(t.products.searchPlaceholder)
    await user.type(search, '존재하지않는검색어')

    expect(await screen.findByText(t.common.noResults)).toBeInTheDocument()
  })

  it('filters rows by one or more categories via the multi-select filter', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Products />)

    await screen.findByText('무선 마우스')

    // "카테고리"라는 이름의 버튼이 둘 있다(다중선택 필터 트리거 + 정렬 헤더) —
    // 필터 트리거가 테이블보다 먼저 렌더링되므로 첫 번째 것을 고른다.
    const [categoryFilterTrigger] = screen.getAllByRole('button', {
      name: t.products.columns.category,
    })
    await user.click(categoryFilterTrigger)
    await user.click(screen.getByRole('menuitemcheckbox', { name: '전자기기' }))

    expect(screen.getByText('무선 마우스')).toBeInTheDocument()
    expect(screen.queryByText('캠핑 의자')).not.toBeInTheDocument()
    expect(screen.queryByText('핸드드립 세트')).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitemcheckbox', { name: '리빙' }))

    expect(screen.getByText('무선 마우스')).toBeInTheDocument()
    expect(screen.getByText('핸드드립 세트')).toBeInTheDocument()
    expect(screen.queryByText('캠핑 의자')).not.toBeInTheDocument()
  })

  it('filters rows by status via the status select', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Products />)

    await screen.findByText('무선 마우스')

    await user.click(
      screen.getByRole('combobox', { name: t.products.columns.status }),
    )
    await user.click(await screen.findByRole('option', { name: '품절' }))

    expect(screen.queryByText('무선 마우스')).not.toBeInTheDocument()
    expect(screen.getByText('캠핑 의자')).toBeInTheDocument()
  })
})
