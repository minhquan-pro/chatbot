import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { getAccessToken } from '@/libs/authStorage'

export default function LandingPage() {
  const signedIn = Boolean(getAccessToken())

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Direct messages
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Chat with other users — sign in to get started.
        </p>
        <nav className="mt-8 flex flex-col gap-3">
          {signedIn ? (
            <Link
              to="/users"
              className="rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Browse users
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </Card>
    </div>
  )
}
