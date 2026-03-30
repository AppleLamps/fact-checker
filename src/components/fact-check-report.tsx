import type { ResultRecord } from "@/lib/db/types";
import { EvidenceTable } from "./evidence-table";
import { ReplyDraft } from "./reply-draft";

type FactCheckReportProps = {
  result: ResultRecord;
};

export function FactCheckReport({ result }: FactCheckReportProps) {
  const claimsWithVerdicts = result.claims.map((claim) => ({
    claim,
    verdict: result.verdicts.find((item) => item.claimId === claim.id)
  }));

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Fact Check
        </p>
        <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-ink">Fact Check</h2>
        <p className="mt-4 text-lg leading-8 text-ink/82">{result.postLevelSummary}</p>
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow">
        <h2 className="font-serif text-3xl tracking-[-0.03em] text-ink">Claims</h2>
        <div className="mt-6 grid gap-4">
          {claimsWithVerdicts.map(({ claim, verdict }) => (
            <article
              key={claim.id}
              className="rounded-3xl border border-ink/8 bg-paper/55 p-5"
            >
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-ink/55">
                {verdict?.label ?? "pending"}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-ink">{claim.text}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/72">
                {verdict?.rationale ?? "A verdict has not been generated yet."}
              </p>
              {verdict?.manipulationFlags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {verdict.manipulationFlags.map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full bg-ink/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/65"
                    >
                      {flag.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow">
        <h2 className="font-serif text-3xl tracking-[-0.03em] text-ink">Evidence</h2>
        <EvidenceTable evidence={result.evidence} />
      </section>

      <ReplyDraft replyDraft={result.replyDraft} />

      <section className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow">
        <h2 className="font-serif text-3xl tracking-[-0.03em] text-ink">Limits</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink/78">
          {result.limitations.map((limit) => (
            <li key={limit} className="rounded-2xl bg-paper/55 px-4 py-3">
              {limit}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
