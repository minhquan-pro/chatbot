export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary:
      'bg-slate-800 text-white hover:bg-slate-700 focus-visible:outline-slate-800',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-slate-400',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
