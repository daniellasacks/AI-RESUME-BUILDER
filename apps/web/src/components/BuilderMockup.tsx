/** Marketing mockup of the split-screen builder */
export function BuilderMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-300" />
        <span className="size-2.5 rounded-full bg-amber-300" />
        <span className="size-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[10px] text-slate-400">AI Career Profile Builder</span>
      </div>
      <div className="grid md:grid-cols-[140px_1fr]">
        <div className="space-y-2 border-r border-slate-100 bg-slate-50/80 p-3">
          <div className="rounded-lg bg-blue-600 px-2 py-1.5 text-center text-[9px] font-bold text-white">Optimize for job</div>
          <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px] text-slate-500">Improve writing</div>
          <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px] text-slate-500">ATS score · 87</div>
        </div>
        <div className="bg-slate-100/50 p-4">
          <div className="mx-auto max-w-[180px] rounded border border-slate-200 bg-white p-3 shadow-sm">
            <div className="h-1.5 w-16 rounded bg-slate-800" />
            <div className="mt-1 h-1 w-24 rounded bg-slate-300" />
            <div className="mt-3 space-y-1">
              <div className="h-1 w-full rounded bg-slate-100" />
              <div className="h-1 w-11/12 rounded bg-slate-100" />
              <div className="h-1 w-10/12 rounded bg-emerald-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
