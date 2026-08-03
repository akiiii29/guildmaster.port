interface ProgressBarProps {
  value: number
  max: number
  tone?: 'hp' | 'mana' | 'brass'
  label?: string
}

export function ProgressBar({ value, max, tone = 'brass', label }: ProgressBarProps) {
  const width = max <= 0 ? 0 : Math.max(0, Math.min(100, value / max * 100))
  return (
    <div className={`progress progress-${tone}`} aria-label={label}>
      <span style={{ width: `${width}%` }} />
      {label && <em>{label}</em>}
    </div>
  )
}
