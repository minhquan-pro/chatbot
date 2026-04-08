import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/libs/api'
import { API_ENDPOINTS } from '@/config/apiEndpoints'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d === 'string') return d
  if (d && typeof d === 'object' && typeof d.message === 'string') return d.message
  return err.message || 'Request failed'
}

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatting, setChatting] = useState(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get(API_ENDPOINTS.users.list)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleChat(peerUserId) {
    setChatting(peerUserId)
    setError('')
    try {
      const { data } = await api.get(API_ENDPOINTS.conversations.dm(peerUserId))
      const id = data?.id
      if (id) {
        navigate(`/chat/${id}`)
      } else {
        setError('Invalid conversation response')
      }
    } catch (err) {
      if (err.response?.status === 404) {
        navigate(`/newchat?userId=${encodeURIComponent(peerUserId)}`)
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setChatting(null)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Start a direct message with someone.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading…</p>
        ) : users.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No other users yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="truncate text-slate-800">{u.email}</span>
                <button
                  type="button"
                  disabled={chatting === u.id}
                  onClick={() => handleChat(u.id)}
                  className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
                >
                  {chatting === u.id ? '…' : 'Chat'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
