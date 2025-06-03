// Navbar: top navigation bar with logo and page links.
// Appears on every page via the root layout.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/predict", label: "Predict" },
    { href: "/ask", label: "Ask" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Site name */}
        <Link href="/" className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight">
          Corridor
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-[var(--color-accent)] font-medium"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
