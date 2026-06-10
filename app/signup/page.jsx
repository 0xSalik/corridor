// Signup page: multi-step form. Step 1 picks role (student vs aspirant),
// Step 2 collects account info + role-specific fields,
// Step 3 collects exam scores (percentile, rank, category).

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [category, setCategory] = useState("general");
  const [jeeMainPercentile, setJeeMainPercentile] = useState("");
  const [jeeMainQualified, setJeeMainQualified] = useState(false);
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [jeeAdvancedQualified, setJeeAdvancedQualified] = useState(false);
  const [neetMarks, setNeetMarks] = useState("");
  const [neetRank, setNeetRank] = useState("");
  const [bitsatScore, setBitsatScore] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  function nextStep() {
    setError("");
    if (step === 1 && !role) {
      setError("Pick one to continue.");
      return;
    }
    if (step === 2) {
      if (!name || !email || !password) {
        setError("Fill in all required fields.");
        return;
      }
      if (password.length < 6) {
        setError("Password needs at least 6 characters.");
        return;
      }
    }
    setStep(step + 1);
  }

  function prevStep() {
    setError("");
    setStep(step - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const examScores = { category };

    if (jeeMainPercentile) {
      examScores.jeeMain = {
        percentile: parseFloat(jeeMainPercentile),
        qualified: jeeMainQualified,
      };
    }
    if (jeeAdvancedRank || jeeAdvancedQualified) {
      examScores.jeeAdvanced = {
        rank: jeeAdvancedRank ? parseInt(jeeAdvancedRank) : undefined,
        qualified: jeeAdvancedQualified,
      };
    }
    if (neetMarks || neetRank) {
      examScores.neet = {
        marks: neetMarks ? parseInt(neetMarks) : undefined,
        rank: neetRank ? parseInt(neetRank) : undefined,
      };
    }
    if (bitsatScore) {
      examScores.bitsat = { score: parseInt(bitsatScore) };
    }

    try {
      await signup(name, email, password, {
        role,
        college: role === "student" ? college : undefined,
        branch: role === "student" ? branch : undefined,
        yearOfStudy: role === "student" ? parseInt(yearOfStudy) || undefined : undefined,
        examScores,
      });
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="text-3xl mb-2">Create an account</h1>
      <p className="text-[var(--color-muted)] mb-8">
        {step === 1
          ? "Tell us who you are so we can tailor your experience."
          : step === 2
          ? "Set up your account basics."
          : "This helps us give you better college predictions. All fields are optional."}
      </p>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)] text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Role selection */}
      {step === 1 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setRole("aspirant")}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              role === "aspirant"
                ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]"
            }`}
          >
            <p className="font-medium">I am exploring colleges</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              You are preparing for entrance exams or looking for the right college to join.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole("student")}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              role === "student"
                ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]"
            }`}
          >
            <p className="font-medium">I am a current student</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              You are already enrolled at a college and want to share your experience.
            </p>
          </button>

          <button
            onClick={nextStep}
            className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer mt-4"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Account info */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
            <p className="text-xs text-[var(--color-muted)] mt-1">At least 6 characters</p>
          </div>

          {role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">College name</label>
                <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. NIT Srinagar"
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. CSE"
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors">
                    <option value="">Select</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] font-medium hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
              Back
            </button>
            <button onClick={nextStep} className="flex-1 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Exam scores */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Category / Quota</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] transition-colors">
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="ews">EWS</option>
            </select>
          </div>

          {/* JEE Main */}
          <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
            <legend className="text-sm font-medium px-2">JEE Main</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Percentile</label>
                <input type="number" step="0.01" min="0" max="100" value={jeeMainPercentile} onChange={(e) => setJeeMainPercentile(e.target.value)} placeholder="e.g. 95.4"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={jeeMainQualified} onChange={(e) => setJeeMainQualified(e.target.checked)} className="rounded" />
                  Qualified
                </label>
              </div>
            </div>
          </fieldset>

          {/* JEE Advanced */}
          <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
            <legend className="text-sm font-medium px-2">JEE Advanced</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Rank</label>
                <input type="number" min="1" value={jeeAdvancedRank} onChange={(e) => setJeeAdvancedRank(e.target.value)} placeholder="e.g. 5400"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={jeeAdvancedQualified} onChange={(e) => setJeeAdvancedQualified(e.target.checked)} className="rounded" />
                  Qualified
                </label>
              </div>
            </div>
          </fieldset>

          {/* NEET */}
          <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
            <legend className="text-sm font-medium px-2">NEET</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Marks (out of 720)</label>
                <input type="number" min="0" max="720" value={neetMarks} onChange={(e) => setNeetMarks(e.target.value)} placeholder="e.g. 580"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1">Rank</label>
                <input type="number" min="1" value={neetRank} onChange={(e) => setNeetRank(e.target.value)} placeholder="e.g. 12000"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
            </div>
          </fieldset>

          {/* BITSAT */}
          <fieldset className="border border-[var(--color-border)] rounded-lg p-4">
            <legend className="text-sm font-medium px-2">BITSAT</legend>
            <div>
              <label className="block text-xs text-[var(--color-muted)] mb-1">Score</label>
              <input type="number" min="0" max="450" value={bitsatScore} onChange={(e) => setBitsatScore(e.target.value)} placeholder="e.g. 280"
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
            </div>
          </fieldset>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] font-medium hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
              Back
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-xs text-[var(--color-muted)] text-center mt-2">
            You can skip exam scores and add them later from your profile.
          </p>
        </form>
      )}

      <p className="mt-8 text-sm text-[var(--color-muted)] text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-accent)] font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
