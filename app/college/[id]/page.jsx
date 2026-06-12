// College detail page: shows overview, departments, reviews, and questions in tabs.

"use client";

import { useState, useEffect, useCallback, useReducer, use } from "react";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import QuestionItem from "@/components/QuestionItem";

export default function CollegeDetailPage({ params }) {
  const { id } = use(params);
  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [reviewCategory, setReviewCategory] = useState("");
  const [reviewRefresh, triggerReviewRefresh] = useReducer((x) => x + 1, 0);
  const [questionRefresh, triggerQuestionRefresh] = useReducer((x) => x + 1, 0);

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-4">College not found</h1>
        <p className="text-[var(--color-muted)]">
          We could not find this college. It may have been removed or the link might be wrong.
        </p>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "departments", label: "Departments" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
    { key: "questions", label: `Questions (${questions.length})` },
  ];

  const facilityList = [];
  if (college.facilities?.hostel) facilityList.push("Hostel");
  if (college.facilities?.lab) facilityList.push("Labs");
  if (college.facilities?.library) facilityList.push("Library");

  const categories = ["", "overall", "hostel", "department", "placement", "lab", "campus"];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl mb-1">{college.name}</h1>
            <p className="text-[var(--color-muted)]">
              {college.city}, {college.state}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              college.type === "public" ? "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]"
              : college.type === "private" ? "bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)]"
              : "bg-[var(--color-badge-deemed)] text-[var(--color-badge-deemed-text)]"
            }`}>
              {college.type}
            </span>
            {college.established && (
              <span className="text-sm text-[var(--color-muted)]">Est. {college.established}</span>
            )}
          </div>
        </div>
        {college.averagePlacement > 0 && (
          <p className="mt-2 text-sm font-medium text-[var(--color-accent)]">
            Average placement: {college.averagePlacement} LPA
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {college.about && (
            <div>
              <h2 className="text-xl mb-3">About</h2>
              <p className="leading-relaxed">{college.about}</p>
            </div>
          )}
          {facilityList.length > 0 && (
            <div>
              <h2 className="text-xl mb-3">Facilities</h2>
              <div className="flex gap-3 flex-wrap">
                {facilityList.map((f) => (
                  <span key={f} className="px-3 py-1.5 text-sm rounded-md bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Departments tab */}
      {activeTab === "departments" && (
        <div className="space-y-3">
          {college.departments && college.departments.length > 0 ? (
            college.departments.map((dept, i) => (
              <div key={i} className="flex items-center justify-between border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
                <div>
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{dept.reviewCount} reviews</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-star)]">★</span>
                  <span className="text-sm font-medium">{dept.rating.toFixed(1)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[var(--color-muted)]">No department data available.</p>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c || "all"}
                onClick={() => setReviewCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                  reviewCategory === c
                    ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
              >
                {c ? c.charAt(0).toUpperCase() + c.slice(1) : "All"}
              </button>
            ))}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-muted)]">No reviews yet for this college.</p>
          )}

          <ReviewForm collegeId={id} onReviewAdded={triggerReviewRefresh} />
        </div>
      )}

      {/* Questions tab */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((q) => (
              <QuestionItem key={q._id} question={q} onAnswerAdded={triggerQuestionRefresh} />
            ))
          ) : (
            <p className="text-[var(--color-muted)]">No questions yet for this college.</p>
          )}
        </div>
      )}
    </div>
  );
}
