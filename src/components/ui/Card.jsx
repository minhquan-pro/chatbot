export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}
