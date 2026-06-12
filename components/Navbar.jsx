// Navbar: top navigation bar with logo, page links, auth controls, and mobile menu.

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/predict", label: "Predict" },
  { href: "/ask", label: "Ask" },
  { href: "/about", label: "About" },
];

function NavLinkList({ pathname, onClick }) {
  return navLinks.map((link) => {
    const isActive = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onClick}
        className={`text-sm transition-colors ${
          isActive
            ? "text-[var(--color-accent)] font-medium"
            : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        }`}
      >
        {link.label}
      </Link>
    );
  });
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)] relative">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight">
          Corridor
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinkList pathname={pathname} />
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4 ml-2">
                  <span className="text-sm text-[var(--color-muted)]">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Log in
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 cursor-pointer p-1"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[var(--color-foreground)] transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[var(--color-foreground)] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[var(--color-foreground)] transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4 flex flex-col gap-3">
          <NavLinkList pathname={pathname} onClick={() => setMobileOpen(false)} />
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-sm text-[var(--color-muted)]">Signed in as {user.name}</span>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="text-sm text-left text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[var(--color-accent)] font-medium"
                >
                  Log in
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
