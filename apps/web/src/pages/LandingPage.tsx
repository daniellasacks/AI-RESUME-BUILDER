import { useAuth } from '../lib/auth'
import { PRODUCT_NAME } from '../lib/brand'
import { Brand, ButtonLink } from '../components/ui'

const perks = [
  { icon: '💬', title: 'Just chat', desc: 'Answer 8 simple questions — no forms or templates.' },
  { icon: '⚡', title: 'Live preview', desc: 'Your CV builds on screen as you type.' },
  { icon: '✨', title: 'AI polish', desc: 'One tap to refine wording and download PDF.' },
]

export function LandingPage() {
  const { user } = useAuth()
  const start = user ? '/app/chat' : '/auth?mode=register'

  return (
    <div className="mesh-bg min-h-full">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Brand />
          <div className="flex items-center gap-3">
            {!user ? (
              <ButtonLink to="/auth" variant="ghost">
                Sign in
              </ButtonLink>
            ) : null}
            <ButtonLink to={start}>Start free →</ButtonLink>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 md:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-1.5 text-xs font-medium text-indigo-600 shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Free · No credit card · Ready in 5 min
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#0f172a] md:text-5xl">
              Your CV, built through a{' '}
              <span className="gradient-text">friendly AI chat</span>
            </h1>
            <p className="mt-5 text-lg text-[#64748b] leading-relaxed">
              {PRODUCT_NAME} interviews you like a career coach — then writes a polished, professional resume you can
              download instantly.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink to={start} className="!px-8 !py-3.5 !text-base">
                Start building my CV
              </ButtonLink>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-400/20 via-violet-400/20 to-fuchsia-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-indigo-500/10">
              <div className="grid md:grid-cols-5">
                <div className="space-y-3 border-[#e2e8f0] p-6 md:col-span-3 md:border-r">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs text-white">
                      AI
                    </div>
                    <span className="text-xs font-medium text-[#64748b]">CV Coach</span>
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-indigo-50 px-4 py-3 text-sm text-[#0f172a]">
                    Hey! What's your name?
                  </div>
                  <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm text-white">
                    Daniella Azar
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-indigo-50 px-4 py-3 text-sm text-[#0f172a]">
                    Tell me about your current job…
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-5 md:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400">Live preview</p>
                  <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-white p-4 text-[9px] leading-relaxed shadow-sm">
                    <div className="font-bold text-[#0f172a]">Daniella Azar</div>
                    <div className="text-indigo-600">HR & Welfare Manager</div>
                    <div className="mt-3 text-[8px] font-semibold uppercase text-[#94a3b8]">Experience</div>
                    <div className="mt-1 font-medium">HR Manager — CallMarker</div>
                    <div className="mt-2 h-1 w-full rounded bg-indigo-100" />
                    <div className="mt-1 h-1 w-4/5 rounded bg-indigo-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e2e8f0]/60 bg-white/50 py-16 backdrop-blur-sm">
          <div className="mx-auto grid max-w-4xl gap-6 px-6 md:grid-cols-3">
            {perks.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">{p.icon}</span>
                <h3 className="mt-3 font-semibold text-[#0f172a]">{p.title}</h3>
                <p className="mt-1.5 text-sm text-[#64748b]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-[#94a3b8]">
        {PRODUCT_NAME} ·{' '}
        <a href="https://daniellasacks.github.io/portfolio/" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
          Daniella Azar
        </a>
      </footer>
    </div>
  )
}
