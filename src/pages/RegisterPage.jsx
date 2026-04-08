import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/libs/api'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { setTokens } from '@/libs/authStorage'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthUser } from '@/hooks/useAuthUser'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d === 'string') return d
  if (d && typeof d === 'object') {
    if (typeof d.message === 'string') return d.message
    if (typeof d.detail === 'string') return d.detail
  }
  return err.message || 'Request failed'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { refresh } = useAuthUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post(
        API_ENDPOINTS.auth.register,
        { email, password },
        { skipAuth: true },
      )
      const body = res.data
      const access_token =
        body?.access_token ?? body?.access ?? body?.tokens?.access_token
      const refresh_token =
        body?.refresh_token ?? body?.refresh ?? body?.tokens?.refresh_token
      if (access_token) {
        setTokens({ access_token, refresh_token })
        await refresh()
        navigate('/users', { replace: true })
      } else {
        setError('Invalid response: missing tokens')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-lg font-semibold text-slate-900">Register</h1>
        <p className="mt-1 text-sm text-slate-600">Create an account.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sky-700 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}
