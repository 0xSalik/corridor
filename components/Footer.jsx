import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold mb-3">Corridor</h4>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              College reviews by real students. Honest info for better decisions.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><Link href="/explore" className="hover:text-[var(--color-foreground)] transition-colors">All Colleges</Link></li>
              <li><Link href="/compare" className="hover:text-[var(--color-foreground)] transition-colors">Compare</Link></li>
              <li><Link href="/predict" className="hover:text-[var(--color-foreground)] transition-colors">Predict</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><Link href="/ask" className="hover:text-[var(--color-foreground)] transition-colors">Ask Questions</Link></li>
              <li><Link href="/connect" className="hover:text-[var(--color-foreground)] transition-colors">Student Connect</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-foreground)] transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><Link href="/signup" className="hover:text-[var(--color-foreground)] transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-[var(--color-foreground)] transition-colors">Log In</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-muted)]">
            Corridor &middot; Built by students, for students
          </p>
        </div>
      </div>
    </footer>
  );
}
