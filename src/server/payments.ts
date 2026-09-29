import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { PAYMENTS } from '@/config/payments'
import type { PaymentItem } from '@/config/payments'
import { authMiddleware } from './auth-middleware'

export const getPaymentsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<PaymentItem>> => PAYMENTS)

export const paymentsQueryOptions = () =>
  queryOptions({
    queryKey: ['payments'],
    queryFn: () => getPaymentsFn(),
  })
