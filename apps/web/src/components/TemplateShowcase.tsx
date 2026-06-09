/** Decorative stacked CV mockups — inspired by template-picker hero visuals */
export function TemplateShowcase() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[480px]">
      {/* Back — classic */}
      <div
        className="absolute left-4 top-10 w-[72%] rotate-[-6deg] rounded-md bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
        aria-hidden
      >
        <div className="border-b border-zinc-200 pb-3 text-center">
          <div className="text-sm font-bold text-zinc-900">Sarah Cohen</div>
          <div className="text-[10px] text-zinc-500">Product Manager</div>
        </div>
        <div className="mt-3 space-y-2 text-[9px] text-zinc-600">
          <p className="font-semibold text-zinc-800">Experience</p>
          <p>Led cross-functional teams · Shipped 3 major releases</p>
          <p className="font-semibold text-zinc-800">Education</p>
          <p>B.A. Business Administration</p>
        </div>
      </div>

      {/* Middle — burgundy sidebar */}
      <div
        className="absolute right-2 top-16 w-[68%] rotate-[4deg] rounded-md bg-white shadow-[0_24px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
        aria-hidden
      >
        <div className="flex min-h-[280px]">
          <div className="flex-1 p-4 text-[9px] text-zinc-600">
            <p className="text-[11px] font-bold text-zinc-900">Daniel Levy</p>
            <p className="mt-2 font-semibold text-zinc-800">Summary</p>
            <p className="mt-1 leading-relaxed">Operations leader with 8+ years in logistics and team management.</p>
            <p className="mt-3 font-semibold text-zinc-800">Experience</p>
            <p className="mt-1">Operations Manager — Global Freight Co.</p>
          </div>
          <div className="w-[32%] bg-[#8b2942] p-3 text-white">
            <div className="mx-auto mb-2 size-10 rounded-full bg-white/20" />
            <p className="text-center text-[8px] font-semibold">Contact</p>
            <p className="mt-2 text-[7px] leading-relaxed text-white/80">tel · email · city</p>
            <p className="mt-4 text-[8px] font-semibold">Skills</p>
            <div className="mt-1 space-y-0.5 text-[7px] text-white/85">Excel · SAP · Leadership</div>
          </div>
        </div>
      </div>

      {/* Front — modern green sidebar */}
      <div className="absolute bottom-0 left-[12%] w-[78%] rounded-md bg-white shadow-[0_28px_70px_rgba(0,0,0,0.16)] ring-1 ring-black/5">
        <div className="flex min-h-[320px]">
          <div className="flex-1 p-5 text-[10px] text-zinc-600">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-900">Professional summary</p>
            <p className="mt-2 leading-relaxed">
              Software engineer specializing in full-stack development, cloud infrastructure, and AI-assisted products.
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-zinc-900">Experience</p>
            <p className="mt-2 font-semibold text-zinc-800">Senior Engineer — TechCorp</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              <li>Built scalable APIs serving 2M+ users</li>
              <li>Led migration to modern cloud stack</li>
            </ul>
            <p className="mt-3 font-semibold text-zinc-800">Engineer — StartupXYZ</p>
            <ul className="mt-1 list-disc pl-4">
              <li>Shipped MVP in 12 weeks</li>
            </ul>
          </div>
          <div className="w-[34%] bg-[#5a7d6a] p-4 text-white">
            <div className="mx-auto mb-3 size-14 overflow-hidden rounded-full bg-white/25 ring-2 ring-white/40">
              <div className="flex h-full items-center justify-center text-lg text-white/70">👤</div>
            </div>
            <p className="text-center text-[11px] font-bold">Alex Morgan</p>
            <p className="text-center text-[9px] text-white/80">Senior Engineer</p>
            <div className="mt-4 space-y-2 text-[8px]">
              <p className="font-semibold uppercase tracking-wider text-white/90">Skills</p>
              {['React', 'Node.js', 'PostgreSQL', 'Leadership'].map((s) => (
                <div key={s} className="flex items-center justify-between gap-1">
                  <span>{s}</span>
                  <span className="text-[7px] text-amber-300">★★★★★</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[8px] text-white/75">
              <p className="font-semibold text-white/90">Contact</p>
              <p className="mt-1">alex@email.com</p>
              <p>Tel Aviv · Remote</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
