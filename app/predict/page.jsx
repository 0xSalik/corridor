// Predict page: enter your rank/score and exam type to see which colleges you might get into.

"use client";

import { useState } from "react";
import PredictionTable from "@/components/PredictionTable";

const exams = [
  { value: "jee_main", label: "JEE Main", rankLabel: "JEE Main Rank" },
  { value: "jee_advanced", label: "JEE Advanced", rankLabel: "JEE Advanced Rank" },
  { value: "neet", label: "NEET", rankLabel: "NEET Rank" },
  { value: "bitsat", label: "BITSAT", rankLabel: "BITSAT Score" },
];

export default function PredictPage() {
  const [exam, setExam] = useState("jee_main");
  const [rank, setRank] = useState("");
  const [quota, setQuota] = useState("general");
  const [branch, setBranch] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const currentExam = exams.find((e) => e.value === exam);

  async function handleSearch(e) {
    e.preventDefault();
    if (!rank) return;
    setLoading(true);
    setSearched(false);

    try {
      let url = `/api/predict?rank=${rank}&exam=${exam}&quota=${quota}`;
      if (branch.trim()) {
        url += `&branch=${encodeURIComponent(branch.trim())}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl mb-3">College Predictor</h1>
        <p className="text-[var(--color-muted)] max-w-2xl">
          Enter your rank or score from a supported entrance exam, and we will show you
          colleges where you have a shot based on previous years&apos; cutoff data. This is
          a rough guide, not a guarantee.
        </p>
      </div>

      {/* Exam selector tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {exams.map((e) => (
          <button
            key={e.value}
            onClick={() => { setExam(e.value); setSearched(false); setResults(null); }}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
              exam === e.value
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{currentExam?.rankLabel || "Rank"}</label>
            <input
              type="number"
              min="1"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              required
              placeholder="Enter your rank"
              className="w-full px-3 py-2.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="ews">EWS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch (optional)</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full px-3 py-2.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Searching..." : "Find Colleges"}
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading && <p className="text-[var(--color-muted)]">Looking up cutoff data...</p>}
      {searched && !loading && (
        <>
          <h2 className="text-xl mb-4">
            Results for {currentExam?.label} rank {parseInt(rank).toLocaleString()} ({quota.toUpperCase()})
          </h2>
          <PredictionTable results={results} />
          <p className="text-xs text-[var(--color-muted)] mt-4">
            Based on the most recent year of cutoff data available for each college and branch.
            Actual cutoffs vary year to year. Use this as a starting point, not a final answer.
          </p>
        </>
      )}
    </div>
  );
}
