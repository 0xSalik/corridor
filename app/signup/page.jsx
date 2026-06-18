// Signup page: multi-step. Step 1 picks role, Step 2 collects account info,
// Step 3 is role-specific: students pick their college, aspirants enter exam scores.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student fields
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeResults, setCollegeResults] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [branch, setBranch] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");

  // Aspirant fields
  const [category, setCategory] = useState("general");
  const [jeeMainPercentile, setJeeMainPercentile] = useState("");
  const [jeeMainRank, setJeeMainRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [neetRank, setNeetRank] = useState("");
  const [bitsatScore, setBitsatScore] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  // Search colleges as user types
  useEffect(() => {
    if (role !== "student" || collegeSearch.length < 2) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/colleges/search?q=${encodeURIComponent(collegeSearch)}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled && Array.isArray(d)) setCollegeResults(d); })
        .catch(() => {});
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [collegeSearch, role]);

  function nextStep() {
    setError("");
    if (step === 1 && !role) { setError("Pick one to continue."); return; }
    if (step === 2) {
      if (!name || !email || !password) { setError("Fill in all required fields."); return; }
      if (password.length < 6) { setError("Password needs at least 6 characters."); return; }
    }
    setStep(step + 1);
  }

  function prevStep() { setError(""); setStep(step - 1); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (role === "student" && !selectedCollege) {
      setError("Please select your college.");
      return;
    }

    setSubmitting(true);

    const extra = { role };

    if (role === "student") {
      extra.collegeId = selectedCollege._id;
      extra.branch = branch;
      extra.yearOfStudy = yearOfStudy ? parseInt(yearOfStudy) : undefined;
    }

    if (role === "aspirant") {
      const examScores = { category };
      if (jeeMainPercentile || jeeMainRank) {
        examScores.jeeMain = {};
        if (jeeMainPercentile) examScores.jeeMain.percentile = parseFloat(jeeMainPercentile);
        if (jeeMainRank) examScores.jeeMain.rank = parseInt(jeeMainRank);
      }
      if (jeeAdvancedRank) examScores.jeeAdvanced = { rank: parseInt(jeeAdvancedRank) };
      if (neetRank) examScores.neet = { rank: parseInt(neetRank) };
      if (bitsatScore) examScores.bitsat = { score: parseInt(bitsatScore) };
      extra.examScores = examScores;
    }

    try {
      await signup(name, email, password, extra);
      router.push("/dashboard");
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
        {step === 1 ? "Tell us who you are so we can tailor your experience."
          : step === 2 ? "Set up your account."
          : role === "student" ? "Select your college and department."
          : "Enter your exam scores for better predictions. All fields are optional."}
      </p>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-badge-private)] text-[var(--color-badge-private-text)] text-sm">{error}</div>
      )}

      {/* Step 1: Role selection */}
      {step === 1 && (
        <div className="space-y-4">
          <button type="button" onClick={() => setRole("aspirant")}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${role === "aspirant" ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]"}`}>
            <p className="font-medium">I am exploring colleges</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">You want to find the right college based on your exam scores and preferences.</p>
          </button>
          <button type="button" onClick={() => setRole("student")}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${role === "student" ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]"}`}>
            <p className="font-medium">I am a current college student</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">You want to share reviews and help aspirants learn about your college.</p>
          </button>
          <button onClick={nextStep} className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer mt-4">Continue</button>
        </div>
      )}

      {/* Step 2: Account info */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
            <p className="text-xs text-[var(--color-muted)] mt-1">At least 6 characters</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] font-medium hover:text-[var(--color-foreground)] cursor-pointer">Back</button>
            <button onClick={nextStep} className="flex-1 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 cursor-pointer">Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Role-specific */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Student: college picker */}
          {role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Search for your college</label>
                <input type="text" value={collegeSearch} onChange={(e) => { setCollegeSearch(e.target.value); setSelectedCollege(null); }}
                  placeholder="Start typing your college name..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                {collegeResults.length > 0 && !selectedCollege && (
                  <div className="mt-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] max-h-48 overflow-y-auto">
                    {collegeResults.map((c) => (
                      <button key={c._id} type="button"
                        onClick={() => { setSelectedCollege(c); setCollegeSearch(c.name); setCollegeResults([]); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-accent-light)] transition-colors cursor-pointer border-b border-[var(--color-border)] last:border-b-0">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-[var(--color-muted)]"> - {c.city}, {c.state}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCollege && (
                  <p className="text-sm text-[var(--color-accent)] mt-2">Selected: {selectedCollege.name}, {selectedCollege.city}</p>
                )}
              </div>

              {selectedCollege && selectedCollege.departments?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Department / Branch</label>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                    <option value="">Select your department</option>
                    {selectedCollege.departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedCollege?.departments?.length && selectedCollege && (
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Year of Study</label>
                <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </>
          )}

          {/* Aspirant: exam scores */}
          {role === "aspirant" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Category / Quota</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                  <option value="general">General</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="ews">EWS</option>
                </select>
              </div>
              <p className="text-sm text-[var(--color-muted)]">Fill in whichever exams you have taken. Skip the rest.</p>
              <fieldset className="border border-[var(--color-border)] rounded-lg p-3 mb-2">
                <legend className="text-xs font-medium px-1 text-[var(--color-muted)]">JEE Main</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Percentile</label>
                    <input type="number" step="0.01" min="0" max="100" value={jeeMainPercentile} onChange={(e) => setJeeMainPercentile(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Rank</label>
                    <input type="number" min="1" value={jeeMainRank} onChange={(e) => setJeeMainRank(e.target.value)}
                      placeholder="Needed for predictions"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                </div>
              </fieldset>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">JEE Advanced Rank</label>
                  <input type="number" min="1" value={jeeAdvancedRank} onChange={(e) => setJeeAdvancedRank(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">NEET Rank</label>
                  <input type="number" min="1" value={neetRank} onChange={(e) => setNeetRank(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">BITSAT Score</label>
                  <input type="number" min="0" max="450" value={bitsatScore} onChange={(e) => setBitsatScore(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
              </div>
              <p className="text-xs text-[var(--color-muted)]">You can always add or update these from your profile later.</p>
            </>
          )}

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] font-medium hover:text-[var(--color-foreground)] cursor-pointer">Back</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-sm text-[var(--color-muted)] text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-accent)] font-medium hover:underline">Log in</Link>
      </p>
    </div>
  );
}
