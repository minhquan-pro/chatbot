import { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { routes } from '@/config/routes'

function RoutesView() {
  return useRoutes(routes)
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
            Loading…
          </div>
        }
      >
        <RoutesView />
      </Suspense>
    </BrowserRouter>
  )
}
