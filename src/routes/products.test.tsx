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
})
