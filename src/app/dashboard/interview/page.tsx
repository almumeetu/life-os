import { Mic, Sparkles } from "lucide-react";
import { InterviewPractice } from "@/components/interview-practice";
import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatNumber, translate } from "@/lib/i18n";

export default async function InterviewPage() {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string) => translate(locale, message);
  const history = await prisma.interviewAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 });
  const words = history.reduce((total, attempt) => total + attempt.wordCount, 0);

  return <>
    <PageHeader eyebrow={t("CAREER & STUDY ABROAD")} title={t("Interview practice")} description={t("Practice job and admission questions, save your answers and build confidence a little at a time.")} actions={<span className="badge"><Sparkles size={12} /> {formatNumber(locale, history.length)} {t("saved answers")}</span>} />
    <div className="interview-summary"><span className="interview-summary-icon"><Mic size={17} /></span><div><b>{history.length ? `${formatNumber(locale, words)} ${t("words practiced")}` : t("A low-pressure place to rehearse")}</b><small>{history.length ? t("Your recent practice is saved privately in your workspace.") : t("Start with a question, answer out loud or type, then save your practice.")}</small></div></div>
    <InterviewPractice history={history} locale={locale} />
  </>;
}
