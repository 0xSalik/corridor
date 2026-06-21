// Login page: email and password form that authenticates via the auth API.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl mb-2">Log in</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Welcome back. Sign in to leave reviews and ask questions.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-muted)] text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--color-accent)] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
