import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { USERS } from '@/config/users'
import type { UserItem } from '@/config/users'
import { authMiddleware } from './auth-middleware'

export const getUsersFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<UserItem>> => USERS)

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: ['users'],
    queryFn: () => getUsersFn(),
  })
