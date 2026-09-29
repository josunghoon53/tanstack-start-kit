import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { CONTENTS } from '@/config/contents'
import type { ContentItem } from '@/config/contents'
import { authMiddleware } from './auth-middleware'

export const getContentsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<ContentItem>> => CONTENTS)

export const contentsQueryOptions = () =>
  queryOptions({
    queryKey: ['contents'],
    queryFn: () => getContentsFn(),
  })
