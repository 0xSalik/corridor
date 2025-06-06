// Explore page: fetches all colleges and displays them in a card grid.
// Filter by city or type is planned for a future update.

"use client";

import { useState, useEffect } from "react";
import CollegeCard from "@/components/CollegeCard";

export default function ExplorePage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    async function fetchColleges() {
      try {
        const res = await fetch("/api/colleges");
        if (res.ok) {
          const data = await res.json();
          setColleges(data);
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchColleges();
  }, []);

  const filteredColleges =
    filterType === "all"
      ? colleges
      : colleges.filter((c) => c.type === filterType);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl mb-3">Explore Colleges</h1>
        <p className="text-[var(--color-muted)]">
          Browse all colleges in our database. Click on any card to see more details.
        </p>
      </div>

      {/* Simple type filter */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm text-[var(--color-muted)]">Filter:</span>
        {["all", "public", "private", "deemed"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
              filterType === type
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* College grid */}
      {loading ? (
        <p className="text-[var(--color-muted)]">Loading colleges...</p>
      ) : filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredColleges.map((college) => (
            <CollegeCard key={college._id} college={college} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-muted)]">
          No colleges found. Try a different filter or run the seed script.
        </p>
      )}
    </div>
  );
}
