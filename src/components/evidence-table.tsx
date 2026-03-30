import type { ValidatedResult } from "@/lib/schema/result";

type EvidenceTableProps = {
  evidence: ValidatedResult["evidence"];
};

export function EvidenceTable({ evidence }: EvidenceTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink text-paper">
          <tr>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Publisher</th>
            <th className="px-4 py-3 font-medium">Published</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((item) => (
            <tr key={item.id} className="border-t border-ink/8 align-top">
              <td className="px-4 py-3">
                <a
                  href={item.sourceUrl}
                  className="font-medium text-ink underline decoration-ink/20 underline-offset-4"
                >
                  {item.sourceTitle}
                </a>
                <p className="mt-1 text-ink/65">{item.excerpt}</p>
              </td>
              <td className="px-4 py-3 uppercase text-ink/70">{item.sourceType}</td>
              <td className="px-4 py-3 text-ink/78">{item.publisher}</td>
              <td className="px-4 py-3 text-ink/78">
                {new Date(item.publicationDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
