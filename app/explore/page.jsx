// Explore page: lists all colleges with type and city filters synced to URL query params.

"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CollegeCard from "@/components/CollegeCard";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterType = searchParams.get("type") || "all";
  const filterCity = searchParams.get("city") || "";
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchColleges() {
      try {
        const res = await fetch("/api/colleges");
        if (res.ok) setColleges(await res.json());
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchColleges();
  }, []);

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/explore?${params.toString()}`);
  }

  const cities = [...new Set(colleges.map((c) => c.city))].sort();

  const filteredColleges = colleges.filter((c) => {
    if (filterType !== "all" && c.type !== filterType) return false;
    if (filterCity && c.city !== filterCity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl mb-3">Explore Colleges</h1>
        <p className="text-[var(--color-muted)]">
          Browse all colleges in our database. Click on any card to see details, reviews, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">Type:</span>
          {["all", "public", "private", "deemed"].map((type) => (
            <button
              key={type}
              onClick={() => updateFilter("type", type)}
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

        {cities.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-muted)]">City:</span>
            <select
              value={filterCity}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
      </div>

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
          No colleges match your filters. Try broadening your search.
        </p>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-12"><p className="text-[var(--color-muted)]">Loading...</p></div>}>
      <ExploreContent />
    </Suspense>
  );
}
