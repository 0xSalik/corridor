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

  const [searchInput, setSearchInput] = useState(searchQuery);

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

  function handleSearch(e) {
    e.preventDefault();
    updateFilter("q", searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    updateFilter("q", "");
  }

  const cities = [...new Set(colleges.map((c) => c.city))].sort();

  const filteredColleges = colleges.filter((c) => {
    if (filterType !== "all" && c.type !== filterType) return false;
    if (filterCity && c.city !== filterCity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.about && c.about.toLowerCase().includes(q))
      );
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

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-xl mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by college name or city..."
          className="w-full px-5 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors pr-24"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Search
        </button>
      </form>

      {searchQuery && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">
            Showing results for &quot;{searchQuery}&quot;
          </span>
          <button
            onClick={clearSearch}
            className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

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

        <span className="text-sm text-[var(--color-muted)] ml-auto">
          {filteredColleges.length} college{filteredColleges.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)] animate-pulse">
              <div className="h-5 bg-[var(--color-border)] rounded w-3/4 mb-3" />
              <div className="h-4 bg-[var(--color-border)] rounded w-1/2 mb-4" />
              <div className="h-4 bg-[var(--color-border)] rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredColleges.map((college) => (
            <CollegeCard key={college._id} college={college} />
          ))}
        </div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-lg p-12 bg-[var(--color-card)] text-center">
          <p className="text-[var(--color-muted)] mb-2">
            No colleges match your filters.
          </p>
          <button
            onClick={() => {
              clearSearch();
              updateFilter("type", "all");
              updateFilter("city", "");
            }}
            className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
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
