"use client";

import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckSquare,
  ChevronRight,
  CircleHelp,
  FlaskConical,
  Globe2,
  HeartPulse,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Mic,
  Settings2,
  Target,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LIFE_AREAS } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

const areaIcons = {
  tasks: CheckSquare,
  abroad: Globe2,
  career: BriefcaseBusiness,
  research: FlaskConical,
  goals: Target,
  money: WalletCards,
  health: HeartPulse,
  ideas: Lightbulb,
} as const;

const mainNavigation = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/habits", label: "Habits", icon: Activity },
  { href: "/dashboard/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/dashboard/interview", label: "Interview practice", icon: Mic },
  { href: "/dashboard/money", label: "Money tracker", icon: WalletCards },
  { href: "/dashboard/focus", label: "Focus timer", icon: CalendarCheck2 },
  { href: "/dashboard/review", label: "Weekly review", icon: BarChart3 },
];

export function AppShell({ user, children }: { user: { id: string; name: string; email: string }; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const title = [...mainNavigation, ...LIFE_AREAS.map((area) => ({ href: `/dashboard/areas/${area.id}`, label: area.label, icon: areaIcons[area.id] }))].find((item) => isActive(item.href))?.label || "Life OS";

  return (
    <div className="app-shell">
      {menuOpen && <button className="mobile-overlay" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-brand"><Link className="brand" href="/dashboard"><span className="brand-mark">L</span> Life OS</Link></div>
        <div className="workspace-pill"><span className="workspace-icon"><Activity size={16} /></span><span><b>Personal workspace</b><small>Your life, in one view</small></span><ChevronRight size={14} color="#aaa7b0" /></div>
        <nav className="side-nav" aria-label="Main navigation">
          <div className="nav-group">
            <div className="nav-label">Workspace</div>
            {mainNavigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} className={`nav-link ${isActive(href) ? "active" : ""}`} href={href} aria-current={isActive(href) ? "page" : undefined}>
                <Icon size={16} strokeWidth={1.8} />{label}
              </Link>
            ))}
          </div>
          <div className="nav-group">
            <div className="nav-label">Life areas</div>
            {LIFE_AREAS.map((area) => {
              const Icon = areaIcons[area.id];
              const href = `/dashboard/areas/${area.id}`;
              return <Link key={area.id} className={`nav-link ${isActive(href) ? "active" : ""}`} href={href} aria-current={isActive(href) ? "page" : undefined}><Icon size={16} strokeWidth={1.8} />{area.label}</Link>;
            })}
          </div>
          <div className="nav-group">
            <div className="nav-label">Account</div>
            <Link className={`nav-link ${isActive("/dashboard/settings") ? "active" : ""}`} href="/dashboard/settings"><Settings2 size={16} strokeWidth={1.8} />Settings &amp; backup</Link>
            <Link className="nav-link" href="/dashboard/settings#help"><CircleHelp size={16} strokeWidth={1.8} />Help &amp; privacy</Link>
          </div>
        </nav>
        <div className="side-bottom">
          <div className="profile-chip">
            <span className="profile-avatar">{user.name.trim().charAt(0).toUpperCase() || "S"}</span>
            <span className="profile-info"><b>{user.name}</b><small>{user.email}</small></span>
            <ThemeToggle className="side-theme-toggle" />
            <button className="icon-button" type="button" aria-label="Sign out" title="Sign out" disabled={signingOut} onClick={signOut}><LogOut size={15} /></button>
          </div>
        </div>
      </aside>
      <div className="main-region">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={17} /></button><div className="topbar-title">Life OS <span aria-hidden="true">/</span> <b>{title}</b></div></div>
          <div className="topbar-actions">
            <span className="badge"><span className="status-dot" /> Private workspace</span>
            <ThemeToggle />
            <button className="icon-button" type="button" aria-label="Settings" title="Settings" onClick={() => router.push("/dashboard/settings")}><Settings2 size={15} /></button>
          </div>
        </header>
        <main className="content-wrap">{children}</main>
      </div>
    </div>
  );
}
