// QuestionItem: displays a question with its answers and an optional answer form.

"use client";

import { useState } from "react";

export default function QuestionItem({ question, onAnswerAdded }) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/questions/${question._id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: answerText,
          respondentName: respondentName.trim() || "Anonymous",
        }),
      });

      if (res.ok) {
        setAnswerText("");
        setRespondentName("");
        setShowAnswerForm(false);
        if (onAnswerAdded) onAnswerAdded();
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const asker = question.isAnonymous ? "Someone" : (question.askedBy || "Someone");

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)]">
      <p className="font-medium mb-1">{question.questionText}</p>
      <p className="text-xs text-[var(--color-muted)] mb-4">Asked by {asker}</p>

      {question.answers && question.answers.length > 0 && (
        <div className="space-y-3 mb-4">
          {question.answers.map((answer) => (
            <div key={answer._id || `${answer.text}-${answer.respondentName}`} className="pl-4 border-l-2 border-[var(--color-accent-light)]">
              <p className="text-sm leading-relaxed">{answer.text}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">{answer.respondentName}</p>
            </div>
          ))}
        </div>
      )}

      {!showAnswerForm ? (
        <button
          onClick={() => setShowAnswerForm(true)}
          className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          Add an answer
        </button>
      ) : (
        <form onSubmit={handleSubmitAnswer} className="space-y-3 mt-2">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={respondentName}
            onChange={(e) => setRespondentName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
          />
          <textarea
            placeholder="Write your answer..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="text-sm px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Posting..." : "Post answer"}
            </button>
            <button
              type="button"
              onClick={() => setShowAnswerForm(false)}
              className="text-sm px-4 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
