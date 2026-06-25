// Predict page: auto-fetches exam scores from the user profile and runs predictions.
// No manual rank entry. If no exam data, prompts user to complete their profile.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import PredictionTable from "@/components/PredictionTable";

const examConfig = [
  { key: "jee_main", label: "JEE Main", getRank: (es) => es?.jeeMain?.rank },
  { key: "jee_advanced", label: "JEE Advanced", getRank: (es) => es?.jeeAdvanced?.rank },
  { key: "neet", label: "NEET", getRank: (es) => es?.neet?.rank },
  { key: "bitsat", label: "BITSAT", getRank: (es) => es?.bitsat?.score },
];

export default function PredictPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [results, setResults] = useState({});
  const [branch, setBranch] = useState("");

  // Fetch full profile with exam scores
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.user) setProfile(d.user);
        setProfileLoading(false);
      })
      .catch(() => { if (!cancelled) setProfileLoading(false); });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Determine which exams have data
  const examScores = profile?.examScores;
  const quota = examScores?.category || "general";

  const availableExams = examConfig.filter((e) => {
    const rank = e.getRank(examScores);
    return rank !== null && rank !== undefined;
  });

  // Auto-select first available exam once profile loads
  const firstExamKey = availableExams.length > 0 ? availableExams[0].key : null;
  const effectiveExam = activeExam || firstExamKey;

  // Auto-fetch predictions when exam tab changes
  useEffect(() => {
    if (!effectiveExam || !examScores) return;
    const config = examConfig.find((e) => e.key === effectiveExam);
    if (!config) return;
    const rank = config.getRank(examScores);
    if (!rank) return;

    const cacheKey = `${effectiveExam}-${branch}`;
    if (results[cacheKey]) return;

    let cancelled = false;

    let url = `/api/predict?rank=${rank}&exam=${effectiveExam}&quota=${quota}`;
    if (branch.trim()) url += `&branch=${encodeURIComponent(branch.trim())}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setResults((prev) => ({ ...prev, [cacheKey]: Array.isArray(d) ? d : [] }));
        }
      })
      .catch(() => {
        if (!cancelled) setResults((prev) => ({ ...prev, [cacheKey]: [] }));
      });

    return () => { cancelled = true; };
  }, [effectiveExam, examScores, quota, branch, results]);

  function handleBranchSearch(e) {
    e.preventDefault();
    const cacheKey = `${effectiveExam}-${branch}`;
    setResults((prev) => {
      const next = { ...prev };
      delete next[cacheKey];
      return next;
    });
  }

  if (authLoading || profileLoading) {
    return <div className="max-w-5xl mx-auto px-6 py-12 text-[var(--color-muted)]">Loading your profile...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl mb-4">College Predictor</h1>
        <p className="text-[var(--color-muted)] mb-6">Log in to see predictions based on your exam scores.</p>
        <Link href="/login" className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90">Log in</Link>
      </div>
    );
  }

  if (user.role === "student") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl mb-4">College Predictor</h1>
        <p className="text-[var(--color-muted)]">This tool is for aspirants exploring college options. As a current student, you are already where you need to be.</p>
      </div>
    );
  }

  if (availableExams.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl mb-4">College Predictor</h1>
        <p className="text-[var(--color-muted)] mb-2">
          We need at least one exam rank or score to generate predictions.
        </p>
        <p className="text-[var(--color-muted)] mb-6">
          Head to your profile and fill in your JEE Main rank, JEE Advanced rank, NEET rank, or BITSAT score.
        </p>
        <Link href="/profile" className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90">
          Complete your profile
        </Link>
      </div>
    );
  }

  const currentConfig = examConfig.find((e) => e.key === effectiveExam);
  const currentRank = currentConfig ? currentConfig.getRank(examScores) : null;
  const cacheKey = `${effectiveExam}-${branch}`;
  const currentResults = results[cacheKey];
  const isLoading = !currentResults && effectiveExam && currentRank;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl mb-3">College Predictor</h1>
        <p className="text-[var(--color-muted)] max-w-2xl">
          Predictions based on your profile data. Showing colleges where your rank falls within
          previous years&apos; closing cutoffs. This is a rough guide, not a guarantee.
        </p>
      </div>

      {/* Profile summary */}
      <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-accent-light)] mb-6 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium">Your scores:</span>
        {availableExams.map((e) => (
          <span key={e.key} className="text-[var(--color-accent)]">
            {e.label}: {e.getRank(examScores)?.toLocaleString()}
          </span>
        ))}
        <span className="text-[var(--color-muted)]">Category: {quota.toUpperCase()}</span>
        <Link href="/profile" className="text-[var(--color-accent)] hover:underline ml-auto">Edit scores</Link>
      </div>

      {/* Exam tabs (only exams with data) */}
      {availableExams.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {availableExams.map((e) => (
            <button
              key={e.key}
              onClick={() => setActiveExam(e.key)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                effectiveExam === e.key
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      )}

      {/* Optional branch filter */}
      <form onSubmit={handleBranchSearch} className="flex items-end gap-3 mb-8">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium mb-1">Filter by branch (optional)</label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. Computer Science"
            className="w-full px-3 py-2.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <button type="submit"
          className="px-4 py-2.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 cursor-pointer">
          Filter
        </button>
      </form>

      {/* Results */}
      {isLoading && <p className="text-[var(--color-muted)]">Looking up cutoff data for {currentConfig?.label}...</p>}

      {currentResults && (
        <>
          <h2 className="text-xl mb-4">
            {currentConfig?.label} predictions for rank {currentRank?.toLocaleString()} ({quota.toUpperCase()})
            {branch && <span className="text-[var(--color-muted)] font-normal"> in {branch}</span>}
          </h2>
          <PredictionTable results={currentResults} />
          <p className="text-xs text-[var(--color-muted)] mt-4">
            Based on the most recent year of cutoff data available for each college and branch.
            Actual cutoffs vary year to year. Use this as a starting point, not a final answer.
          </p>
        </>
      )}
    </div>
  );
}
