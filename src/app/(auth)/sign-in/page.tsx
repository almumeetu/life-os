import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, translate } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const locale = await getLocale();
  const t = (message: string) => translate(locale, message);
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/dashboard") ? next : "/dashboard";

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand-row">
          <Link className="brand" href="/sign-in"><span className="brand-mark">L</span> Life OS</Link>
          <div className="auth-header-actions"><LanguageToggle locale={locale} /><ThemeToggle locale={locale} /></div>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">{t("YOUR PERSONAL WORKSPACE · ব্যক্তিগত ওয়ার্কস্পেস")}</span>
          <h1>{t("Make room for what matters.")}</h1>
          <p>{t("One calm place to plan your next step, keep your routines and see your progress.")}</p>
        </div>
        <AuthForm mode="sign-in" nextPath={nextPath} locale={locale} />
        <div className="auth-footnote">{t("Your personal data is encrypted & protected behind your account.")}</div>
      </section>
      <aside className="auth-art" aria-label={t("Life OS feature overview")}>
        <div className="art-orb art-orb-one" />
        <div className="art-orb art-orb-two" />
        <div className="art-note note-top"><span aria-hidden="true">✦</span><div><b>{t("A little progress, every day")}</b><small>{t("Habits that add up over time")}</small></div></div>
        <div className="art-dashboard">
          <div className="art-dash-heading"><span>{formatDate(locale, new Date(), { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" }).toLocaleUpperCase(locale === "bn" ? "bn-BD" : "en-BD")}</span><span className="avatar-dot">S</span></div>
          <div className="art-greeting">{t("A clearer week")}<br /><em>{t("starts here.")}</em></div>
          <div className="art-progress-label"><span>{t("Weekly focus")}</span><b>68%</b></div>
          <div className="art-progress"><i /></div>
          <div className="art-tasks">
            <div><span className="fake-check checked" aria-hidden="true">✓</span><span>{t("Review study shortlist")}</span><small>{t("DONE")}</small></div>
            <div><span className="fake-check" aria-hidden="true" /><span>{t("Prepare for IELTS")}</span><small>{t("TODAY")}</small></div>
            <div><span className="fake-check" aria-hidden="true" /><span>{t("Take a proper walk")}</span><small>7:00 PM</small></div>
          </div>
        </div>
        <div className="art-note note-bottom"><span aria-hidden="true">↗</span><div><b>{t("Life, in one view")}</b><small>{t("Plans · Money · Momentum")}</small></div></div>
      </aside>
    </main>
  );
}
