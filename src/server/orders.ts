import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { ORDERS } from '@/config/orders'
import type { OrderItem } from '@/config/orders'
import { authMiddleware } from './auth-middleware'

// 지금은 config/orders.ts의 인메모리 배열을 반환하지만, 클라이언트 입장에서는
// createServerFn을 통해 실제 서버 왕복을 거쳐 데이터를 받는다. 나중에 DB를 붙일 때는
// 이 핸들러 내부만 실제 쿼리로 바꾸면 되고, 라우트/컴포넌트 쪽 코드는 그대로 둘 수 있다.
export const getOrdersFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<OrderItem>> => ORDERS)

export const ordersQueryOptions = () =>
  queryOptions({
    queryKey: ['orders'],
    queryFn: () => getOrdersFn(),
  })
