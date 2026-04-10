import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'

export default function ChatbotPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
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

  function handleSend(text) {
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        role: 'user',
        text,
        senderName: 'You',
        createdAt: Date.now(),
      },
    ])
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">Chatbot</h1>
            <p className="truncate text-xs text-slate-500">Demo UI — connect your logic here</p>
          </div>
          <Link to="/users" className="shrink-0 text-xs font-medium text-sky-700 hover:underline">
            Users
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No messages yet. Say hello below.</p>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={false}
        placeholder="Write a message…"
      />
    </div>
  )
}
