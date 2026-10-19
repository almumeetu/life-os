import { BookOpenCheck, CalendarDays, Clock3, Headphones, PencilLine, Target, Trash2 } from "lucide-react";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { deleteIeltsPractice, saveIeltsGoal, saveIeltsPractice } from "@/lib/actions/ielts";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";
import { IELTS_BOOK_CHAPTERS } from "@/lib/ielts-course";
import { IeltsStudyPlan } from "@/components/ielts-study-plan";

const skills = ["Listening", "Reading", "Writing", "Speaking"] as const;
const bands = Array.from({ length: 11 }, (_, index) => 4 + index / 2);
const todayValue = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export default async function IeltsPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const [goal, practices, aggregate, chapterPractices] = await Promise.all([
    prisma.ieltsGoal.findUnique({ where: { userId: user.id } }),
    prisma.ieltsPractice.findMany({ where: { userId: user.id }, orderBy: { practicedAt: "desc" }, take: 30 }),
    prisma.ieltsPractice.aggregate({ where: { userId: user.id }, _sum: { durationMinutes: true }, _avg: { bandScore: true } }),
    prisma.ieltsPractice.findMany({ where: { userId: user.id, note: { startsWith: "[IELTS-CHAPTER:" } }, select: { note: true } }),
  ]);
  const completedChapterIds = chapterPractices.flatMap(({ note }) => {
    const match = note.match(/^\[IELTS-CHAPTER:([a-z0-9-]+)\]/);
    return match && IELTS_BOOK_CHAPTERS.some((chapter) => chapter.id === match[1]) ? [match[1]] : [];
  });
  const targetDate = goal?.examDate ? formatDate(locale, goal.examDate, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }) : t("Not set");

  return <>
    <PageHeader eyebrow={t("BUILD YOUR ENGLISH SCORE")} title={t("IELTS preparation")} description={t("Follow the chapters from your IELTS book, hear each practice task, and keep a clear record across all four skills.")} actions={<span className="badge"><BookOpenCheck size={12} /> {formatNumber(locale, practices.length)} {t("sessions")}</span>} />
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="metric-grid">
      <MetricCard label={t("Target band")} value={goal?.targetBand.toFixed(1) || "—"} note={t("Exam date: {date}", { date: targetDate })} icon={<Target size={17} />} />
      <MetricCard label={t("Practice time logged")} value={`${formatNumber(locale, aggregate._sum.durationMinutes || 0)} ${t("min")}`} note={t("Across all IELTS skills")} icon={<Clock3 size={17} />} />
      <MetricCard label={t("Practice sessions")} value={formatNumber(locale, practices.length)} note={t("Saved in your workspace")} icon={<Headphones size={17} />} />
      <MetricCard label={t("Average recorded band")} value={aggregate._avg.bandScore == null ? "—" : aggregate._avg.bandScore.toFixed(1)} note={t("From sessions with a score") } icon={<Target size={17} />} />
    </div>

    <IeltsStudyPlan locale={locale} completedChapterIds={completedChapterIds} today={todayValue} />

    <div className="dashboard-grid practice-dashboard-grid">
      <div className="stack">
        <Panel title={t("Your IELTS goal")} subtitle={t("Choose the score and exam date you are working toward.")}>
          <form action={saveIeltsGoal} className="form-grid">
            <label className="form-field col-6"><span>{t("Target overall band")}</span><select className="select" name="targetBand" defaultValue={goal?.targetBand ?? 7}>{bands.map((band) => <option key={band} value={band}>{band.toFixed(1)}</option>)}</select></label>
            <label className="form-field col-6"><span>{t("Exam date (optional)")}</span><input className="input" type="date" name="examDate" defaultValue={goal?.examDate?.toISOString().slice(0, 10) || ""} /></label>
            <div className="form-actions col-12"><SubmitButton>{t("Save IELTS goal")}</SubmitButton></div>
          </form>
        </Panel>
        <Panel title={t("Log a practice session")} subtitle={t("Record your skill, time spent and an optional practice score.")}>
          <form action={saveIeltsPractice}>
            <div className="form-grid">
              <label className="form-field col-3"><span>{t("Skill")}</span><select className="select" name="skill" required defaultValue="Listening">{skills.map((skill) => <option key={skill} value={skill}>{t(skill)}</option>)}</select></label>
              <label className="form-field col-3"><span>{t("Minutes")}</span><input className="input" type="number" name="durationMinutes" min={5} max={600} defaultValue={30} required /></label>
              <label className="form-field col-3"><span>{t("Practice band (optional)")}</span><select className="select" name="bandScore" defaultValue=""><option value="">—</option>{bands.map((band) => <option key={band} value={band}>{band.toFixed(1)}</option>)}</select></label>
              <label className="form-field col-3"><span>{t("Date")}</span><input className="input" type="date" name="practicedAt" defaultValue={todayValue} required /></label>
              <label className="form-field col-12"><span>{t("What did you practise?")}</span><textarea className="textarea" name="note" maxLength={2000} placeholder={t("Book, test, task or one thing to improve")} /></label>
            </div>
            <div className="form-actions"><SubmitButton><PencilLine size={14} />{t("Save practice")}</SubmitButton></div>
          </form>
        </Panel>
      </div>
      <Panel title={t("Recent practice")} subtitle={t("Your latest IELTS sessions.")}>
        {practices.length ? <div className="practice-history">{practices.map((practice) => <article className="practice-history-row" key={practice.id}>
          <span className="practice-skill-icon"><BookOpenCheck size={15} /></span>
          <div className="practice-history-main"><b>{t(practice.skill)}{practice.bandScore != null ? ` · ${practice.bandScore.toFixed(1)}` : ""}</b><small><CalendarDays size={11} /> {formatDate(locale, practice.practicedAt, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })} · {formatNumber(locale, practice.durationMinutes)} {t("min")}</small>{practice.note && <p>{practice.note.replace(/^\[IELTS-CHAPTER:[a-z0-9-]+\]\s*/, "")}</p>}</div>
          <form action={deleteIeltsPractice}><input type="hidden" name="id" value={practice.id} /><button className="icon-button row-delete" type="submit" aria-label={t("Delete practice entry")}><Trash2 size={14} /></button></form>
        </article>)}</div> : <EmptyState title={t("No practice logged yet")} description={t("Save your first listening, reading, writing or speaking session.")} icon={<BookOpenCheck size={17} />} />}
      </Panel>
    </div>
  </>;
}
