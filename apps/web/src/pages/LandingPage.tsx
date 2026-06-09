import { useAuth } from '../lib/auth'
import { PRODUCT_NAME } from '../lib/brand'
import { Brand, ButtonLink } from '../components/ui'

const features = [
  {
    title: 'Conversational interview',
    desc: 'Answer natural questions — no forms. The AI walks you through your full career step by step.',
  },
  {
    title: 'Live CV preview',
    desc: 'Watch your resume build in real time on the right as you chat. Every answer updates the document.',
  },
  {
    title: 'Full career history',
    desc: 'Capture multiple roles, tools, education, and achievements — not just your current job.',
  },
  {
    title: 'Polish & export',
    desc: 'Improve writing, tailor for a role, and download a professional PDF when you are ready.',
  },
]

const steps = [
  { n: '1', title: 'Start chatting', desc: 'Tell the AI about your roles, skills, and goals.' },
  { n: '2', title: 'Review live', desc: 'Your CV updates instantly with every answer.' },
  { n: '3', title: 'Generate & download', desc: 'One click to polish, then export PDF.' },
]

function ChatMockup() {
  return (
    <div className="surface overflow-hidden shadow-lg shadow-[#2563eb]/5">
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] bg-[#f7f8fa] px-4 py-2.5">
        <span className="size-2 rounded-full bg-[#e5e7eb]" />
        <span className="size-2 rounded-full bg-[#e5e7eb]" />
        <span className="size-2 rounded-full bg-[#e5e7eb]" />
        <span className="ml-2 text-[11px] text-[#6b7280]">AI Career Interview</span>
      </div>
      <div className="grid md:grid-cols-[1fr_140px]">
        <div className="space-y-2.5 border-[#e5e7eb] p-4 md:border-r">
          <div className="max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-[#e5e7eb] bg-white px-3 py-2 text-[11px] text-[#111827]">
            What is your current role? Company | Title | Years
          </div>
          <div className="ml-auto max-w-[75%] rounded-[12px] rounded-br-[4px] bg-[#2563eb] px-3 py-2 text-[11px] text-white">
            CallMarker | HR Manager | 2019–Today
          </div>
          <div className="max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-[#e5e7eb] bg-white px-3 py-2 text-[11px] text-[#6b7280]">
            Tell me about previous roles…
          </div>
        </div>
        <div className="bg-[#f7f8fa] p-3">
          <div className="rounded border border-[#e5e7eb] bg-white p-2.5 text-[8px] leading-snug text-zinc-800">
            <div className="font-bold">Daniella Azar</div>
            <div className="text-zinc-500">HR & Welfare Manager</div>
            <div className="mt-2 font-semibold uppercase text-zinc-400">Experience</div>
            <div className="mt-0.5 font-medium">HR Manager — CallMarker</div>
            <div className="text-zinc-500">2019 – Today</div>
            <div className="mt-1 list-disc pl-3 text-zinc-600">
              <div>• Led HR & welfare…</div>
              <div>• Managed budget…</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { user } = useAuth()
  const start = user ? '/app/chat' : '/auth?mode=register'

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <header className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Brand />
          <div className="flex items-center gap-3">
            {user ? (
              <ButtonLink to="/app/chat">Start Chat</ButtonLink>
            ) : (
              <>
                <ButtonLink to="/auth" variant="ghost">
                  Sign in
                </ButtonLink>
                <ButtonLink to={start}>Start Chat</ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-14 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[#2563eb]">{PRODUCT_NAME}</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#111827] md:text-[2.5rem]">
                Build your CV through a simple AI conversation
              </h1>
              <p className="mt-4 text-lg text-[#6b7280] leading-relaxed">
                No forms. No templates. Chat with an AI interviewer that captures your full career — multiple jobs,
                tools, education, and achievements — and builds a professional resume live while you talk.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to={start}>Start Chat</ButtonLink>
                <ButtonLink to="/auth" variant="secondary">
                  Sign in
                </ButtonLink>
              </div>
              <p className="mt-4 text-xs text-[#6b7280]">Free demo · PDF export · ATS-friendly formatting</p>
            </div>
            <ChatMockup />
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-[#e5e7eb] bg-white py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-[#111827]">Built for real careers, not one-line summaries</h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#6b7280]">
              Whether you have one role or ten, the interview captures your complete story — responsibilities, software,
              education, and career goals.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-[12px] border border-[#e5e7eb] bg-[#f7f8fa] p-6">
                  <h3 className="font-medium text-[#111827]">{f.title}</h3>
                  <p className="mt-2 text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-[#111827]">How it works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#2563eb]/10 text-sm font-semibold text-[#2563eb]">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-medium text-[#111827]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[#6b7280]">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <ButtonLink to={start}>Start Chat — it takes about 5 minutes</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e7eb] bg-white py-8 text-center text-xs text-[#6b7280]">
        {PRODUCT_NAME} ·{' '}
        <a href="https://daniellasacks.github.io/portfolio/" className="text-[#2563eb] hover:underline" target="_blank" rel="noopener noreferrer">
          Daniella Azar
        </a>
      </footer>
    </div>
  )
}
