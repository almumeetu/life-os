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
  Mic,
  Settings2,
  Target,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LIFE_AREAS } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { translate, type Locale } from "@/lib/i18n";

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

export function AppShell({ user, children, locale }: { user: { id: string; name: string; email: string }; children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const activeLabel = [...mainNavigation, ...LIFE_AREAS.map((area) => ({ href: `/dashboard/areas/${area.id}`, label: area.label, icon: areaIcons[area.id] }))].find((item) => isActive(item.href))?.label || "Life OS";
  const title = translate(locale, activeLabel);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><Link className="brand" href="/dashboard"><span className="brand-mark">L</span> Life OS</Link></div>
        <div className="workspace-pill"><span className="workspace-icon"><Activity size={16} /></span><span><b>{translate(locale, "Personal workspace")}</b><small>{translate(locale, "Your life, in one view")}</small></span><ChevronRight size={14} aria-hidden="true" /></div>
        <nav className="side-nav" aria-label={translate(locale, "Main navigation")}>
          <div className="nav-group">
            <div className="nav-label">{translate(locale, "Workspace")}</div>
            {mainNavigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} className={`nav-link ${isActive(href) ? "active" : ""}`} data-icon={href === "/dashboard" ? "overview" : href.split("/").at(-1)} href={href} aria-current={isActive(href) ? "page" : undefined}>
                <span className="nav-icon" aria-hidden="true"><Icon size={17} strokeWidth={2} /></span><span>{translate(locale, label)}</span>
              </Link>
            ))}
          </div>
          <div className="nav-group">
            <div className="nav-label">{translate(locale, "Life areas")}</div>
            {LIFE_AREAS.map((area) => {
              const Icon = areaIcons[area.id];
              const href = `/dashboard/areas/${area.id}`;
              return <Link key={area.id} className={`nav-link ${isActive(href) ? "active" : ""}`} data-icon={area.id} href={href} aria-current={isActive(href) ? "page" : undefined}><span className="nav-icon" aria-hidden="true"><Icon size={17} strokeWidth={2} /></span><span>{translate(locale, area.label)}</span></Link>;
            })}
          </div>
          <div className="nav-group">
            <div className="nav-label">{translate(locale, "Account")}</div>
            <Link className={`nav-link ${isActive("/dashboard/settings") ? "active" : ""}`} data-icon="settings" href="/dashboard/settings"><span className="nav-icon" aria-hidden="true"><Settings2 size={17} strokeWidth={2} /></span><span>{translate(locale, "Settings & backup")}</span></Link>
            <Link className="nav-link" data-icon="help" href="/dashboard/settings#help"><span className="nav-icon" aria-hidden="true"><CircleHelp size={17} strokeWidth={2} /></span><span>{translate(locale, "Help & privacy")}</span></Link>
          </div>
        </nav>
        <div className="side-bottom">
          <div className="profile-chip">
            <span className="profile-avatar">{user.name.trim().charAt(0).toUpperCase() || "S"}</span>
            <span className="profile-info"><b>{user.name}</b><small>{user.email}</small></span>
            <ThemeToggle locale={locale} className="side-theme-toggle" />
            <button className="icon-button" type="button" aria-label={translate(locale, "Sign out")} title={translate(locale, "Sign out")} onClick={signOut}><LogOut size={15} aria-hidden="true" /></button>
          </div>
        </div>
      </aside>
      <div className="main-region">
        <header className="topbar">
          <div className="topbar-left"><div className="topbar-title">Life OS <span aria-hidden="true">/</span> <b>{title}</b></div></div>
          <div className="topbar-actions">
            <span className="badge"><span className="status-dot" aria-hidden="true" /> {translate(locale, "Private workspace")}</span>
            <LanguageToggle locale={locale} />
            <ThemeToggle locale={locale} />
            <button className="icon-button" type="button" aria-label={translate(locale, "Settings")} title={translate(locale, "Settings")} onClick={() => router.push("/dashboard/settings")}><Settings2 size={15} aria-hidden="true" /></button>
          </div>
        </header>
        <main className="content-wrap">{children}</main>
      </div>
    </div>
  );
}
