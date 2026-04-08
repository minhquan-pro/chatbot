import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearTokens } from '@/libs/authStorage'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'
import pusher from '@/libs/pusher'

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const USER_NAME = 'You'
const ASSISTANT_NAME = 'Assistant'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => [
    {
      id: nextId(),
      role: 'assistant',
      text: 'Hi — ask anything to try the layout.',
      senderName: ASSISTANT_NAME,
      createdAt: Date.now(),
    },
  ])
  const scrollRef = useRef(null)

  useEffect(() => {
    pusher.subscribe('chat-room').bind('message', (message) => {
      console.log(message);
      
    })
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  function handleSend(text) {
    const now = Date.now()
    const userMsg = {
      id: nextId(),
      role: 'user',
      text,
      senderName: USER_NAME,
      createdAt: now,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          text:
            'This is a placeholder reply. Connect your API to stream real answers.',
          senderName: ASSISTANT_NAME,
          createdAt: Date.now(),
        },
      ])
    }, 450)
  }

  function handleLogout() {
    clearTokens()
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-sm font-semibold text-slate-900">Chat</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/"
            className="text-slate-600 transition-colors hover:text-slate-900"
          >
            Home
          </Link>
          <Link
            to="/login"
            onClick={handleLogout}
            className="text-slate-600 transition-colors hover:text-slate-900"
          >
            Log out
          </Link>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <MessageList messages={messages} />
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder="Write a message…"
      />
    </div>
  )
}
