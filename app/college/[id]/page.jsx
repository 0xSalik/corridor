// College detail page: role-conditional tabs.
// Students at THIS college see review form; aspirants see save button and connect tab.

"use client";

import { useState, useEffect, useReducer, use } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import QuestionItem from "@/components/QuestionItem";

export default function CollegeDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [reviewCategory, setReviewCategory] = useState("");
  const [reviewRefresh, triggerReviewRefresh] = useReducer((x) => x + 1, 0);
  const [questionRefresh, triggerQuestionRefresh] = useReducer((x) => x + 1, 0);
  const [saved, setSaved] = useState(false);

  const isOwnCollege = user?.role === "student" && user?.collegeId === id;
  const isAspirant = user?.role === "aspirant";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/colleges/${id}`);
        if (res.ok && !cancelled) setCollege(await res.json());
      } catch (err) {
        console.error("Failed to load college:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const url = reviewCategory
        ? `/api/reviews?collegeId=${id}&category=${reviewCategory}`
        : `/api/reviews?collegeId=${id}`;
      const res = await fetch(url);
      if (res.ok && !cancelled) setReviews(await res.json());
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id, reviewCategory, reviewRefresh]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/questions?collegeId=${id}`);
      if (res.ok && !cancelled) setQuestions(await res.json());
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id, questionRefresh]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/connect?collegeId=${id}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d)) setMentors(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/user/saved")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d)) setSaved(d.some((c) => c._id === id)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id, user]);

  async function toggleSave() {
    try {
      const res = await fetch("/api/user/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: id }),
      });
      if (res.ok) setSaved(!saved);
    } catch {}
  }

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-12 text-[var(--color-muted)]">Loading...</div>;
  if (!college) return <div className="max-w-4xl mx-auto px-6 py-12"><h1 className="text-3xl mb-4">College not found</h1></div>;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "departments", label: "Departments" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
    { key: "questions", label: `Questions (${questions.length})` },
  ];
  if (mentors.length > 0 || isAspirant) {
    tabs.push({ key: "connect", label: `Connect (${mentors.length})` });
  }

  const facilityList = [];
  if (college.facilities?.hostel) facilityList.push("Hostel");
  if (college.facilities?.lab) facilityList.push("Labs");
  if (college.facilities?.library) facilityList.push("Library");

  const categories = ["", "overall", "hostel", "department", "placement", "lab", "campus", "faculty", "food"];
  const methodLabels = { whatsapp: "WhatsApp", email: "Email", telegram: "Telegram", instagram: "Instagram" };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl mb-1">{college.name}</h1>
            <p className="text-[var(--color-muted)]">{college.city}, {college.state}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${college.type === "public" ? "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]" : college.type === "private" ? "bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)]" : "bg-[var(--color-badge-deemed)] text-[var(--color-badge-deemed-text)]"}`}>{college.type}</span>
            {college.established && <span className="text-sm text-[var(--color-muted)]">Est. {college.established}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {college.averagePlacement > 0 && <span className="text-sm font-medium text-[var(--color-accent)]">Avg. placement: {college.averagePlacement} LPA</span>}
          {user && (
            <button onClick={toggleSave} className={`text-sm px-3 py-1 rounded-md border cursor-pointer transition-colors ${saved ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"}`}>
              {saved ? "Saved" : "Save to shortlist"}
            </button>
          )}
          {isOwnCollege && <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]">Your college</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === tab.key ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {college.about && <div><h2 className="text-xl mb-3">About</h2><p className="leading-relaxed">{college.about}</p></div>}
          {facilityList.length > 0 && (
            <div><h2 className="text-xl mb-3">Facilities</h2>
              <div className="flex gap-3 flex-wrap">{facilityList.map((f) => <span key={f} className="px-3 py-1.5 text-sm rounded-md bg-[var(--color-accent-light)] text-[var(--color-accent)]">{f}</span>)}</div>
            </div>
          )}
        </div>
      )}

      {/* Departments */}
      {activeTab === "departments" && (
        <div className="space-y-3">
          {college.departments?.length > 0 ? college.departments.map((dept, i) => (
            <div key={i} className="flex items-center justify-between border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
              <div><p className="font-medium">{dept.name}</p><p className="text-xs text-[var(--color-muted)]">{dept.reviewCount} reviews</p></div>
              <div className="flex items-center gap-1.5"><span className="text-[var(--color-star)]">★</span><span className="text-sm font-medium">{dept.rating.toFixed(1)}</span></div>
            </div>
          )) : <p className="text-[var(--color-muted)]">No department data available.</p>}
        </div>
      )}

      {/* Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c || "all"} onClick={() => setReviewCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${reviewCategory === c ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"}`}>
                {c ? c.charAt(0).toUpperCase() + c.slice(1) : "All"}
              </button>
            ))}
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-4">{reviews.map((r) => <ReviewCard key={r._id} review={r} />)}</div>
          ) : <p className="text-[var(--color-muted)]">No reviews yet.</p>}
          {isOwnCollege && <ReviewForm collegeId={id} onReviewAdded={triggerReviewRefresh} />}
          {user?.role === "student" && !isOwnCollege && (
            <p className="text-sm text-[var(--color-muted)] italic">You can only write reviews for your own college.</p>
          )}
          {!user && <p className="text-sm text-[var(--color-muted)]"><Link href="/login" className="text-[var(--color-accent)] hover:underline">Log in</Link> as a student of this college to leave a review.</p>}
        </div>
      )}

      {/* Questions */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {questions.length > 0 ? questions.map((q) => <QuestionItem key={q._id} question={q} onAnswerAdded={triggerQuestionRefresh} />) : <p className="text-[var(--color-muted)]">No questions yet.</p>}
        </div>
      )}

      {/* Connect */}
      {activeTab === "connect" && (
        <div className="space-y-4">
          <p className="text-[var(--color-muted)] mb-4">Current students who are open to answering your questions.</p>
          {mentors.length > 0 ? mentors.map((m) => (
            <div key={m._id} className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)]">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-[family-name:var(--font-heading)] font-semibold">{m.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{m.branch}{m.yearOfStudy ? `, Year ${m.yearOfStudy}` : ""}</p>
                </div>
                {m.mentoring?.contactMethod && m.mentoring?.contactInfo && (
                  <span className="text-sm px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                    {methodLabels[m.mentoring.contactMethod] || m.mentoring.contactMethod}: {m.mentoring.contactInfo}
                  </span>
                )}
              </div>
              {m.mentoring?.about && <p className="text-sm mt-3 leading-relaxed">{m.mentoring.about}</p>}
            </div>
          )) : <p className="text-[var(--color-muted)]">No students are available for mentoring at this college right now.</p>}
        </div>
      )}
    </div>
  );
}
