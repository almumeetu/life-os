import Link from "next/link";
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Check, FileText, Globe2, Languages, Mic, Sparkles } from "lucide-react";
import { EmptyState, MetricCard, PageHeader, Panel } from "@/components/ui";
import { toggleLifeItem } from "@/lib/actions/life";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";
import { SPEAKING_LESSONS } from "@/lib/speaking-course";

const modules = [
  { href: "/dashboard/learn", title: "Read & learn", description: "Read your books with a simple Bangla study guide.", icon: BookOpenCheck, tone: "orange" },
  { href: "/dashboard/speaking", title: "English speaking", description: "Follow the daily course and hear spoken feedback.", icon: Languages, tone: "green" },
  { href: "/dashboard/interview", title: "Interview prep", description: "Rehearse job and university interview answers.", icon: Mic, tone: "purple" },
  { href: "/dashboard/ielts", title: "IELTS prep", description: "Set a target band and log practice for each skill.", icon: BookOpenCheck, tone: "blue" },
  { href: "/dashboard/jobs", title: "Job search", description: "Keep roles, follow-ups and application stages together.", icon: BriefcaseBusiness, tone: "orange" },
  { href: "/dashboard/study-abroad", title: "Study abroad", description: "Track requirements, universities and scholarships.", icon: Globe2, tone: "blue" },
  { href: "/dashboard/documents", title: "Documents", description: "Keep private copies of your application documents.", icon: FileText, tone: "slate" },
];

export default async function DashboardPage() {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const now = new Date();
  const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
  const firstName = user.name.trim().split(/\s+/)[0] || t("there");

  const [goal, ieltsSessions, speakingSessions, speakingLessonAttempts, interviewSessions, activeJobs, nextSteps, deadlines] = await Promise.all([
    prisma.ieltsGoal.findUnique({ where: { userId: user.id } }),
    prisma.ieltsPractice.count({ where: { userId: user.id } }),
    prisma.speakingAttempt.count({ where: { userId: user.id } }),
    prisma.speakingAttempt.findMany({ where: { userId: user.id, topic: { in: SPEAKING_LESSONS.map((lesson) => lesson.id) } }, select: { topic: true }, distinct: ["topic"] }),
    prisma.interviewAttempt.count({ where: { userId: user.id, category: "job" } }),
    prisma.application.count({ where: { userId: user.id, kind: "Job", status: { notIn: ["Offer", "Rejected"] } } }),
    prisma.lifeItem.findMany({ where: { userId: user.id, area: "abroad", completed: false }, orderBy: [{ dueAt: "asc" }, { priority: "asc" }, { createdAt: "asc" }], take: 5 }),
    prisma.application.findMany({ where: { userId: user.id, kind: { in: ["Job", "University", "Scholarship"] }, deadline: { gte: today }, status: { notIn: ["Offer", "Rejected"] } }, orderBy: { deadline: "asc" }, take: 5 }),
  ]);
  const completedSpeakingIds = new Set(speakingLessonAttempts.map((attempt) => attempt.topic));
  const nextSpeakingLesson = SPEAKING_LESSONS.find((lesson) => !completedSpeakingIds.has(lesson.id));

  const dateLabel = formatDate(locale, now, { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" });
  const greeting = t(now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening");

  return <>
    <PageHeader eyebrow={t("YOUR ENGLISH SPEAKING WORKSPACE")} title={`${greeting}, ${firstName}`} description={`${dateLabel} · ${t("Choose one useful next step for your future.")}`} />

    <section className="welcome-banner focused-welcome speaking-welcome">
      <div>
        <span className="welcome-eyebrow"><Sparkles size={13} aria-hidden="true" /> {t("YOUR DAILY ENGLISH SPEAKING PLAN")}</span>
        <h2>{t("Speak English with confidence, one lesson at a time.")}</h2>
        <p>{t("Listen to a clear English model, practise out loud, and hear spoken feedback after every answer.")}</p>
        <div className="welcome-actions">
          <Link className="button welcome-button" href="/dashboard/learn">{t("Open book and Bangla guide")} <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link className="button welcome-button" href="/dashboard/speaking">{nextSpeakingLesson ? t("Continue speaking practice") : t("Review speaking course")} <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link className="welcome-link" href="/dashboard/ielts">{t("Open IELTS speaking practice")}</Link>
        </div>
      </div>
      <div className="welcome-progress">
        <span className="welcome-progress-icon"><Languages size={18} /></span>
        <small>{t("STEP-BY-STEP SPEAKING COURSE")}</small>
        <b>{formatNumber(locale, completedSpeakingIds.size)}<em> / {formatNumber(locale, SPEAKING_LESSONS.length)}</em></b>
        <span>{nextSpeakingLesson ? t(nextSpeakingLesson.title) : t("All lessons completed")}</span>
        <div className="progress-track"><i style={{ width: `${Math.round(completedSpeakingIds.size / SPEAKING_LESSONS.length * 100)}%` }} /></div>
      </div>
      <div className="welcome-spark spark-one">✳</div><div className="welcome-spark spark-two">✦</div>
    </section>

    <div className="metric-grid">
      <MetricCard label={t("Speaking lessons complete")} value={`${formatNumber(locale, completedSpeakingIds.size)} / ${formatNumber(locale, SPEAKING_LESSONS.length)}`} note={t("{count} speaking practice sessions", { count: formatNumber(locale, speakingSessions) })} icon={<Languages size={17} />} />
      <MetricCard label={t("IELTS target band")} value={goal ? goal.targetBand.toFixed(1) : "—"} note={t("{count} practice sessions", { count: formatNumber(locale, ieltsSessions) })} icon={<BookOpenCheck size={17} />} />
      <MetricCard label={t("Interview answers saved")} value={formatNumber(locale, interviewSessions)} note={t("Job interview practice")} icon={<Mic size={17} />} />
      <MetricCard label={t("Active job applications")} value={formatNumber(locale, activeJobs)} note={t("Roles still in progress")} icon={<BriefcaseBusiness size={17} />} />
    </div>

    <Panel title={t("Your preparation areas")} subtitle={t("Open one focused area and continue where you left off.")}>
      <div className="area-grid preparation-grid">{modules.map(({ href, title, description, icon: Icon, tone }) => <Link className="area-card" href={href} key={href}><span className={`area-card-icon tone-${tone}`} aria-hidden="true"><Icon size={19} strokeWidth={2.1} /></span><b>{t(title)}</b><small>{t(description)}</small></Link>)}</div>
    </Panel>

    <div className="dashboard-grid focused-dashboard-grid">
      <Panel title={t("Next study-abroad steps")} subtitle={t("A short view of your open requirements.")} action={<Link className="text-link" href="/dashboard/study-abroad">{t("View checklist")} <ArrowRight size={13} /></Link>}>
        {nextSteps.length ? <div className="list">{nextSteps.map((item) => <div className="list-row" key={item.id}><form action={toggleLifeItem}><input type="hidden" name="id" value={item.id} /><button className="check-button" type="submit" aria-label={t("Complete {title}", { title: item.title })}><Check size={12} /></button></form><div className="list-main"><b>{t(item.title)}</b><small>{item.dueAt ? t("Due {date}", { date: formatDate(locale, item.dueAt, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }) }) : t("Study abroad requirement")}</small></div></div>)}</div> : <EmptyState title={t("Your checklist is clear")} description={t("Add a study-abroad requirement when you are ready.")} icon={<Check size={17} />} />}
      </Panel>
      <Panel title={t("Upcoming dates")} subtitle={t("Jobs, universities and scholarships.")} action={<Link className="text-link" href="/dashboard/jobs">{t("Open job search")} <ArrowRight size={13} /></Link>}>
        {deadlines.length ? <div className="list">{deadlines.map((item) => <div className="list-row" key={item.id}><span className="deadline-icon"><BriefcaseBusiness size={16} /></span><div className="list-main"><b>{item.title}</b><small>{item.organization || t(item.kind)}</small></div><span className="list-meta">{item.deadline && formatDate(locale, item.deadline, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })}</span></div>)}</div> : <EmptyState title={t("No upcoming dates")} description={t("Add an application deadline to keep it visible here.")} icon={<BriefcaseBusiness size={17} />} />}
      </Panel>
    </div>
  </>;
}
