// ReviewCard: displays a single student review with rating, category badge, and body text.

export default function ReviewCard({ review }) {
  const categoryColors = {
    hostel: "bg-amber-100 text-amber-800",
    department: "bg-blue-100 text-blue-800",
    placement: "bg-green-100 text-green-800",
    overall: "bg-gray-100 text-gray-700",
    lab: "bg-purple-100 text-purple-800",
    campus: "bg-teal-100 text-teal-800",
    faculty: "bg-indigo-100 text-indigo-800",
    food: "bg-orange-100 text-orange-800",
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-[family-name:var(--font-heading)] font-semibold leading-snug">
          {review.title}
        </h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${categoryColors[review.category] || ""}`}>
          {review.category}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex">
          {stars.map((filled, i) => (
            <span key={i} className={`text-sm ${filled ? "text-[var(--color-star)]" : "text-[var(--color-border)]"}`}>
              ★
            </span>
          ))}
        </div>
        <span className="text-xs text-[var(--color-muted)]">
          {review.isAnonymous ? "Anonymous" : review.studentName} · {review.branch}, Year {review.yearOfStudy}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[var(--color-foreground)]">{review.body}</p>
    </div>
  );
}
