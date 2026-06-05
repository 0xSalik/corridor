// Homepage: intro text, search bar UI, and a row of featured college cards.

import CollegeCard from "@/components/CollegeCard";

async function getFeaturedColleges() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/colleges`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const colleges = await res.json();
    return colleges.slice(0, 4);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const colleges = await getFeaturedColleges();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Intro section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl mb-4">
          Hear it from students who are actually there.
        </h1>
        <p className="text-[var(--color-muted)] text-lg max-w-2xl">
          Corridor gives you honest college reviews, real department ratings,
          and placement numbers shared by current students. No polished
          brochures, just the stuff that actually matters when picking a college.
        </p>
      </div>

      {/* Search bar (UI only for now) */}
      <div className="mb-12">
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search for a college, city, or branch..."
            className="w-full px-5 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            disabled
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
            Coming soon
          </span>
        </div>
      </div>

      {/* Featured colleges */}
      <section>
        <h2 className="text-2xl mb-6">Featured Colleges</h2>
        {colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {colleges.map((college) => (
              <CollegeCard key={college._id} college={college} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-muted)]">
            No colleges found. Run the seed script to populate data.
          </p>
        )}
      </section>
    </div>
  );
}
