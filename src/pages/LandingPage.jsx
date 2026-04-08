import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Demo chatbot
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in or open the chat workspace.
        </p>
        <nav className="mt-8 flex flex-col gap-3">
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
          <Link
            to="/chat"
            className="rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Chat
          </Link>
        </nav>
      </Card>
    </div>
  )
}
