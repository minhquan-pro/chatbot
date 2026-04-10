import ReactMarkdown from "react-markdown";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const mdComponents = {
  p: ({ children }) => (
    <p className="mb-2 text-[0.9375rem] leading-relaxed first:mt-0 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1.5 pl-4 first:mt-0 last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-4 first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-sky-700 underline decoration-sky-400/70 underline-offset-2 hover:text-sky-800"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-slate-400/60 pl-3 text-slate-700 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          className="rounded bg-slate-300/80 px-1 py-0.5 font-mono text-[0.85em] text-slate-900"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-slate-300/50 p-2 text-xs">{children}</pre>
  ),
};

function AssistantContent({ text }) {
  return (
    <div className="markdown-body text-slate-800 **:wrap-break-word">
      <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>
    </div>
  );
}

export function MessageList({ messages }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-4">
      {messages.map((msg, index) => {
        const prev = messages[index - 1];
        const showMeta = index === 0 || !prev || prev.role !== msg.role;
        const isUser = msg.role === "user";
        const name = isUser ? "Bạn" : "Chuyên viên tư vấn";

        return (
          <div
            key={msg.id || `user-${index}`}
            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[min(85%,28rem)] flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {showMeta ? (
                <div
                  className={`mb-1 flex items-baseline gap-2 px-1 text-xs text-slate-500 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <span className="font-medium text-slate-600">{name}</span>
                  <span>{formatTime(msg.createdAt)}</span>
                </div>
              ) : null}
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isUser
                    ? "rounded-br-md bg-sky-600 whitespace-pre-wrap text-white"
                    : "rounded-bl-md bg-slate-200 text-slate-800"
                }`}
              >
                {isUser ? (
                  msg.content
                ) : (
                  <AssistantContent text={msg.content ?? ""} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
