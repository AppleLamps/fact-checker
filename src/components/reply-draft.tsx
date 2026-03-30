import type { ValidatedResult } from "@/lib/schema/result";

type ReplyDraftProps = {
  replyDraft: ValidatedResult["replyDraft"];
};

export function ReplyDraft({ replyDraft }: ReplyDraftProps) {
  return (
    <section className="rounded-[28px] border border-accent/20 bg-accent/8 p-6">
      <h2 className="font-serif text-3xl tracking-[-0.03em] text-ink">Reply Draft</h2>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        Evidence-backed only
      </p>
      <h3 className="mt-4 text-xl font-semibold text-ink">{replyDraft.headline}</h3>
      <p className="mt-3 whitespace-pre-line text-base leading-7 text-ink/82">
        {replyDraft.body}
      </p>
    </section>
  );
}
