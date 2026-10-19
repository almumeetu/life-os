import { ArrowRight, CheckCircle2, Clock3, Flame, Mic, Target, WalletCards } from "lucide-react";
import Link from "next/link";
import { RouteNotice } from "@/components/route-notice";
import { MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { saveWeeklyReview } from "@/lib/actions/reviews";
import { formatMoney } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

function currentDhakaWeekStart() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const today = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
  today.setUTCDate(today.getUTCDate() - (today.getUTCDay() + 6) % 7);
  return today.toISOString().slice(0, 10);
}

export default async function WeeklyReviewPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const user = await requireCurrentUser();
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
  const weekLabel = new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" }).format(new Date(`${weekStart}T12:00:00Z`));

  return <>
    <PageHeader eyebrow="PAUSE, NOTICE, PLAN" title="Weekly review" description="Look back on what happened, keep the lessons, and choose a clear focus for next week." actions={<span className="badge">Week of {weekLabel}</span>} />
    <RouteNotice searchParams={searchParams} />
    <div className="review-metrics">
      <MetricCard label="Steps completed" value={tasksDone} note="Since Monday" icon={<CheckCircle2 size={15} />} />
      <MetricCard label="Habit check-ins" value={habitCheckIns} note="Small actions count" icon={<Flame size={15} />} />
      <MetricCard label="Focus time" value={`${Math.round((focusSessions._sum.durationSeconds || 0) / 60)} min`} note={`${focusSessions._count._all} sessions`} icon={<Clock3 size={15} />} />
      <MetricCard label="Practice answers" value={interviewAnswers} note="Interview rehearsal" icon={<Mic size={15} />} />
    </div>
    <div className="review-layout">
      <Panel title="Your reflection" subtitle="Write a few honest notes. You can come back and update them later.">
        <form action={saveWeeklyReview}>
          <input type="hidden" name="weekStart" value={weekStart} />
          <div className="form-grid">
            <label className="form-field col-12"><span>Wins · What went well?</span><textarea className="textarea review-textarea" name="wins" maxLength={4000} defaultValue={review?.wins} placeholder="What progress are you glad you made?" /></label>
            <label className="form-field col-12"><span>Lessons · What did you learn?</span><textarea className="textarea review-textarea" name="lessons" maxLength={4000} defaultValue={review?.lessons} placeholder="What felt harder than expected, or surprised you?" /></label>
            <label className="form-field col-12"><span>Next week’s focus</span><textarea className="textarea review-textarea" name="nextFocus" maxLength={4000} defaultValue={review?.nextFocus} placeholder="Choose up to three useful priorities." /></label>
          </div>
          <div className="form-actions"><SubmitButton>{review ? "Update this review" : "Save this review"}</SubmitButton></div>
        </form>
      </Panel>
      <div className="stack">
        <Panel title="A few numbers" subtitle="Your activity this week">
          <div className="review-fact"><span><Target size={14} /></span><div><b>{tasksDone} steps</b><small>completed since Monday</small></div></div>
          <div className="review-fact"><span><WalletCards size={14} /></span><div><b>{formatMoney(spending._sum.amountCents || 0)}</b><small>recorded expenses</small></div></div>
          <div className="review-links"><Link className="text-link" href="/dashboard/areas/tasks">Review your steps <ArrowRight size={13} /></Link><Link className="text-link" href="/dashboard/money">Open money <ArrowRight size={13} /></Link></div>
        </Panel>
        <Panel title="Previous reflections" subtitle="Keep useful lessons in view">
          {previous.length ? <div className="review-history">{previous.map((entry) => <article key={entry.id}><small>Week of {new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${entry.weekStart}T12:00:00Z`))}</small><b>{entry.nextFocus.split("\n").find(Boolean) || entry.wins.split("\n").find(Boolean) || "Reflection saved"}</b>{entry.lessons && <p>{entry.lessons}</p>}</article>)}</div> : <p className="muted-copy">Your previous reviews will appear here.</p>}
        </Panel>
      </div>
    </div>
  </>;
}
