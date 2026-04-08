import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
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

function mapApiMessage(m, myId) {
  return {
    id: m.id,
    role: m.senderId === myId ? 'user' : 'assistant',
    text: m.content,
    senderName: m.sender?.email ?? 'Unknown',
    createdAt: new Date(m.createdAt).getTime(),
  }
}

export default function ChatPage() {
  const { conversationId } = useParams()
  const { user: me, loading: authLoading } = useAuthUser()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [peerEmail, setPeerEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
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
    if (!conversationId || !me) return
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const [convRes, msgRes] = await Promise.all([
          api.get(API_ENDPOINTS.conversations.list),
          api.get(API_ENDPOINTS.conversations.messages(conversationId)),
        ])
        if (cancelled) return
        const list = Array.isArray(convRes.data) ? convRes.data : []
        const row = list.find((c) => c.id === conversationId)
        if (row?.peer?.email) {
          setPeerEmail(row.peer.email)
        }
        const raw = Array.isArray(msgRes.data) ? msgRes.data : []
        setMessages(raw.map((m) => mapApiMessage(m, me.id)))
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conversationId, me])

  async function handleSend(text) {
    if (!conversationId || !me) return
    setError('')
    setSending(true)
    const optimistic = {
      id: `temp-${Date.now()}`,
      role: 'user',
      text,
      senderName: me.email,
      createdAt: Date.now(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')
    try {
      const { data } = await api.post(API_ENDPOINTS.conversations.messages(conversationId), {
        content: text,
      })
      const mapped = mapApiMessage(data, me.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? mapped : m)),
      )
    } catch (err) {
      setError(getErrorMessage(err))
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
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
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">Messages</h1>
            {peerEmail ? (
              <p className="truncate text-xs text-slate-500" title={peerEmail}>
                With {peerEmail}
              </p>
            ) : loading ? (
              <p className="text-xs text-slate-400">Loading…</p>
            ) : null}
          </div>
          <Link
            to="/users"
            className="shrink-0 text-xs font-medium text-sky-700 hover:underline"
          >
            Users
          </Link>
        </div>
      </div>

      {error ? (
        <p className="shrink-0 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading messages…</p>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending || loading || !conversationId}
        placeholder="Write a message…"
      />
    </div>
  )
}
