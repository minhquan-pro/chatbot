import { Link, Outlet } from 'react-router-dom'
import { clearTokens, getAccessToken } from '@/libs/authStorage'
import { useAuthUser } from '@/hooks/useAuthUser'

export function AppLayout() {
  const { user, loading } = useAuthUser()
  const signedIn = Boolean(getAccessToken())

  function handleLogout() {
    clearTokens()
    window.location.assign('/login')
  }

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-slate-900">
            Chat
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <Link to="/" className="transition-colors hover:text-slate-900">
              Home
            </Link>
            {signedIn ? (
              <>
                <Link to="/users" className="transition-colors hover:text-slate-900">
                  Users
                </Link>
                <Link to="/chatbot" className="transition-colors hover:text-slate-900">
                  Chatbot
                </Link>
                <Link to="/agent" className="transition-colors hover:text-slate-900">
                  Agent
                </Link>
              </>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {loading && signedIn ? (
            <span className="text-slate-400">…</span>
          ) : user ? (
            <span className="max-w-[12rem] truncate text-slate-600" title={user.email}>
              {user.email}
            </span>
          ) : null}
          {signedIn ? (
            <Link
              to="/login"
              onClick={handleLogout}
              className="text-slate-600 transition-colors hover:text-slate-900"
            >
              Log out
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-600 transition-colors hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-white transition-colors hover:bg-slate-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
