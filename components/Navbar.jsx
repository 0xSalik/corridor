// Navbar: role-based navigation links, auth controls, and mobile menu.

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const publicLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
];

const aspirantLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/predict", label: "Predict" },
  { href: "/compare", label: "Compare" },
  { href: "/connect", label: "Connect" },
  { href: "/ask", label: "Ask" },
];

const studentLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/ask", label: "Ask" },
  { href: "/about", label: "About" },
];

function NavLinkList({ links, pathname, onClick }) {
  return links.map((link) => {
    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
    return (
      <Link key={link.href} href={link.href} onClick={onClick}
        className={`text-sm transition-colors ${isActive ? "text-[var(--color-accent)] font-medium" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}>
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

  const links = !user ? publicLinks : user.role === "aspirant" ? aspirantLinks : studentLinks;

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)] relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight">
          Corridor
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavLinkList links={links} pathname={pathname} />
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4 ml-2">
                  <Link href="/profile" className={`text-sm transition-colors ${pathname === "/profile" ? "text-[var(--color-accent)] font-medium" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}>
                    {user.name}
                  </Link>
                  <button onClick={handleLogout}
                    className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-accent)] transition-colors cursor-pointer">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2">
                  <Link href="/login" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">Log in</Link>
                  <Link href="/signup" className="text-sm px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity">Sign up</Link>
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex flex-col gap-1.5 cursor-pointer p-1" aria-label="Toggle menu">
          <span className={`block w-5 h-0.5 bg-[var(--color-foreground)] transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[var(--color-foreground)] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[var(--color-foreground)] transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4 flex flex-col gap-3">
          <NavLinkList links={links} pathname={pathname} onClick={() => setMobileOpen(false)} />
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--color-muted)]">{user.name} (Profile)</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-sm text-left text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer">Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--color-muted)]">Log in</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--color-accent)] font-medium">Sign up</Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
