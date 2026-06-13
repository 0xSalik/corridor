// Ask page: browse questions across all colleges and post new ones.

"use client";

import { useState, useEffect, useReducer } from "react";
import QuestionItem from "@/components/QuestionItem";

export default function AskPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [askedBy, setAskedBy] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [refresh, triggerRefresh] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    let cancelled = false;
    async function loadColleges() {
      try {
        const res = await fetch("/api/colleges");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setColleges(data);
          if (data.length > 0) setSelectedCollege(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      }
    }
    loadColleges();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedCollege) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/questions?collegeId=${selectedCollege}`);
        if (res.ok && !cancelled) setQuestions(await res.json());
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedCollege, refresh]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!questionText.trim() || !selectedCollege) return;
    setSubmitting(true);
    setSubmitMsg("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: selectedCollege,
          questionText: questionText.trim(),
          isAnonymous,
          askedBy: isAnonymous ? undefined : askedBy.trim() || undefined,
        }),
      });

      if (res.ok) {
        setQuestionText("");
        setAskedBy("");
        setSubmitMsg("Question posted.");
        triggerRefresh();
      } else {
        const data = await res.json();
        setSubmitMsg(data.error || "Something went wrong.");
      }
    } catch {
      setSubmitMsg("Failed to post question.");
    } finally {
      setSubmitting(false);
    }
  }

  const currentCollege = colleges.find((c) => c._id === selectedCollege);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-3">Ask a Question</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Got something you want to know about a college? Ask here. Current students and alumni can answer.
      </p>

      {/* College selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Select a college</label>
        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        >
          {colleges.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.city})
            </option>
          ))}
        </select>
      </div>

      {/* Post question form */}
      <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] mb-8">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold mb-4">Post a Question</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            rows={3}
            placeholder={currentCollege ? `What do you want to know about ${currentCollege.name}?` : "Write your question..."}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded" />
              Post anonymously
            </label>
            {!isAnonymous && (
              <input
                type="text"
                value={askedBy}
                onChange={(e) => setAskedBy(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Posting..." : "Post Question"}
            </button>
            {submitMsg && <span className="text-sm text-[var(--color-muted)]">{submitMsg}</span>}
          </div>
        </form>
      </div>

      {/* Questions list */}
      <h2 className="text-xl mb-4">
        {currentCollege ? `Questions about ${currentCollege.name}` : "Questions"}
      </h2>

      {loading ? (
        <p className="text-[var(--color-muted)]">Loading questions...</p>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionItem key={q._id} question={q} onAnswerAdded={triggerRefresh} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-muted)]">No questions yet for this college. Be the first to ask.</p>
      )}
    </div>
  );
}
