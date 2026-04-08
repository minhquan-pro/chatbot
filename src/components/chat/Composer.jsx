import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Message…',
}) {
  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-slate-200 bg-white p-3"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
        autoComplete="off"
      />
      <Button
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-[44px] min-w-[44px] shrink-0 px-3"
        aria-label="Send message"
      >
        <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
      </Button>
    </form>
  )
}
