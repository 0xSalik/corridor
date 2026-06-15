// Homepage: intro, working search bar that redirects to explore, and featured colleges.

import Link from "next/link";
import CollegeCard from "@/components/CollegeCard";
import HomeSearch from "@/components/HomeSearch";

async function getFeaturedColleges() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/colleges`, { cache: "no-store" });
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

      {/* Search bar */}
      <div className="mb-12">
        <HomeSearch />
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Link href="/explore" className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
          Browse all colleges
        </Link>
        <Link href="/predict" className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
          Predict your college
        </Link>
        <Link href="/ask" className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
          Ask current students
        </Link>
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
