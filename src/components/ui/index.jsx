export function Icon({ name, filled, className = '' }) {
  return <span className={`ms ${filled ? 'filled' : ''} ${className}`}>{name}</span>
}

export function Avatar({ src, size = 10, ring = false }) {
  return (
    <img
      src={src || 'https://i.pravatar.cc/80?u=x'}
      className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 ${ring ? 'ring-2 ring-primary ring-offset-1' : ''}`}
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
