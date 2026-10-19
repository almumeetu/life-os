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
          <Link className="brand" href="/sign-in"><span className="brand-mark">P</span> {t("Preparation Hub")}</Link>
          <div className="auth-header-actions"><LanguageToggle locale={locale} /><ThemeToggle locale={locale} /></div>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">{t("YOUR PREPARATION WORKSPACE")}</span>
          <h1>{t("Get ready for your next step.")}</h1>
          <p>{t("Prepare for interviews and IELTS, practise English, search for jobs and organize your study-abroad plans.")}</p>
        </div>
        <AuthForm mode="sign-in" nextPath={nextPath} locale={locale} />
        <div className="auth-footnote">{t("Your workspace is linked to your account. Personal documents are only downloadable after sign-in.")}</div>
      </section>
      <aside className="auth-art" aria-label={t("Preparation Hub feature overview")}>
        <div className="art-orb art-orb-one" />
        <div className="art-orb art-orb-two" />
        <div className="art-note note-top"><span aria-hidden="true">✦</span><div><b>{t("Prepare with a clear plan")}</b><small>{t("Practise a little every day")}</small></div></div>
        <div className="art-dashboard">
          <div className="art-dash-heading"><span>{formatDate(locale, new Date(), { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" }).toLocaleUpperCase(locale === "bn" ? "bn-BD" : "en-BD")}</span><span className="avatar-dot">S</span></div>
          <div className="art-greeting">{t("Your next opportunity")}<br /><em>{t("starts here.")}</em></div>
          <div className="art-progress-label"><span>{t("Preparation progress")}</span><b>68%</b></div>
          <div className="art-progress"><i /></div>
          <div className="art-tasks">
            <div><span className="fake-check checked" aria-hidden="true">✓</span><span>{t("Practise an interview answer")}</span><small>{t("DONE")}</small></div>
            <div><span className="fake-check" aria-hidden="true" /><span>{t("Complete one IELTS task")}</span><small>{t("TODAY")}</small></div>
            <div><span className="fake-check" aria-hidden="true" /><span>{t("Follow up on a job")}</span><small>{t("NEXT")}</small></div>
          </div>
        </div>
        <div className="art-note note-bottom"><span aria-hidden="true">↗</span><div><b>{t("Keep moving forward")}</b><small>{t("English · Career · Study")}</small></div></div>
      </aside>
    </main>
  );
}
