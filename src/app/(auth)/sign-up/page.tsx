import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { translate } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const locale = await getLocale();
  const t = (message: string) => translate(locale, message);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand-row">
          <Link className="brand" href="/sign-in"><span className="brand-mark">L</span> Life OS</Link>
          <div className="auth-header-actions"><LanguageToggle locale={locale} /><ThemeToggle locale={locale} /></div>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">{t("A FRESH START · নতুন শুরু")}</span>
          <h1>{t("Build a life that feels like yours.")}</h1>
          <p>{t("Create your private workspace. You can start with one small task and add the rest when you need it.")}</p>
        </div>
        <AuthForm mode="sign-up" nextPath="/dashboard" locale={locale} />
        <div className="auth-footnote">{t("By creating an account, your data remains 100% private and protected.")}</div>
      </section>
      <aside className="auth-art signup-art" aria-hidden="true">
        <div className="art-orb art-orb-one" />
        <div className="art-orb art-orb-two" />
        <div className="signup-quote"><span className="eyebrow">{t("START WHERE YOU ARE")}</span><p>{t("“Small steps every day add up to big change.”")}</p><div className="quote-line" /></div>
        <div className="signup-pills"><span>{t("✦ Make a plan")}</span><span>{t("↗ Track your growth")}</span><span>{t("♡ Protect your balance")}</span></div>
      </aside>
    </main>
  );
}
