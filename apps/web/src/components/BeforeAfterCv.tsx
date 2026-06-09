import type { ResumeJson } from '../lib/resumeSchema'
import { ResumePreview } from './ResumePreview'

export function BeforeAfterCv({ before, after }: { before: ResumeJson; after: ResumeJson }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Before</span>
          <span className="text-xs text-slate-400">Raw input</span>
        </div>
        <div className="origin-top scale-[0.92] md:scale-100">
          <ResumePreview resume={before} compact />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">After AI</span>
          <span className="text-xs text-emerald-600">ATS-optimized</span>
        </div>
        <div className="origin-top scale-[0.92] ring-2 ring-emerald-200/80 ring-offset-2 md:scale-100 rounded-xl">
          <ResumePreview resume={after} compact />
        </div>
      </div>
    </div>
  )
}
