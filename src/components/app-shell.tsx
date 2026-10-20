"use client";

import {
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe2,
  Gamepad2,
  Home,
  LogOut,
  Languages,
  Menu,
  Mic,
  Settings2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { translate, type Locale } from "@/lib/i18n";

const navigationGroups = [
  { label: "Start here", items: [{ href: "/dashboard", label: "Overview", icon: Home }] },
  { label: "Learn & practise", items: [
    { href: "/dashboard/learn", label: "Read & learn", icon: BookOpenCheck },
    { href: "/dashboard/practice", label: "Mini challenges", icon: Gamepad2 },
    { href: "/dashboard/speaking", label: "English speaking", icon: Languages },
    { href: "/dashboard/interview", label: "Interview prep", icon: Mic },
    { href: "/dashboard/ielts", label: "IELTS prep", icon: BookOpenCheck },
  ] },
  { label: "Next opportunities", items: [
    { href: "/dashboard/jobs", label: "Job search", icon: BriefcaseBusiness },
    { href: "/dashboard/study-abroad", label: "Study abroad", icon: Globe2 },
  ] },
  { label: "My files", items: [{ href: "/dashboard/documents", label: "Documents", icon: FileText }] },
];
const mainNavigation = navigationGroups.flatMap((group) => group.items);

export function AppShell({ user, children, locale }: { user: { id: string; name: string; email: string }; children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      } else if (event.key === "Tab" && sidebarRef.current) {
        const focusable = Array.from(sidebarRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    const mobileViewport = window.matchMedia("(max-width: 800px)");
    function handleViewportChange() {
      if (!mobileViewport.matches) setMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    mobileViewport.addEventListener("change", handleViewportChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      mobileViewport.removeEventListener("change", handleViewportChange);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    if (menuOpen) menuButtonRef.current?.focus();
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }

  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const activeLabel = [...mainNavigation, { href: "/dashboard/settings", label: "Settings", icon: Settings2 }].find((item) => isActive(item.href))?.label || "Overview";
  const title = translate(locale, activeLabel);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" inert={menuOpen}>{translate(locale, "Skip to content")}</a>
      {menuOpen && <button className="mobile-overlay" type="button" aria-label={translate(locale, "Close navigation")} onClick={closeMenu} />}
      <aside ref={sidebarRef} id="app-sidebar" className={`sidebar ${menuOpen ? "open" : ""}`} role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen || undefined} aria-label={translate(locale, "Main navigation")}>
        <div className="sidebar-brand">
          <Link className="brand" href="/dashboard" onClick={closeMenu}><span className="brand-mark">P</span><span>{translate(locale, "Preparation Hub")}<small>{translate(locale, "Your learning workspace")}</small></span></Link>
          <button ref={closeButtonRef} className="icon-button sidebar-close" type="button" aria-label={translate(locale, "Close navigation")} onClick={() => { closeMenu(); menuButtonRef.current?.focus(); }}><X size={18} /></button>
        </div>
        <Link className="workspace-pill" href="/dashboard/learn" onClick={closeMenu}>
          <span className="workspace-icon"><Languages size={20} /></span>
          <span className="workspace-copy"><b>{translate(locale, "Read & learn")}</b><small>{translate(locale, "Start with the beginner guide")}</small></span>
          <ChevronRight size={17} aria-hidden="true" />
        </Link>
        <nav className="side-nav" aria-label={translate(locale, "Main navigation")}>
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{translate(locale, group.label)}</div>
              {group.items.map(({ href, label, icon: Icon }) => (
                <Link key={href} className={`nav-link ${isActive(href) ? "active" : ""}`} href={href} aria-current={isActive(href) ? "page" : undefined} onClick={closeMenu}>
                  <span className="nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={2} /></span><span>{translate(locale, label)}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="profile-chip">
            <span className="profile-avatar">{user.name.trim().charAt(0).toUpperCase() || "S"}</span>
            <span className="profile-info"><b>{user.name}</b><small>{user.email}</small></span>
          </div>
          <div className="sidebar-utilities">
            <Link className={`nav-link ${isActive("/dashboard/settings") ? "active" : ""}`} href="/dashboard/settings" onClick={closeMenu}><Settings2 size={18} aria-hidden="true" /><span>{translate(locale, "Settings & backup")}</span></Link>
            <Link className="nav-link" href="/dashboard/settings#help" onClick={closeMenu}><CircleHelp size={18} aria-hidden="true" /><span>{translate(locale, "Help & privacy")}</span></Link>
            <button className="nav-link sign-out-button" type="button" onClick={signOut} disabled={signingOut}><LogOut size={18} aria-hidden="true" /><span>{translate(locale, signingOut ? "Please wait…" : "Sign out")}</span></button>
            {signOutError && <p className="sidebar-error" role="alert">{translate(locale, "Could not sign out. Please try again.")}</p>}
          </div>
        </div>
      </aside>
      <div className="main-region" inert={menuOpen}>
        <header className="topbar">
          <div className="topbar-left"><button ref={menuButtonRef} className="icon-button mobile-menu-button" type="button" aria-label={translate(locale, "Open navigation")} aria-controls="app-sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="topbar-title"><span className="topbar-workspace-name">{translate(locale, "Preparation Hub")}</span> <span aria-hidden="true">/</span> <b>{title}</b></div></div>
          <div className="topbar-actions">
            <span className="badge"><span className="status-dot" aria-hidden="true" /> {translate(locale, "Private workspace")}</span>
            <LanguageToggle locale={locale} />
            <ThemeToggle locale={locale} />
            <button className="icon-button" type="button" aria-label={translate(locale, "Settings")} title={translate(locale, "Settings")} onClick={() => router.push("/dashboard/settings")}><Settings2 size={15} aria-hidden="true" /></button>
          </div>
        </header>
        <main id="main-content" className="content-wrap" tabIndex={-1}>{children}</main>
      </div>
      <nav className="mobile-quick-nav" aria-label={translate(locale, "Quick navigation")} inert={menuOpen}>
        {[
          { href: "/dashboard", label: "Overview", icon: Home },
          { href: "/dashboard/learn", label: "Read & learn", icon: BookOpenCheck },
          { href: "/dashboard/practice", label: "Mini challenges", icon: Gamepad2 },
          { href: "/dashboard/speaking", label: "English speaking", icon: Languages },
        ].map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={isActive(href) ? "active" : ""} aria-current={isActive(href) ? "page" : undefined}><Icon size={20} aria-hidden="true" /><span>{translate(locale, label)}</span></Link>)}
      </nav>
    </div>
  );
}
