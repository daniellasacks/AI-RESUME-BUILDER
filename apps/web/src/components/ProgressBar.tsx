export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-[#6b7280]">
        <span>
          Step {current + 1} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#e5e7eb]">
        <div className="h-full rounded-full bg-[#2563eb] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
