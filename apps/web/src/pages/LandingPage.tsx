import { TemplateShowcase } from '../components/TemplateShowcase'
import { ButtonLink } from '../components/ui'

export function LandingPage() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div className="max-w-xl">
        <h1 className="text-[2.5rem] font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-5xl lg:text-[3.25rem]">
          Build your CV with AI — easily
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#666] sm:text-xl">
          Chat with our AI coach, watch your CV take shape live, and download a polished PDF in minutes.
        </p>
        <div className="mt-9">
          <ButtonLink
            to="/create"
            className="!rounded-full !px-10 !py-4 !text-base !font-semibold shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30"
          >
            Create CV
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-[#999]">No account required in demo mode</p>
      </div>

      <TemplateShowcase />
    </section>
  )
}
