import { SubmissionForm } from "@/components/submission-form";

export default function Page() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(178,75,47,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(22,17,11,0.16),_transparent_28%),linear-gradient(180deg,_#f7f1e8_0%,_#f2e9dd_100%)] text-ink">
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(22,17,11,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(22,17,11,0.8)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
            Evidence-first analysis
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.92] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Evidence-first fact checker for X posts.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/78 sm:text-xl">
            Paste a link, text, or screenshot. You&apos;ll get a neutral fact
            check and a reply draft grounded only in verified evidence.
          </p>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <SubmissionForm />

          <aside className="rounded-[30px] border border-ink/12 bg-ink p-6 text-paper shadow-glow sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-paper/60">
              Output preview
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em]">
              What you get back
            </h2>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-paper/12 bg-paper/8 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-paper/56">
                  Fact Check
                </p>
                <p className="mt-2 text-sm leading-6 text-paper/82">
                  A neutral, source-backed breakdown of each claim with evidence
                  quality, confidence, and limits.
                </p>
              </div>

              <div className="rounded-2xl border border-paper/12 bg-paper/8 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-paper/56">
                  Reply Draft
                </p>
                <p className="mt-2 text-sm leading-6 text-paper/82">
                  A sharp but constrained response draft that only uses verified
                  findings from the fact check.
                </p>
              </div>

              <div className="rounded-2xl border border-paper/12 bg-paper/8 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-paper/56">
                  Limits
                </p>
                <p className="mt-2 text-sm leading-6 text-paper/82">
                  Unsupported claims, weak sourcing, and vague rhetoric are
                  labeled explicitly instead of being overstated.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
