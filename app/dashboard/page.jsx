"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import CollegeCard from "@/components/CollegeCard";

function AdmissionChanceBadge({ chance }) {
  const config = {
    safe: { label: "Safe", bg: "bg-[var(--color-badge-public)]", text: "text-[var(--color-badge-public-text)]" },
    moderate: { label: "Moderate", bg: "bg-amber-100", text: "text-amber-800" },
    reach: { label: "Reach", bg: "bg-[var(--color-badge-private)]", text: "text-[var(--color-badge-private-text)]" },
  };
  const c = config[chance] || config.moderate;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function AspirantDashboard({ user }) {
  const [savedColleges, setSavedColleges] = useState([]);
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/user/saved").then((r) => r.json()),
      fetch("/api/auth/profile").then((r) => r.json()),
    ])
      .then(([saved, prof]) => {
        if (cancelled) return;
        if (Array.isArray(saved)) setSavedColleges(saved);
        if (prof.user) setProfile(prof.user);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!profile?.examScores) return;
    const es = profile.examScores;
    const rank = es.jeeMain?.rank || es.jeeAdvanced?.rank || es.neet?.rank || es.bitsat?.score;
    if (!rank) return;

    const exam = es.jeeMain?.rank ? "jee_main" : es.jeeAdvanced?.rank ? "jee_advanced" : es.neet?.rank ? "neet" : "bitsat";
    const quota = es.category || "general";

    let cancelled = false;
    fetch(`/api/predict?rank=${rank}&exam=${exam}&quota=${quota}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d)) setPredictions(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [profile]);

  const examScores = profile?.examScores;
  const hasExamData = examScores && (examScores.jeeMain?.rank || examScores.jeeAdvanced?.rank || examScores.neet?.rank || examScores.bitsat?.score);

  function getAdmissionChance(rank, closingRank) {
    if (!rank || !closingRank) return null;
    const ratio = rank / closingRank;
    if (ratio <= 0.7) return "safe";
    if (ratio <= 0.95) return "moderate";
    return "reach";
  }

  const topPredictions = predictions?.slice(0, 5) || [];
  const userRank = examScores?.jeeMain?.rank || examScores?.jeeAdvanced?.rank || examScores?.neet?.rank || examScores?.bitsat?.score;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl mb-2">Welcome back, {user.name}</h1>
        <p className="text-[var(--color-muted)]">Here is your dashboard. Explore colleges, run predictions, or check your shortlist.</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/predict" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors group">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Predict</h3>
          <p className="text-sm text-[var(--color-muted)]">Check which colleges match your rank</p>
        </Link>
        <Link href="/compare" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors group">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Compare</h3>
          <p className="text-sm text-[var(--color-muted)]">Put colleges side by side</p>
        </Link>
        <Link href="/explore" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors group">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Explore</h3>
          <p className="text-sm text-[var(--color-muted)]">Browse all colleges</p>
        </Link>
      </div>

      {/* Profile completion / exam scores prompt */}
      {!hasExamData && (
        <div className="border-2 border-dashed border-[var(--color-accent)] rounded-lg p-6 bg-[var(--color-accent-light)]">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-2">Complete your profile</h3>
          <p className="text-sm text-[var(--color-muted)] mb-3">
            Add your exam scores to unlock personalized college predictions and admission chances.
          </p>
          <Link href="/profile" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            Add exam scores →
          </Link>
        </div>
      )}

      {/* Admission chances preview */}
      {topPredictions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl">Your admission chances</h2>
            <Link href="/predict" className="text-sm text-[var(--color-accent)] hover:underline">See all →</Link>
          </div>
          <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-card)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--color-accent-light)] text-left">
                    <th className="px-4 py-3 font-medium">College</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium text-right">Closing Rank</th>
                    <th className="px-4 py-3 font-medium text-center">Chance</th>
                  </tr>
                </thead>
                <tbody>
                  {topPredictions.map((p, i) => (
                    <tr key={`${p.college?._id}-${p.branch}-${i}`} className="border-t border-[var(--color-border)]">
                      <td className="px-4 py-3">
                        {p.college ? (
                          <Link href={`/college/${p.college._id}`} className="text-[var(--color-accent)] hover:underline font-medium">
                            {p.college.name}
                          </Link>
                        ) : "Unknown"}
                      </td>
                      <td className="px-4 py-3">{p.branch}</td>
                      <td className="px-4 py-3 text-right">{p.closingRank?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <AdmissionChanceBadge chance={getAdmissionChance(userRank, p.closingRank)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Saved colleges */}
      <div>
        <h2 className="text-2xl mb-4">Your shortlist</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] animate-pulse">
                <div className="h-5 bg-[var(--color-border)] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[var(--color-border)] rounded w-1/2 mb-4" />
                <div className="h-4 bg-[var(--color-border)] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : savedColleges.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedColleges.map((c) => <CollegeCard key={c._id} college={c} />)}
          </div>
        ) : (
          <div className="border border-[var(--color-border)] rounded-lg p-8 bg-[var(--color-card)] text-center">
            <p className="text-[var(--color-muted)] mb-3">You have not saved any colleges yet.</p>
            <Link href="/explore" className="text-sm text-[var(--color-accent)] hover:underline">Browse colleges and save the ones you like</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentDashboard({ user }) {
  const [reviews, setReviews] = useState([]);
  const [mentoring, setMentoring] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [refresh, triggerRefresh] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!user.collegeId) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/reviews?collegeId=${user.collegeId}`).then((r) => r.json()),
      fetch("/api/auth/profile").then((r) => r.json()),
    ])
      .then(([revs, prof]) => {
        if (cancelled) return;
        if (Array.isArray(revs)) setReviews(revs);
        if (prof.user) {
          setMentoring(prof.user.mentoring);
          if (prof.user.collegeId?.name) setCollegeName(prof.user.collegeId.name);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user.collegeId, refresh]);

  async function toggleMentoring() {
    setToggleLoading(true);
    try {
      const res = await fetch("/api/connect/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !(mentoring?.available) }),
      });
      if (res.ok) {
        const data = await res.json();
        setMentoring(data.mentoring);
      }
    } catch {} finally {
      setToggleLoading(false);
    }
  }

  const myReviews = reviews.filter((r) => r.userId === user.id);
  const totalCollegeReviews = reviews.length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl mb-2">Welcome back, {user.name}</h1>
        <p className="text-[var(--color-muted)]">
          {collegeName ? `${collegeName} · ` : ""}Your college dashboard. Write reviews, answer questions, and help aspirants.
        </p>
      </div>

      {/* Contribution stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)] text-center">
          <p className="text-2xl font-bold text-[var(--color-accent)]">{myReviews.length}</p>
          <p className="text-xs text-[var(--color-muted)]">Your reviews</p>
        </div>
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)] text-center">
          <p className="text-2xl font-bold text-[var(--color-accent)]">{totalCollegeReviews}</p>
          <p className="text-xs text-[var(--color-muted)]">College reviews</p>
        </div>
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)] text-center">
          <p className="text-2xl font-bold text-[var(--color-accent)]">{mentoring?.available ? "Active" : "Off"}</p>
          <p className="text-xs text-[var(--color-muted)]">Mentoring</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {user.collegeId && (
          <Link href={`/college/${user.collegeId}`} className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors group">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">My College</h3>
            <p className="text-sm text-[var(--color-muted)]">View details, write reviews, answer questions</p>
          </Link>
        )}
        <Link href="/ask" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors group">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Answer Questions</h3>
          <p className="text-sm text-[var(--color-muted)]">Help aspirants who have questions about your college</p>
        </Link>
        <Link href="/profile" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors group">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Edit Profile</h3>
          <p className="text-sm text-[var(--color-muted)]">Update your info and mentoring preferences</p>
        </Link>
      </div>

      {/* Mentoring toggle */}
      <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] font-semibold">Student Connect</h3>
          <p className="text-sm text-[var(--color-muted)]">
            {mentoring?.available
              ? "You are visible to aspirants looking for help."
              : "Make yourself available so aspirants can reach out to you."}
          </p>
          {mentoring?.available && !mentoring?.contactMethod && (
            <p className="text-xs text-[var(--color-badge-private-text)] mt-1">
              Add contact info in your <Link href="/profile" className="underline">profile</Link> so aspirants can reach you.
            </p>
          )}
        </div>
        <button
          onClick={toggleMentoring}
          disabled={toggleLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 ${
            mentoring?.available
              ? "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]"
              : "bg-[var(--color-accent)] text-white hover:opacity-90"
          }`}
        >
          {toggleLoading ? "Updating..." : mentoring?.available ? "Available (click to hide)" : "Make yourself available"}
        </button>
      </div>

      {/* Recent reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl">Your reviews ({myReviews.length})</h2>
          {user.collegeId && (
            <Link href={`/college/${user.collegeId}`} className="text-sm text-[var(--color-accent)] hover:underline">
              Write a review →
            </Link>
          )}
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)] animate-pulse">
                <div className="h-4 bg-[var(--color-border)] rounded w-1/2 mb-2" />
                <div className="h-3 bg-[var(--color-border)] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : myReviews.length > 0 ? (
          <div className="space-y-3">
            {myReviews.slice(0, 5).map((r) => (
              <div key={r._id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{r.title}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex">{[...Array(5)].map((_, i) => <span key={i} className={`text-xs ${i < r.rating ? "text-[var(--color-star)]" : "text-[var(--color-border)]"}`}>★</span>)}</div>
                    <span className="text-xs text-[var(--color-muted)]">{r.category}</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-muted)] line-clamp-2">{r.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[var(--color-border)] rounded-lg p-8 bg-[var(--color-card)] text-center">
            <p className="text-[var(--color-muted)] mb-3">You have not written any reviews yet.</p>
            {user.collegeId && (
              <Link href={`/college/${user.collegeId}`} className="text-sm text-[var(--color-accent)] hover:underline">Go to your college page to write one</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/dashboard");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {user.role === "aspirant" ? (
        <AspirantDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </div>
  );
}
