// PredictionTable: displays prediction results in a table with college, branch, and rank info.

import Link from "next/link";

export default function PredictionTable({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="border border-[var(--color-border)] rounded-lg p-8 bg-[var(--color-card)] text-center">
        <p className="text-[var(--color-muted)]">
          No matching colleges found for your rank. Try a higher rank or different exam parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-accent-light)] text-left">
              <th className="px-4 py-3 font-medium">College</th>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium text-right">Opening Rank</th>
              <th className="px-4 py-3 font-medium text-right">Closing Rank</th>
              <th className="px-4 py-3 font-medium text-center">Round</th>
              <th className="px-4 py-3 font-medium text-center">Year</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t border-[var(--color-border)] hover:bg-[var(--color-card-hover)]">
                <td className="px-4 py-3">
                  {r.college ? (
                    <Link href={`/college/${r.college._id}`} className="text-[var(--color-accent)] hover:underline font-medium">
                      {r.college.name}
                    </Link>
                  ) : (
                    <span className="text-[var(--color-muted)]">Unknown</span>
                  )}
                  {r.college && (
                    <span className="block text-xs text-[var(--color-muted)]">
                      {r.college.city}, {r.college.state}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{r.branch}</td>
                <td className="px-4 py-3 text-right">{r.openingRank.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{r.closingRank.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">{r.round}</td>
                <td className="px-4 py-3 text-center">{r.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
