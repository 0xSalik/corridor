// Profile page: edit all user info including name, branch, exam scores, and mentoring settings.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [category, setCategory] = useState("general");
  const [jeeMainPercentile, setJeeMainPercentile] = useState("");
  const [jeeMainRank, setJeeMainRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [neetMarks, setNeetMarks] = useState("");
  const [neetRank, setNeetRank] = useState("");
  const [bitsatScore, setBitsatScore] = useState("");
  const [mentoringAvailable, setMentoringAvailable] = useState(false);
  const [mentoringAbout, setMentoringAbout] = useState("");
  const [mentoringMethod, setMentoringMethod] = useState("");
  const [mentoringContact, setMentoringContact] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.replace("/login?redirect=/profile"); return; }
    if (!user) return;
    let cancelled = false;
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.user) return;
        const u = data.user;
        setProfile(u);
        setName(u.name || "");
        setBranch(u.branch || "");
        setYearOfStudy(u.yearOfStudy?.toString() || "");
        setCategory(u.examScores?.category || "general");
        setJeeMainPercentile(u.examScores?.jeeMain?.percentile?.toString() || "");
        setJeeMainRank(u.examScores?.jeeMain?.rank?.toString() || "");
        setJeeAdvancedRank(u.examScores?.jeeAdvanced?.rank?.toString() || "");
        setNeetMarks(u.examScores?.neet?.marks?.toString() || "");
        setNeetRank(u.examScores?.neet?.rank?.toString() || "");
        setBitsatScore(u.examScores?.bitsat?.score?.toString() || "");
        setMentoringAvailable(u.mentoring?.available || false);
        setMentoringAbout(u.mentoring?.about || "");
        setMentoringMethod(u.mentoring?.contactMethod || "");
        setMentoringContact(u.mentoring?.contactInfo || "");
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, loading, router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = { name };

    if (user.role === "student") {
      payload.branch = branch;
      payload.yearOfStudy = yearOfStudy ? parseInt(yearOfStudy) : null;
      payload.mentoring = {
        available: mentoringAvailable,
        about: mentoringAbout,
        contactMethod: mentoringMethod,
        contactInfo: mentoringContact,
      };
    }

    if (user.role === "aspirant") {
      payload.examScores = { category };
      if (jeeMainPercentile) payload.examScores.jeeMain = { percentile: parseFloat(jeeMainPercentile), rank: jeeMainRank ? parseInt(jeeMainRank) : undefined };
      if (jeeAdvancedRank) payload.examScores.jeeAdvanced = { rank: parseInt(jeeAdvancedRank) };
      if (neetMarks || neetRank) payload.examScores.neet = { marks: neetMarks ? parseInt(neetMarks) : undefined, rank: neetRank ? parseInt(neetRank) : undefined };
      if (bitsatScore) payload.examScores.bitsat = { score: parseInt(bitsatScore) };
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("Profile updated.");
        refreshUser();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-2">Edit Profile</h1>
      <p className="text-[var(--color-muted)] mb-8">
        {user.role === "student"
          ? "Update your info and mentoring preferences."
          : "Update your info and exam scores for better predictions."}
      </p>

      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${message === "Profile updated." ? "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]" : "bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)]"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-accent-light)]">
          <p className="text-sm"><span className="font-medium">Role:</span> {user.role === "student" ? "Current Student" : "Aspirant"}</p>
          <p className="text-sm"><span className="font-medium">Email:</span> {profile.email}</p>
          {profile.collegeId && <p className="text-sm"><span className="font-medium">College:</span> {profile.collegeId.name}, {profile.collegeId.city}</p>}
        </div>

        {/* Student fields */}
        {user.role === "student" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year of Study</label>
                <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Mentoring */}
            <fieldset className="border border-[var(--color-border)] rounded-lg p-5">
              <legend className="text-sm font-medium px-2">Student Connect (Mentoring)</legend>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={mentoringAvailable} onChange={(e) => setMentoringAvailable(e.target.checked)} className="rounded" />
                  I am available to help aspirants
                </label>
                {mentoringAvailable && (
                  <>
                    <div>
                      <label className="block text-xs text-[var(--color-muted)] mb-1">Short bio (what you can help with)</label>
                      <textarea value={mentoringAbout} onChange={(e) => setMentoringAbout(e.target.value)} maxLength={300} rows={2}
                        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--color-muted)] mb-1">Contact method</label>
                        <select value={mentoringMethod} onChange={(e) => setMentoringMethod(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                          <option value="">Select</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                          <option value="telegram">Telegram</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-muted)] mb-1">Contact info</label>
                        <input type="text" value={mentoringContact} onChange={(e) => setMentoringContact(e.target.value)} placeholder="Number or handle"
                          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </fieldset>
          </>
        )}

        {/* Aspirant fields */}
        {user.role === "aspirant" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Category / Quota</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                <option value="general">General</option>
                <option value="obc">OBC</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="ews">EWS</option>
              </select>
            </div>

            <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
              <legend className="text-sm font-medium px-2">JEE Main</legend>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Percentile</label>
                  <input type="number" step="0.01" min="0" max="100" value={jeeMainPercentile} onChange={(e) => setJeeMainPercentile(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Rank</label>
                  <input type="number" min="1" value={jeeMainRank} onChange={(e) => setJeeMainRank(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
              <legend className="text-sm font-medium px-2">JEE Advanced</legend>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Rank</label>
                <input type="number" min="1" value={jeeAdvancedRank} onChange={(e) => setJeeAdvancedRank(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
            </fieldset>

            <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
              <legend className="text-sm font-medium px-2">NEET</legend>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Marks</label>
                  <input type="number" min="0" max="720" value={neetMarks} onChange={(e) => setNeetMarks(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Rank</label>
                  <input type="number" min="1" value={neetRank} onChange={(e) => setNeetRank(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
              <legend className="text-sm font-medium px-2">BITSAT</legend>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Score</label>
                <input type="number" min="0" max="450" value={bitsatScore} onChange={(e) => setBitsatScore(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
            </fieldset>
          </>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
