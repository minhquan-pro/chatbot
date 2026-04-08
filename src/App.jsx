import { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { AuthUserProvider } from '@/contexts/AuthUserProvider'
import { routes } from '@/config/routes'

function RoutesView() {
  return useRoutes(routes)
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthUserProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
            Loading…
          </div>
        }
      >
        <RoutesView />
      </Suspense>
      </AuthUserProvider>
    </BrowserRouter>
  )
}
