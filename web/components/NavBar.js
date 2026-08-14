"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/api";
import { LogoMark } from "./Footer";

const links = [
  { href: "/payment", label: "Payment" },
  { href: "/registration", label: "Course Registration" },
  { href: "/results", label: "Results" },
];

export default function NavBar() {
  const [session, setSessionState] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSessionState(getSession());
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setSessionState(null);
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <LogoMark className="w-6 h-6" />
          <span>CST College</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-brand-600 transition ${
                pathname === link.href ? "text-brand-600 font-semibold" : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <span className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <span className="text-slate-500">{session.studentId}</span>
              <button onClick={handleLogout} className="btn-secondary !px-2.5 !py-1 text-xs">
                Log out
              </button>
            </span>
          ) : (
            <span className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link href="/login" className="text-slate-600 hover:text-brand-600 transition">
                Login
              </Link>
              <Link href="/register" className="btn-primary !px-3 !py-1.5 text-xs">
                Create account
              </Link>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
