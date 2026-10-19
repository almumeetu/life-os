import { Languages } from "lucide-react";
import Link from "next/link";
import { SpeakingPractice } from "@/components/speaking-practice";
import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatNumber, translate } from "@/lib/i18n";
import { ALL_SPEAKING_LESSONS } from "@/lib/speaking-course";

export default async function SpeakingPage() {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string) => translate(locale, message);
  const [history, completedLessons] = await Promise.all([
    prisma.speakingAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.speakingAttempt.findMany({ where: { userId: user.id, topic: { in: ALL_SPEAKING_LESSONS.map((lesson) => lesson.id) } }, select: { topic: true }, distinct: ["topic"] }),
  ]);
  const completedLessonIds = completedLessons.map((attempt) => attempt.topic);

  return <>
    <PageHeader eyebrow={t("BUILD CONFIDENCE BY SPEAKING")}
      title={t("English speaking practice")}
      description={t("Follow the 60 classes in your Spoken English book, or switch to the IELTS and interview course. Listen, repeat, speak, and review your progress.")}
      actions={<span className="badge"><Languages size={12} /> {formatNumber(locale, completedLessonIds.length)} {t("speaking classes completed")}</span>} />
    <div className="beginner-entry-banner" lang="bn"><div><b>বইটি কোথায় পড়বেন?</b><p>বই পড়ে শিখি → Spoken English → প্রথম পাঠ। তারপর এখানে এসে শুনুন, বলুন ও উত্তর সংরক্ষণ করুন।</p></div><Link className="button button-primary" href="/dashboard/learn?book=spoken">বই ও বাংলা সহায়িকা খুলুন</Link></div>
    <SpeakingPractice locale={locale} history={history} completedLessonIds={completedLessonIds} />
  </>;
}
