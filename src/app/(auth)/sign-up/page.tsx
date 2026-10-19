import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";

import { ThemeToggle } from "@/components/theme-toggle";

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand-row">
          <Link className="brand" href="/sign-in"><span className="brand-mark">L</span> Life OS</Link>
          <ThemeToggle />
        </div>
        <div className="auth-copy">
          <span className="eyebrow">A FRESH START · নতুন শুরু</span>
          <h1>Build a life that feels like yours.</h1>
          <p>Create your private workspace. You can start with one small task and add the rest when you need it.</p>
        </div>
        <AuthForm mode="sign-up" nextPath="/dashboard" />
        <div className="auth-footnote">By creating an account, your data remains 100% private and protected.</div>
      </section>
      <aside className="auth-art signup-art" aria-hidden="true">
        <div className="art-orb art-orb-one" />
        <div className="art-orb art-orb-two" />
        <div className="signup-quote"><span className="eyebrow">START WHERE YOU ARE</span><p>“Small steps every day add up to big change.”</p><div className="quote-line" /></div>
        <div className="signup-pills"><span>✦ Make a plan</span><span>↗ Track your growth</span><span>♡ Protect your balance</span></div>
      </aside>
    </main>
  );
}
