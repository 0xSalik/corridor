"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a college, city, or branch..."
        className="w-full px-5 py-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors pr-24 shadow-sm"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <h1 className="text-4xl md:text-5xl leading-tight mb-6 max-w-3xl">
          The college info students actually share with each other.
        </h1>
        <p className="text-lg text-[var(--color-muted)] max-w-2xl mb-8 leading-relaxed">
          Corridor connects you with real students at real colleges. Read their honest
          department reviews, check placement numbers, get your rank matched against
          previous cutoffs, and talk to someone who has been exactly where you are now.
        </p>

        <div className="mb-10">
          <HomeSearch />
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] font-medium hover:border-[var(--color-accent)] transition-colors"
          >
            Browse colleges
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-8 border-t border-[var(--color-border)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "Real", label: "Student reviews" },
            { value: "JoSAA", label: "Cutoff data" },
            { value: "4", label: "Entrance exams" },
            { value: "Free", label: "Always" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[var(--color-accent)]">{stat.value}</p>
              <p className="text-sm text-[var(--color-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two sides */}
      <section className="py-16 border-t border-[var(--color-border)]">
        <h2 className="text-2xl mb-10">Two sides of the same coin</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-[var(--color-border)] rounded-lg p-6 bg-[var(--color-card)]">
            <h3 className="text-xl mb-3">For aspirants</h3>
            <ul className="space-y-2 text-[var(--color-muted)]">
              <li>Predict which colleges you can get into based on your JEE, NEET, or BITSAT rank</li>
              <li>Read reviews written by students, not marketing teams</li>
              <li>Compare colleges side by side on departments, placements, and facilities</li>
              <li>Connect directly with current students willing to help</li>
              <li>Save colleges to a shortlist and track them</li>
            </ul>
          </div>
          <div className="border border-[var(--color-border)] rounded-lg p-6 bg-[var(--color-card)]">
            <h3 className="text-xl mb-3">For current students</h3>
            <ul className="space-y-2 text-[var(--color-muted)]">
              <li>Write detailed reviews about your departments, hostels, labs, food, and faculty</li>
              <li>Answer questions from people considering your college</li>
              <li>Help aspirants by making yourself available as a mentor</li>
              <li>Rate and review individual professors (RateMyProfessor-style)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-[var(--color-border)]">
        <h2 className="text-2xl mb-10">Built for how students actually decide</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Rank-based predictions", desc: "Enter your JEE Main, Advanced, NEET, or BITSAT rank and see which colleges are within reach." },
            { title: "Department-level reviews", desc: "Not just overall ratings. Reviews broken down by department, faculty quality, lab equipment, hostel, and food." },
            { title: "College comparison", desc: "Put two or three colleges next to each other. Compare departments, placements, facilities, and student ratings." },
            { title: "Student connect", desc: "Find current students at any college who are open to answering your questions over WhatsApp, email, or Telegram." },
            { title: "Anonymous Q&A", desc: "Ask the awkward questions. Is the hostel actually livable? Do non-CS branches get placed? No judgment." },
            { title: "Faculty ratings", desc: "Rate professors on quality, difficulty, and teaching style. Help future students pick the right sections." },
          ].map((f) => (
            <div key={f.title} className="p-5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)]">
              <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center border-t border-[var(--color-border)]">
        <h2 className="text-2xl mb-4">Ready to start?</h2>
        <p className="text-[var(--color-muted)] mb-8 max-w-lg mx-auto">
          Whether you are picking a college or already at one, there is something here for you.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-[var(--color-border)] font-medium hover:border-[var(--color-accent)] transition-colors"
          >
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}
