// CollegeCard: reusable card showing a college summary.
// Used on both the Homepage and Explore page.

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

export default function CollegeCard({ college }) {
  return (
    <Link href={`/college/${college._id}`}>
      <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] transition-colors shadow-sm hover:shadow-md cursor-pointer">
        {/* Top row: name and badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug">
            {college.name}
          </h3>
          <TypeBadge type={college.type} />
        </div>

        {/* City */}
        <p className="text-sm text-[var(--color-muted)] mb-3">
          {college.city}, {college.state}
        </p>

        {/* Rating and placement */}
        <div className="flex items-center justify-between">
          <StarRating rating={college.avgRating} />
          {college.averagePlacement > 0 && (
            <span className="text-sm font-medium text-[var(--color-accent)]">
              {college.averagePlacement} LPA avg
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
