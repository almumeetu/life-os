import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";

import { ThemeToggle } from "@/components/theme-toggle";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/dashboard") ? next : "/dashboard";

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand-row">
          <Link className="brand" href="/sign-in"><span className="brand-mark">L</span> Life OS</Link>
          <ThemeToggle />
        </div>
        <div className="auth-copy">
          <span className="eyebrow">YOUR PERSONAL WORKSPACE · ব্যক্তিগত ওয়ার্কস্পেস</span>
          <h1>Make room for what matters.</h1>
          <p>One calm place to plan your next step, keep your routines and see your progress.</p>
        </div>
        <AuthForm mode="sign-in" nextPath={nextPath} />
        <div className="auth-footnote">Your personal data is encrypted &amp; protected behind your account.</div>
      </section>
      <aside className="auth-art" aria-label="Life OS feature overview">
        <div className="art-orb art-orb-one" />
        <div className="art-orb art-orb-two" />
        <div className="art-note note-top"><span>✦</span><div><b>A little progress, every day</b><small>Habits that add up over time</small></div></div>
        <div className="art-dashboard">
          <div className="art-dash-heading"><span>MONDAY, OCTOBER 19</span><span className="avatar-dot">S</span></div>
          <div className="art-greeting">A clearer week<br /><em>starts here.</em></div>
          <div className="art-progress-label"><span>Weekly focus</span><b>68%</b></div>
          <div className="art-progress"><i /></div>
          <div className="art-tasks">
            <div><span className="fake-check checked">✓</span><span>Review study shortlist</span><small>DONE</small></div>
            <div><span className="fake-check" /><span>Prepare for IELTS</span><small>TODAY</small></div>
            <div><span className="fake-check" /><span>Take a proper walk</span><small>7:00 PM</small></div>
          </div>
        </div>
        <div className="art-note note-bottom"><span>↗</span><div><b>Life, in one view</b><small>Plans · Money · Momentum</small></div></div>
      </aside>
    </main>
  );
}
