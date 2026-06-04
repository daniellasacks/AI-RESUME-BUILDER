import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { landingPreviewResume } from '../lib/sampleResume'
import { ResumePreview } from '../components/ResumePreview'
import { IconArrowRight, IconCheck } from '../components/icons'
import { Badge, Brand, Button, ButtonLink, Card } from '../components/ui'

const perks = ['Version history', 'Job tailoring', 'ATS scoring', 'PDF & DOCX']

export function LandingPage() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="mesh-bg min-h-full">
      <header className="glass-nav sticky top-0 z-50">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
          <Brand />
          {user ? (
            <Button onClick={() => nav('/app/dashboard')}>
              Open app
              <IconArrowRight size={16} className="opacity-70" />
            </Button>
          ) : (
            <ButtonLink to="/auth">Get started</ButtonLink>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <Badge>AI resume workspace</Badge>
          <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[3.5rem]">
            <span className="text-gradient">Craft resumes</span>
            <br />
            <span className="text-white">that get noticed.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-zinc-500 lg:mx-0">
            Tailor to any role, track every version, and export in seconds.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <ButtonLink to="/auth" className="min-w-[160px]">
              Start free
            </ButtonLink>
            <a
              href="https://github.com/daniellasacks/AI-RESUME-BUILDER"
              target="_blank"
              rel="noopener noreferrer"
              className="surface inline-flex min-w-[160px] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              View source
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-zinc-400">
                <IconCheck size={16} className="text-sky-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-16 lg:mt-20">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[min(100%,720px)] -translate-x-1/2 -translate-y-1/3 rounded-full bg-sky-500/20 blur-[100px]" />

          <Card elevated className="mx-auto max-w-4xl overflow-hidden p-2 accent-glow">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <span className="size-3 rounded-full bg-zinc-600" />
              <span className="size-3 rounded-full bg-zinc-600" />
              <span className="size-3 rounded-full bg-zinc-600" />
              <span className="ml-3 flex-1 rounded-md bg-zinc-800/80 py-1.5 text-center text-[11px] text-zinc-500">
                app.resumely — Jordan Lee · v3
              </span>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
              <div className="border-b border-white/[0.06] p-4 lg:border-b-0 lg:border-r">
                <div className="origin-top scale-[0.92] sm:scale-100">
                  <ResumePreview resume={landingPreviewResume} />
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4">
                <div className="surface rounded-xl p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ATS match</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-sky-400">87</span>
                    <span className="text-xs font-medium text-emerald-400">Strong</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-sky-500/15 py-3 text-center text-xs font-bold text-sky-200">PDF</div>
                  <div className="surface rounded-xl py-3 text-center text-xs font-semibold text-zinc-500">DOCX</div>
                </div>
                <div className="surface flex-1 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tailored for</div>
                  <p className="mt-2 text-sm font-semibold text-white">Senior Product Engineer</p>
                  <p className="text-xs text-zinc-500">Northwind · Remote</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
