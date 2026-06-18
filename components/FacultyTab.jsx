// FacultyTab: department filter, faculty cards with ratings, rankings toggle,
// expandable review list per faculty, and review + add-faculty forms for students.

"use client";

import { useState, useEffect, useReducer } from "react";

const designationLabels = {
  professor: "Professor", associate_professor: "Associate Professor",
  assistant_professor: "Assistant Professor", lecturer: "Lecturer",
  visiting: "Visiting Faculty", hod: "Head of Department", other: "Other",
};

const tagLabels = {
  tough_grader: "Tough Grader", easy_grader: "Easy Grader", gives_good_notes: "Good Notes",
  inspirational: "Inspirational", lots_of_homework: "Lots of Homework",
  clear_explanations: "Clear Explanations", skippable_lectures: "Skippable Lectures",
  attendance_mandatory: "Attendance Mandatory", helpful_outside_class: "Helpful Outside Class",
  test_heavy: "Test Heavy", project_heavy: "Project Heavy", curved_grading: "Curved Grading",
  boring_lectures: "Boring", engaging: "Engaging",
};
const allTags = Object.keys(tagLabels);

function RatingBadge({ value, label, color }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
    </div>
  );
}

function FacultyCard({ faculty, isOwnCollege, onReviewAdded }) {
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [wouldTakeAgain, setWouldTakeAgain] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    fetch(`/api/faculty/${faculty._id}/reviews`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d)) setReviews(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [expanded, faculty._id]);

  function toggleTag(tag) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!rating || !difficulty || wouldTakeAgain === null || !body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/faculty/${faculty._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, difficulty, wouldTakeAgain, courseName, tags: selectedTags, body }),
      });
      if (res.ok) {
        setRating(0); setDifficulty(0); setWouldTakeAgain(null); setCourseName(""); setSelectedTags([]); setBody("");
        setShowReviewForm(false);
        const updated = await fetch(`/api/faculty/${faculty._id}/reviews`).then((r) => r.json());
        if (Array.isArray(updated)) setReviews(updated);
        if (onReviewAdded) onReviewAdded();
      }
    } catch {} finally { setSubmitting(false); }
  }

  const s = faculty.stats;

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-[var(--color-card-hover)] transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-heading)] font-semibold">{faculty.name}</p>
            <p className="text-xs text-[var(--color-muted)]">
              {designationLabels[faculty.designation] || faculty.designation} · {faculty.department}
            </p>
            {faculty.courses?.length > 0 && (
              <p className="text-xs text-[var(--color-accent)] mt-1">{faculty.courses.join(", ")}</p>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {s.avgRating !== null && <RatingBadge value={s.avgRating} label="Quality" color="text-[var(--color-accent)]" />}
            {s.avgDifficulty !== null && <RatingBadge value={s.avgDifficulty} label="Difficulty" color="text-[var(--color-star)]" />}
            {s.wouldTakeAgainPct !== null && <RatingBadge value={`${s.wouldTakeAgainPct}%`} label="Again" color="text-[var(--color-badge-public-text)]" />}
            <span className="text-xs text-[var(--color-muted)]">{s.totalReviews} review{s.totalReviews !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border)] p-4 space-y-4">
          {reviews.length > 0 ? reviews.map((r) => (
            <div key={r._id} className="pl-4 border-l-2 border-[var(--color-accent-light)] space-y-1">
              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <span>Quality: {r.rating}/5</span>
                <span>Difficulty: {r.difficulty}/5</span>
                <span>{r.wouldTakeAgain ? "Would take again" : "Would not take again"}</span>
                {r.courseName && <span>· {r.courseName}</span>}
                {r.grade && <span>· Grade: {r.grade}</span>}
              </div>
              {r.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                      {tagLabels[t] || t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed">{r.body}</p>
            </div>
          )) : <p className="text-sm text-[var(--color-muted)]">No reviews yet for this professor.</p>}

          {isOwnCollege && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)}
              className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer">Write a review</button>
          )}

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="space-y-3 border-t border-[var(--color-border)] pt-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Quality (1-5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)}
                        className={`text-lg cursor-pointer ${n <= rating ? "text-[var(--color-accent)]" : "text-[var(--color-border)]"}`}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Difficulty (1-5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setDifficulty(n)}
                        className={`text-lg cursor-pointer ${n <= difficulty ? "text-[var(--color-star)]" : "text-[var(--color-border)]"}`}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Would take again?</label>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setWouldTakeAgain(true)}
                      className={`text-sm px-3 py-1 rounded-md border cursor-pointer ${wouldTakeAgain === true ? "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)] border-transparent" : "border-[var(--color-border)] text-[var(--color-muted)]"}`}>Yes</button>
                    <button type="button" onClick={() => setWouldTakeAgain(false)}
                      className={`text-sm px-3 py-1 rounded-md border cursor-pointer ${wouldTakeAgain === false ? "bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)] border-transparent" : "border-[var(--color-border)] text-[var(--color-muted)]"}`}>No</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Course (optional)</label>
                <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Data Structures"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((t) => (
                    <button key={t} type="button" onClick={() => toggleTag(t)}
                      className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${selectedTags.includes(t) ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"}`}>
                      {tagLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Review</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3}
                  placeholder="What should students know about this professor?"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submitting}
                  className="text-sm px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer">
                  {submitting ? "Posting..." : "Submit"}
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)}
                  className="text-sm px-4 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] cursor-pointer">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function FacultyTab({ collegeId, departments, isOwnCollege }) {
  const [faculty, setFaculty] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [refresh, triggerRefresh] = useReducer((x) => x + 1, 0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newDesignation, setNewDesignation] = useState("assistant_professor");
  const [newCourses, setNewCourses] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let url = `/api/faculty?collegeId=${collegeId}&sort=${sortBy}`;
    if (filterDept) url += `&department=${encodeURIComponent(filterDept)}`;
    fetch(url).then((r) => r.json()).then((d) => { if (!cancelled && Array.isArray(d)) setFaculty(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, [collegeId, filterDept, sortBy, refresh]);

  async function handleAddFaculty(e) {
    e.preventDefault();
    if (!newName.trim() || !newDept.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId, name: newName, department: newDept, designation: newDesignation,
          courses: newCourses.split(",").map((c) => c.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setNewName(""); setNewDept(""); setNewCourses(""); setShowAddForm(false);
        triggerRefresh();
      }
    } catch {} finally { setAdding(false); }
  }

  const deptNames = departments?.map((d) => d.name || d) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {deptNames.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-muted)]">Department:</span>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
              <option value="">All</option>
              {deptNames.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>
        </div>
      </div>

      {/* Faculty list */}
      {faculty.length > 0 ? (
        <div className="space-y-3">
          {faculty.map((f) => (
            <FacultyCard key={f._id} faculty={f} isOwnCollege={isOwnCollege} onReviewAdded={triggerRefresh} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-muted)]">No faculty listed yet.</p>
      )}

      {/* Add faculty form */}
      {isOwnCollege && (
        <>
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)}
              className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer">+ Add a professor</button>
          ) : (
            <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)]">
              <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-4">Add Faculty Member</h3>
              <form onSubmit={handleAddFaculty} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Name</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Department</label>
                    {deptNames.length > 0 ? (
                      <select value={newDept} onChange={(e) => setNewDept(e.target.value)} required
                        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                        <option value="">Select</option>
                        {deptNames.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} required placeholder="e.g. Computer Science"
                        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Designation</label>
                    <select value={newDesignation} onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                      {Object.entries(designationLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Courses (comma-separated)</label>
                    <input type="text" value={newCourses} onChange={(e) => setNewCourses(e.target.value)} placeholder="e.g. DSA, OS, DBMS"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={adding}
                    className="text-sm px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer">
                    {adding ? "Adding..." : "Add"}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="text-sm px-4 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] cursor-pointer">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
