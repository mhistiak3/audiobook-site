"use client";

import { BarChart3, Bookmark, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Library" },
    { href: "/statistics", icon: BarChart3, label: "Stats" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  // Don't show navigation on login/signup pages or playlist detail pages
  if (
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/playlist/")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[480px]">
      <div className="glass-panel border-t border-white/10 px-4 pb-[calc(var(--safe-bottom)+0.5rem)] pt-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                  isActive ? "text-primary" : "text-muted hover:text-white"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
