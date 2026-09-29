import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { NOTIFICATIONS } from '@/config/notifications'
import type { NotificationItem } from '@/config/notifications'
import { authMiddleware } from './auth-middleware'

export const getNotificationsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<NotificationItem>> => NOTIFICATIONS)

export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: ['notifications'],
    queryFn: () => getNotificationsFn(),
  })
