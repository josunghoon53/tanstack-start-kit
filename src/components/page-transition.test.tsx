import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageTransition } from './page-transition'
import { MotionProvider } from '@/lib/motion'

function renderApp() {
  const rootRoute = createRootRoute({
    component: () => (
      <MotionProvider>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </MotionProvider>
    ),
  })
  const routes = ['/orders', '/users'].map((path) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path,
      component: () => <p>page {path}</p>,
    }),
  )
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: ['/orders'] }),
  })
  render(<RouterProvider router={router} />)
  return router
}

function wrapperOf(text: string) {
  return screen.getByText(text).closest('[data-page-transition]')
}

describe('PageTransition', () => {
  it('renders the routed children inside a flex-1 column wrapper', async () => {
    renderApp()

    expect(await screen.findByText('page /orders')).toBeInTheDocument()
    const wrapper = wrapperOf('page /orders')
    expect(wrapper).toHaveAttribute('data-page-transition', '/orders')
    expect(wrapper).toHaveClass('flex', 'flex-1', 'flex-col', 'gap-4')
  })

  it('remounts the wrapper with a new key when the path changes', async () => {
    const router = renderApp()
    await screen.findByText('page /orders')
    const first = wrapperOf('page /orders')

    await act(() => router.navigate({ to: '/users' }))

    expect(await screen.findByText('page /users')).toBeInTheDocument()
    const second = wrapperOf('page /users')
    expect(second).toHaveAttribute('data-page-transition', '/users')
    expect(second).not.toBe(first)
    expect(first).not.toBeInTheDocument()
  })
})
