import Link from "next/link";
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Check, FileText, Globe2, Languages, Mic, Sparkles, Clock3, Gamepad2 } from "lucide-react";
import { EmptyState, MetricCard, PageHeader, Panel } from "@/components/ui";
import { toggleLifeItem } from "@/lib/actions/life";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";
import { SPOKEN_ENGLISH_BOOK_LESSONS } from "@/lib/speaking-course";

const modules = [
  { href: "/dashboard/learn", title: "Read & learn", description: "Read your books with a simple Bangla study guide.", icon: BookOpenCheck, tone: "orange" },
  { href: "/dashboard/practice", title: "Mini challenges", description: "Play, discover and practise useful English.", icon: Gamepad2, tone: "purple" },
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
  const dhakaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(now);
  const today = new Date(`${dhakaDate}T00:00:00+06:00`);
  const firstName = user.name.trim().split(/\s+/)[0] || t("there");

  const [goal, ieltsSessions, speakingSessions, speakingLessonAttempts, interviewSessions, activeJobs, nextSteps, deadlines] = await Promise.all([
    prisma.ieltsGoal.findUnique({ where: { userId: user.id } }),
    prisma.ieltsPractice.count({ where: { userId: user.id } }),
    prisma.speakingAttempt.count({ where: { userId: user.id } }),
    prisma.speakingAttempt.findMany({ where: { userId: user.id, topic: { in: SPOKEN_ENGLISH_BOOK_LESSONS.map((lesson) => lesson.id) } }, select: { topic: true }, distinct: ["topic"] }),
    prisma.interviewAttempt.count({ where: { userId: user.id, category: "job" } }),
    prisma.application.count({ where: { userId: user.id, kind: "Job", status: { notIn: ["Offer", "Rejected"] } } }),
    prisma.lifeItem.findMany({ where: { userId: user.id, area: "abroad", completed: false }, orderBy: [{ dueAt: "asc" }, { priority: "asc" }, { createdAt: "asc" }], take: 5 }),
    prisma.application.findMany({ where: { userId: user.id, kind: { in: ["Job", "University", "Scholarship"] }, deadline: { gte: today }, status: { notIn: ["Offer", "Rejected"] } }, orderBy: { deadline: "asc" }, take: 5 }),
  ]);
  const completedSpeakingIds = new Set(speakingLessonAttempts.map((attempt) => attempt.topic));
  const nextSpeakingLesson = SPOKEN_ENGLISH_BOOK_LESSONS.find((lesson) => !completedSpeakingIds.has(lesson.id));
  const courseProgress = Math.round(completedSpeakingIds.size / SPOKEN_ENGLISH_BOOK_LESSONS.length * 100);

  const dateLabel = formatDate(locale, now, { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" });
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "numeric", hourCycle: "h23" }).format(now));
  const greeting = t(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

  return <>
    <PageHeader eyebrow={dateLabel} title={`${greeting}, ${firstName}`} description={t("A little practice today. A more confident you tomorrow.")} actions={<Link className="button button-secondary" href="/dashboard/learn"><BookOpenCheck size={16} />{t("Open my books")}</Link>} />

    <div className="learning-home-hero">
      <section className="learning-hero-main">
        <span className="hero-kicker"><span className="status-dot" />{t("YOUR NEXT SMALL WIN")}</span>
        <h2>{t("Your next chapter starts with one small step.")}</h2>
        <p>{t("Read a little. Say it out loud. Discover what you can do.")}</p>
        <Link className="button hero-start" href={completedSpeakingIds.size ? "/dashboard/speaking" : "/dashboard/learn"}>{completedSpeakingIds.size ? t("Continue speaking practice") : t("Start my learning journey")}<ArrowRight size={18} /></Link>
        <div className="hero-course-progress">
          <div><span>{t("Spoken English course")}</span><b>{formatNumber(locale, completedSpeakingIds.size)} / {formatNumber(locale, SPOKEN_ENGLISH_BOOK_LESSONS.length)}</b></div>
          <progress max={SPOKEN_ENGLISH_BOOK_LESSONS.length} value={completedSpeakingIds.size} aria-label={t("Speaking lessons complete")} />
          <small>{nextSpeakingLesson ? `${t("Next up:")} ${t(nextSpeakingLesson.title)}` : t("All lessons completed")}</small>
        </div>
        <span className="hero-decoration" aria-hidden="true"><Languages size={100} strokeWidth={1} /></span>
      </section>
      <section className="learning-hero-play">
        <div className="play-card-top"><span className="play-icon"><Gamepad2 size={27} /></span><span className="badge"><Clock3 size={13} />{t("2-minute practice")}</span></div>
        <span className="eyebrow">{t("SMALL CHALLENGE. BIG SMILE.")}</span>
        <h2>{t("A little play. A lot to learn.")}</h2>
        <p>{t("Try four quick questions. Find the answer, learn the why, and make it stick.")}</p>
        <div className="play-example" aria-hidden="true"><span lang="en">I learn a little</span><b lang="en">every day.<Sparkles size={17} /></b></div>
        <Link className="button button-secondary" href="/dashboard/practice">{t("Let's try a challenge")}<ArrowRight size={17} /></Link>
      </section>
    </div>

    <section className="learning-path" aria-labelledby="learning-path-title">
      <div className="home-section-heading"><div><span className="eyebrow">{t("KEEP IT SIMPLE")}</span><h2 id="learning-path-title">{t("Your feel-good learning routine")}</h2></div><span className="badge"><Clock3 size={13} />{t("About 15 minutes")}</span></div>
      <div className="learning-path-steps">
        {[
          { href: "/dashboard/learn", title: "Read & discover", description: "One page. A few new ideas.", icon: BookOpenCheck, time: "5 min" },
          { href: "/dashboard/practice", title: "Play & understand", description: "A small challenge with helpful explanations.", icon: Gamepad2, time: "2 min" },
          { href: "/dashboard/speaking", title: "Speak & grow", description: "Use what you learned in your own words.", icon: Mic, time: "8 min" },
        ].map(({ href, title, description, icon: Icon, time }, index) => <Link className="learning-path-step" href={href} key={href}><span className="path-step-number">{formatNumber(locale, index + 1)}</span><span className="path-step-copy"><b>{t(title)}</b><small>{t(description)}</small><span><Icon size={13} />{t(time)}</span></span><ArrowRight size={17} /></Link>)}
      </div>
    </section>

    <div className="metric-grid">
      <MetricCard label={t("Speaking lessons complete")} value={`${formatNumber(locale, courseProgress)}%`} note={t("{count} speaking practice sessions", { count: formatNumber(locale, speakingSessions) })} icon={<Languages size={17} />} />
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
