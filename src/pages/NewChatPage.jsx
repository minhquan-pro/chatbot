import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { getAccessToken } from '@/libs/authStorage'
import api from '@/libs/api'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'
import { useAuthUser } from '@/hooks/useAuthUser'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d === 'string') return d
  if (d && typeof d === 'object' && typeof d.message === 'string') return d.message
  return err.message || 'Request failed'
}

export default function NewChatPage() {
  const [searchParams] = useSearchParams()
  const peerUserId = searchParams.get('userId')
  const navigate = useNavigate()
  const { user: me, loading: authLoading } = useAuthUser()

  const [peerEmail, setPeerEmail] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  }, [])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!peerUserId) {
      setError('Missing userId')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.users.list)
        const list = Array.isArray(data) ? data : []
        const peer = list.find((u) => u.id === peerUserId)
        if (!cancelled) {
          if (peer) setPeerEmail(peer.email)
          else setError('User not found in directory')
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [peerUserId])

  async function handleSend(text) {
    if (!peerUserId || !me) return
    setError('')
    const optimistic = {
      id: `temp-${Date.now()}`,
      role: 'user',
      text,
      senderName: me.email,
      createdAt: Date.now(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')
    setSending(true)
    try {
      const { data } = await api.post(API_ENDPOINTS.conversations.dmMessages(peerUserId), {
        content: text,
      })
      const convId = data?.conversationId
      if (convId) {
        navigate(`/chat/${convId}`, { replace: true })
      } else {
        setError('Invalid response')
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      }
    } catch (err) {
      setError(getErrorMessage(err))
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  if (!peerUserId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-slate-600">Missing <code>userId</code> in the URL.</p>
        <Link to="/users" className="text-sm font-medium text-sky-700 hover:underline">
          Back to users
        </Link>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    )
  }

  if (!me) {
    if (!getAccessToken()) {
      return <Navigate to="/login" replace />
    }
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-red-600">
        <p>Could not load your profile.</p>
        <Link to="/login" className="font-medium text-sky-700 hover:underline">
          Sign in again
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-sm font-semibold text-slate-900">New chat</h1>
        <p className="mt-0.5 truncate text-xs text-slate-500" title={peerEmail || peerUserId}>
          {peerEmail ? `With ${peerEmail}` : 'Loading…'}
        </p>
      </div>

      {error ? (
        <p className="shrink-0 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending || !peerEmail}
        placeholder="Write a message…"
      />
    </div>
  )
}
