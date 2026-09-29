import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { PRODUCTS } from '@/config/products'
import type { ProductItem } from '@/config/products'
import { authMiddleware } from './auth-middleware'

export const getProductsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<ProductItem>> => PRODUCTS)

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: ['products'],
    queryFn: () => getProductsFn(),
  })
