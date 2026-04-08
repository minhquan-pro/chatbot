function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function MessageList({ messages }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-4">
      {messages.map((msg, index) => {
        const prev = messages[index - 1]
        const showMeta =
          index === 0 || !prev || prev.role !== msg.role
        const isUser = msg.role === 'user'

        return (
          <div
            key={msg.id}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[min(85%,28rem)] flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {showMeta ? (
                <div
                  className={`mb-1 flex items-baseline gap-2 px-1 text-xs text-slate-500 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <span className="font-medium text-slate-600">
                    {msg.senderName}
                  </span>
                  <span>{formatTime(msg.createdAt)}</span>
                </div>
              ) : null}
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isUser
                    ? 'rounded-br-md bg-sky-600 text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
