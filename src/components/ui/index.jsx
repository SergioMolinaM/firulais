export function Icon({ name, filled, className = '' }) {
  return <span className={`ms ${filled ? 'filled' : ''} ${className}`}>{name}</span>
}

export function Avatar({ src, size = 10, ring = false }) {
  const base = `w-${size} h-${size} rounded-full flex-shrink-0 ${ring ? 'ring-2 ring-primary ring-offset-1' : ''}`
  if (!src) {
    return (
      <div className={`${base} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
        <span className="ms text-gray-400 dark:text-gray-500" style={{ fontSize: '55%' }}>person</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      onError={e => {
        e.currentTarget.onerror = null
        e.currentTarget.style.display = 'none'
        const ph = document.createElement('div')
        ph.className = e.currentTarget.className.replace('rounded-full object-cover', 'rounded-full bg-gray-200 flex items-center justify-center')
        e.currentTarget.parentNode?.insertBefore(ph, e.currentTarget)
      }}
      className={`${base} object-cover`}
      alt=""
    />
  )
}

export function Stars({ n }) {
  return (
    <span className="text-amber-400 text-xs font-bold">
      {'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))} {n}
    </span>
  )
}
