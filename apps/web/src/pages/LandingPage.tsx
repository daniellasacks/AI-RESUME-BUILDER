import { useAuth } from '../lib/auth'
import { PRODUCT_NAME } from '../lib/brand'
import { ButtonLink } from '../components/ui'

const perks = [
  { icon: '💬', color: 'from-violet-500 to-purple-600', title: 'Just chat', desc: '8 friendly questions. No forms, no templates.' },
  { icon: '👁️', color: 'from-blue-500 to-cyan-500', title: 'See it live', desc: 'Your CV appears on screen as you answer.' },
  { icon: '📄', color: 'from-pink-500 to-rose-500', title: 'Download PDF', desc: 'Polish with AI, then export in one click.' },
]

export function LandingPage() {
  const { user } = useAuth()
  const start = user ? '/app/chat' : '/auth?mode=register'

  return (
    <div className="min-h-full overflow-hidden">
      {/* Bold gradient hero */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyek0zNiA0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <header className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-sm font-bold backdrop-blur">
              ✦
            </div>
            <span className="text-sm font-semibold text-white">{PRODUCT_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            {!user ? (
              <ButtonLink to="/auth" variant="ghost" className="!text-white hover:!bg-white/10">
                Sign in
              </ButtonLink>
            ) : null}
            <ButtonLink to={start} className="!bg-white !text-violet-700 !shadow-lg hover:!bg-violet-50">
              Start free →
            </ButtonLink>
          </div>
        </header>

        <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-10 md:pb-28 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold backdrop-blur">
                ✨ AI-powered · Free demo
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
                Build a professional CV by chatting with AI
              </h1>
              <p className="mt-5 text-lg text-white/85 leading-relaxed">
                Tell us about your career in a simple conversation. We build a polished resume in real time — multiple
                jobs, skills, education, and all.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink to={start} className="!bg-white !px-8 !py-3.5 !text-base !font-bold !text-violet-700 !shadow-xl hover:!bg-violet-50">
                  Start building →
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-white/60">Takes about 5 minutes · No credit card</p>
            </div>

            {/* Product preview card */}
            <div className="rounded-3xl bg-white p-1 shadow-2xl shadow-black/20">
              <div className="overflow-hidden rounded-[22px] bg-slate-50">
                <div className="grid sm:grid-cols-5">
                  <div className="space-y-3 p-5 sm:col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[9px] font-bold text-white">
                        AI
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">CV Coach</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-violet-100 px-3 py-2.5 text-xs text-slate-800">
                      Hey! What's your name?
                    </div>
                    <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2.5 text-xs text-white">
                      Daniella Azar
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-violet-100 px-3 py-2.5 text-xs text-slate-800">
                      Tell me about your current job…
                    </div>
                  </div>
                  <div className="border-t border-slate-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 sm:col-span-2 sm:border-l sm:border-t-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500">Live preview</p>
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-[8px] shadow-sm">
                      <div className="font-bold text-slate-900">Daniella Azar</div>
                      <div className="text-violet-600">HR & Welfare Manager</div>
                      <div className="mt-2 font-semibold uppercase text-slate-400">Experience</div>
                      <div className="mt-0.5 text-slate-700">CallMarker · 2019–Today</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* What is this */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">What is {PRODUCT_NAME}?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500 leading-relaxed">
            A smart CV builder that interviews you like a career coach. Instead of filling boring forms, you have a
            natural chat — and watch your resume appear on the right, updating with every answer.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center shadow-sm">
                <div className={`mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-xl shadow-lg`}>
                  {p.icon}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink to={start} className="!px-10 !py-3.5 !text-base">
              Try it now — it's free
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        {PRODUCT_NAME} ·{' '}
        <a href="https://daniellasacks.github.io/portfolio/" className="text-violet-500 hover:underline" target="_blank" rel="noopener noreferrer">
          Daniella Azar
        </a>
      </footer>
    </div>
  )
}
