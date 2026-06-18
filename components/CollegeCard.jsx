import Link from "next/link";

function StarRating({ rating }) {
  if (!rating) return <span className="text-sm text-[var(--color-muted)]">No ratings yet</span>;

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < fullStars
                ? "text-[var(--color-star)]"
                : i === fullStars && hasHalf
                ? "text-[var(--color-star)] opacity-50"
                : "text-[var(--color-border)]"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-[var(--color-muted)]">{rating}</span>
    </div>
  );
}

function TypeBadge({ type }) {
  const colorMap = {
    public: "bg-[var(--color-badge-public)] text-[var(--color-badge-public-text)]",
    private: "bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)]",
    deemed: "bg-[var(--color-badge-deemed)] text-[var(--color-badge-deemed-text)]",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[type] || ""}`}>
      {type}
    </span>
  );
}

function CorridorScoreBadge({ score }) {
  if (!score) return null;

  let color = "text-[var(--color-muted)]";
  if (score >= 80) color = "text-[var(--color-badge-public-text)]";
  else if (score >= 60) color = "text-[var(--color-accent)]";
  else if (score >= 40) color = "text-[var(--color-star)]";

  return (
    <div className="flex items-center gap-1">
      <span className={`text-lg font-bold ${color}`}>{score}</span>
      <span className="text-xs text-[var(--color-muted)]">/100</span>
    </div>
  );
}

export default function CollegeCard({ college }) {
  return (
    <Link href={`/college/${college._id}`}>
      <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] transition-colors shadow-sm hover:shadow-md cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug">
            {college.name}
          </h3>
          <TypeBadge type={college.type} />
        </div>

        <p className="text-sm text-[var(--color-muted)] mb-3">
          {college.city}, {college.state}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <StarRating rating={college.avgRating} />
          {college.averagePlacement > 0 && (
            <span className="text-sm font-medium text-[var(--color-accent)]">
              {college.averagePlacement} LPA
            </span>
          )}
        </div>

        {(college.corridorScore || college.totalReviews > 0) && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            {college.corridorScore ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--color-muted)]">Corridor Score</span>
                <CorridorScoreBadge score={college.corridorScore} />
              </div>
            ) : <div />}
            {college.totalReviews > 0 && (
              <span className="text-xs text-[var(--color-muted)]">
                {college.totalReviews} review{college.totalReviews !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
