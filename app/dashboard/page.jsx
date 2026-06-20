// Dashboard: role-based home screen. Aspirants see predictions + saved colleges.
// Students see their college overview, recent reviews, and mentoring toggle.

"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import CollegeCard from "@/components/CollegeCard";

function AspirantDashboard({ user }) {
  const [savedColleges, setSavedColleges] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/saved")
      .then((r) => r.json())
      .then((data) => { if (!cancelled && Array.isArray(data)) setSavedColleges(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl mb-2">Welcome back, {user.name}</h1>
        <p className="text-[var(--color-muted)]">Here is your dashboard. Explore colleges, run predictions, or check your shortlist.</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/predict" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1">Predict</h3>
          <p className="text-sm text-[var(--color-muted)]">Check which colleges match your rank</p>
        </Link>
        <Link href="/compare" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1">Compare</h3>
          <p className="text-sm text-[var(--color-muted)]">Put colleges side by side</p>
        </Link>
        <Link href="/explore" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1">Explore</h3>
          <p className="text-sm text-[var(--color-muted)]">Browse all colleges</p>
        </Link>
      </div>

      {/* Saved colleges */}
      <div>
        <h2 className="text-2xl mb-4">Your shortlist</h2>
        {savedColleges.length > 0 ? (
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
  const [refresh, triggerRefresh] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!user.collegeId) return;
    let cancelled = false;
    fetch(`/api/reviews?collegeId=${user.collegeId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled && Array.isArray(data)) setReviews(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user.collegeId, refresh]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.user) setMentoring(data.user.mentoring); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [refresh]);

  async function toggleMentoring() {
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
    } catch {}
  }

  const myReviews = reviews.filter((r) => r.userId === user.id);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl mb-2">Welcome back, {user.name}</h1>
        <p className="text-[var(--color-muted)]">
          Your college dashboard. Write reviews, answer questions, and help aspirants.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {user.collegeId && (
          <Link href={`/college/${user.collegeId}`} className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1">My College</h3>
            <p className="text-sm text-[var(--color-muted)]">View details, write reviews, answer questions</p>
          </Link>
        )}
        <Link href="/ask" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1">Answer Questions</h3>
          <p className="text-sm text-[var(--color-muted)]">Help aspirants who have questions about your college</p>
        </Link>
        <Link href="/profile" className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] hover:border-[var(--color-accent)] transition-colors">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-1">Edit Profile</h3>
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
        </div>
        <button
          onClick={toggleMentoring}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            mentoring?.available
              ? "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]"
              : "bg-[var(--color-accent)] text-white hover:opacity-90"
          }`}
        >
          {mentoring?.available ? "Available (click to hide)" : "Make yourself available"}
        </button>
      </div>

      {/* Recent reviews */}
      <div>
        <h2 className="text-2xl mb-4">Your reviews ({myReviews.length})</h2>
        {myReviews.length > 0 ? (
          <div className="space-y-3">
            {myReviews.slice(0, 5).map((r) => (
              <div key={r._id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-xs text-[var(--color-muted)]">{r.category}</span>
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
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-[var(--color-muted)]">Loading...</div>;
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
