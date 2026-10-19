import { ArrowRight, CheckCircle2, Clock3, Flame, Mic, Target, WalletCards } from "lucide-react";
import Link from "next/link";
import { RouteNotice } from "@/components/route-notice";
import { MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { saveWeeklyReview } from "@/lib/actions/reviews";
import { formatMoney } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

function currentDhakaWeekStart() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const today = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
  today.setUTCDate(today.getUTCDate() - (today.getUTCDay() + 6) % 7);
  return today.toISOString().slice(0, 10);
}

export default async function WeeklyReviewPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const weekStart = currentDhakaWeekStart();
  const from = new Date(`${weekStart}T00:00:00+06:00`);
  const now = new Date();
  const [review, previous, tasksDone, habitCheckIns, focusSessions, interviewAnswers, spending] = await Promise.all([
    prisma.weeklyReview.findUnique({ where: { userId_weekStart: { userId: user.id, weekStart } } }),
    prisma.weeklyReview.findMany({ where: { userId: user.id, weekStart: { not: weekStart } }, orderBy: { weekStart: "desc" }, take: 5 }),
    prisma.lifeItem.count({ where: { userId: user.id, completed: true, completedAt: { gte: from, lte: now } } }),
    prisma.habitCheckIn.count({ where: { habit: { userId: user.id }, createdAt: { gte: from, lte: now } } }),
    prisma.focusSession.aggregate({ where: { userId: user.id, completedAt: { gte: from, lte: now } }, _sum: { durationSeconds: true }, _count: { _all: true } }),
    prisma.interviewAttempt.count({ where: { userId: user.id, createdAt: { gte: from, lte: now } } }),
    prisma.moneyTransaction.aggregate({ where: { userId: user.id, kind: "Expense", occurredAt: { gte: from, lte: now } }, _sum: { amountCents: true } }),
  ]);
  const weekLabel = formatDate(locale, new Date(`${weekStart}T12:00:00Z`), { timeZone: "Asia/Dhaka", day: "numeric", month: "short" });

  return <>
    <PageHeader eyebrow={t("PAUSE, NOTICE, PLAN")} title={t("Weekly review")} description={t("Look back on what happened, keep the lessons, and choose a clear focus for next week.")} actions={<span className="badge">{t("Week of {date}", { date: weekLabel })}</span>} />
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="review-metrics">
      <MetricCard label={t("Steps completed")} value={formatNumber(locale, tasksDone)} note={t("Since Monday")} icon={<CheckCircle2 size={15} />} />
      <MetricCard label={t("Habit check-ins")} value={formatNumber(locale, habitCheckIns)} note={t("Small actions count")} icon={<Flame size={15} />} />
      <MetricCard label={t("Focus time")} value={`${formatNumber(locale, Math.round((focusSessions._sum.durationSeconds || 0) / 60))} ${t("min")}`} note={t("{count} sessions", { count: formatNumber(locale, focusSessions._count._all) })} icon={<Clock3 size={15} />} />
      <MetricCard label={t("Practice answers")} value={formatNumber(locale, interviewAnswers)} note={t("Interview rehearsal")} icon={<Mic size={15} />} />
    </div>
    <div className="review-layout">
      <Panel title={t("Your reflection")} subtitle={t("Write a few honest notes. You can come back and update them later.")}>
        <form action={saveWeeklyReview}>
          <input type="hidden" name="weekStart" value={weekStart} />
          <div className="form-grid">
            <label className="form-field col-12"><span>{t("Wins · What went well?")}</span><textarea className="textarea review-textarea" name="wins" maxLength={4000} defaultValue={review?.wins} placeholder={t("What progress are you glad you made?")} /></label>
            <label className="form-field col-12"><span>{t("Lessons · What did you learn?")}</span><textarea className="textarea review-textarea" name="lessons" maxLength={4000} defaultValue={review?.lessons} placeholder={t("What felt harder than expected, or surprised you?")} /></label>
            <label className="form-field col-12"><span>{t("Next week’s focus")}</span><textarea className="textarea review-textarea" name="nextFocus" maxLength={4000} defaultValue={review?.nextFocus} placeholder={t("Choose up to three useful priorities.")} /></label>
          </div>
          <div className="form-actions"><SubmitButton>{t(review ? "Update this review" : "Save this review")}</SubmitButton></div>
        </form>
      </Panel>
      <div className="stack">
        <Panel title={t("A few numbers")} subtitle={t("Your activity this week")}>
          <div className="review-fact"><span><Target size={14} /></span><div><b>{t("{count} steps", { count: formatNumber(locale, tasksDone) })}</b><small>{t("completed since Monday")}</small></div></div>
          <div className="review-fact"><span><WalletCards size={14} /></span><div><b>{formatMoney(spending._sum.amountCents || 0, "BDT", locale)}</b><small>{t("recorded expenses")}</small></div></div>
          <div className="review-links"><Link className="text-link" href="/dashboard/areas/tasks">{t("Review your steps")} <ArrowRight size={13} /></Link><Link className="text-link" href="/dashboard/money">{t("Open money")} <ArrowRight size={13} /></Link></div>
        </Panel>
        <Panel title={t("Previous reflections")} subtitle={t("Keep useful lessons in view")}>
          {previous.length ? <div className="review-history">{previous.map((entry) => <article key={entry.id}><small>{t("Week of {date}", { date: formatDate(locale, new Date(`${entry.weekStart}T12:00:00Z`), { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }) })}</small><b>{entry.nextFocus.split("\n").find(Boolean) || entry.wins.split("\n").find(Boolean) || t("Reflection saved")}</b>{entry.lessons && <p>{entry.lessons}</p>}</article>)}</div> : <p className="muted-copy">{t("Your previous reviews will appear here.")}</p>}
        </Panel>
      </div>
    </div>
  </>;
}
