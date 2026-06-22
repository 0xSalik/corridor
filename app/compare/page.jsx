// Compare page: select 2-3 colleges and see them side by side.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ComparePage() {
  const [colleges, setColleges] = useState([]);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/colleges").then((r) => r.json()).then((d) => { if (!cancelled) setColleges(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  function toggleCollege(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setResults(null);
  }

  async function handleCompare() {
    if (selected.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/compare?ids=${selected.join(",")}`);
      if (res.ok) setResults(await res.json());
    } catch {} finally { setLoading(false); }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-3">Compare Colleges</h1>
      <p className="text-[var(--color-muted)] mb-8">Select 2 or 3 colleges to see them side by side.</p>

      {/* College selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {colleges.map((c) => (
          <button key={c._id} onClick={() => toggleCollege(c._id)}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${selected.includes(c._id) ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <button onClick={handleCompare} disabled={selected.length < 2 || loading}
        className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer mb-8">
        {loading ? "Loading..." : `Compare ${selected.length} college${selected.length !== 1 ? "s" : ""}`}
      </button>

      {/* Results */}
      {results && results.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[var(--color-border)] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[var(--color-accent-light)]">
                <th className="px-4 py-3 text-left font-medium w-40">Metric</th>
                {results.map((c) => (
                  <th key={c._id} className="px-4 py-3 text-left font-medium">
                    <Link href={`/college/${c._id}`} className="text-[var(--color-accent)] hover:underline">{c.name}</Link>
                    <span className="block text-xs font-normal text-[var(--color-muted)]">{c.city}, {c.state}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium">Type</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3 capitalize">{c.type}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-card-hover)]">
                <td className="px-4 py-3 font-medium">Established</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3">{c.established || "N/A"}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium">Avg. Placement</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3">{c.averagePlacement ? `${c.averagePlacement} LPA` : "N/A"}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-card-hover)]">
                <td className="px-4 py-3 font-medium">Avg. Rating</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3">{c.reviewStats.avgRating ? `${c.reviewStats.avgRating} / 5 (${c.reviewStats.totalReviews} reviews)` : "No reviews"}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium">Hostel</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3">{c.facilities?.hostel ? "Yes" : "No"}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-card-hover)]">
                <td className="px-4 py-3 font-medium">Library</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3">{c.facilities?.library ? "Yes" : "No"}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium">Labs</td>
                {results.map((c) => <td key={c._id} className="px-4 py-3">{c.facilities?.lab ? "Yes" : "No"}</td>)}
              </tr>
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-accent-light)]">
                <td className="px-4 py-3 font-medium" colSpan={results.length + 1}>Departments</td>
              </tr>
              {(() => {
                const allDepts = [...new Set(results.flatMap((c) => (c.departments || []).map((d) => d.name)))].sort();
                return allDepts.map((dept, i) => (
                  <tr key={dept} className={`border-t border-[var(--color-border)] ${i % 2 ? "bg-[var(--color-card-hover)]" : ""}`}>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{dept}</td>
                    {results.map((c) => {
                      const d = (c.departments || []).find((x) => x.name === dept);
                      return <td key={c._id} className="px-4 py-3">{d ? `${d.rating.toFixed(1)} ★` : "N/A"}</td>;
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
