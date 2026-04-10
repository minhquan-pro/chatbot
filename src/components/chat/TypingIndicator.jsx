export function TypingIndicator({ assistantName }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${assistantName} đang trả lời`}
      className="shrink-0 border-t border-sky-200 bg-gradient-to-r from-sky-100 via-sky-50 to-white px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]"
    >
      <div className="mx-auto flex max-w-[min(100%,28rem)] items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white shadow-sm ring-2 ring-sky-200"
          aria-hidden
        >
          QA
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sky-900">
            {assistantName} đang trả lời
          </p>
          <p className="mt-0.5 text-xs text-sky-700/90">
            Vui lòng chờ trong giây lát…
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1" aria-hidden>
          <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500" />
        </span>
      </div>
    </div>
  );
}
