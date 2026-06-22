// Connect page: aspirants find student mentors at colleges they are interested in.

"use client";

import { useState, useEffect } from "react";

export default function ConnectPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/colleges").then((r) => r.json()).then((d) => {
      if (!cancelled && Array.isArray(d)) {
        setColleges(d);
        if (d.length > 0) setSelectedCollege(d[0]._id);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedCollege) return;
    let cancelled = false;
    fetch(`/api/connect?collegeId=${selectedCollege}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d)) setMentors(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCollege]);

  const methodLabels = { whatsapp: "WhatsApp", email: "Email", telegram: "Telegram", instagram: "Instagram" };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-3">Student Connect</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Find current students who are open to answering your questions about their college. Pick a
        college below and reach out to anyone on the list.
      </p>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Select a college</label>
        <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
          {colleges.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.city})</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--color-muted)]">Looking for available students...</p>
      ) : mentors.length > 0 ? (
        <div className="space-y-4">
          {mentors.map((m) => (
            <div key={m._id} className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)]">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-[family-name:var(--font-heading)] font-semibold">{m.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {m.branch}{m.yearOfStudy ? `, Year ${m.yearOfStudy}` : ""}
                  </p>
                </div>
                {m.mentoring?.contactMethod && m.mentoring?.contactInfo && (
                  <span className="text-sm px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                    {methodLabels[m.mentoring.contactMethod] || m.mentoring.contactMethod}: {m.mentoring.contactInfo}
                  </span>
                )}
              </div>
              {m.mentoring?.about && (
                <p className="text-sm mt-3 leading-relaxed">{m.mentoring.about}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-lg p-8 bg-[var(--color-card)] text-center">
          <p className="text-[var(--color-muted)]">
            No students are currently available for mentoring at this college. Check back later or try another college.
          </p>
        </div>
      )}
    </div>
  );
}
