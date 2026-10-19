import { Activity, Check, Flame, Plus, Sparkles, Trash2 } from "lucide-react";
import { addStarterHabits, createHabit, deleteHabit, toggleHabitCheckIn } from "@/lib/actions/habits";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

function dayKey(date: Date) { return date.toISOString().slice(0, 10); }

function streakFor(checkins: Set<string>, today: string) {
  let cursor = new Date(`${today}T12:00:00.000Z`);
  if (!checkins.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (checkins.has(dayKey(cursor))) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  return streak;
}

export default async function HabitsPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const user = await requireCurrentUser();
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const todayKey = dayKey(today);
  const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setUTCDate(date.getUTCDate() - (6 - index)); return { key: dayKey(date), date }; });
  const rangeStart = new Date(today); rangeStart.setUTCDate(rangeStart.getUTCDate() - 59);
  const [habits, checkins] = await Promise.all([
    prisma.habit.findMany({ where: { userId: user.id }, include: { checkIns: { where: { dayKey: { gte: dayKey(rangeStart) } }, orderBy: { dayKey: "desc" } } }, orderBy: { createdAt: "asc" } }),
    prisma.habitCheckIn.count({ where: { habit: { userId: user.id }, dayKey: { gte: week[0].key, lte: todayKey } } }),
  ]);
  const todayCount = habits.filter((habit) => habit.checkIns.some((checkin) => checkin.dayKey === todayKey)).length;
  const weeklyTotal = habits.length * 7;
  const completion = weeklyTotal ? Math.round(checkins / weeklyTotal * 100) : 0;

  return <>
    <PageHeader eyebrow="SMALL REPEATED WINS" title="Daily habits" description="Build routines that support the person you want to become." actions={<form action={addStarterHabits}><button className="button button-secondary" type="submit"><Sparkles size={14} />Starter set</button></form>} />
    <RouteNotice searchParams={searchParams} />
    <div className="metric-grid habit-metrics"><MetricCard label="Today" value={`${todayCount} / ${habits.length}`} note="Habits checked in" icon={<Check size={16} />} /><MetricCard label="This week" value={`${completion}%`} note={`${checkins} check-ins so far`} icon={<Activity size={16} />} /><MetricCard label="Active habits" value={habits.length} note="Keep the list realistic" icon={<Flame size={16} />} /><MetricCard label="Today’s date" value={new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short" }).format(today)} note={new Intl.DateTimeFormat("en-BD", { weekday: "long" }).format(today)} icon={<Sparkles size={16} />} /></div>
    <div className="dashboard-grid">
      <Panel title="Your habits" subtitle="Tap a day to check in. Streaks count consecutive days.">
        {habits.length ? <div className="habit-list">{habits.map((habit) => {
          const done = new Set(habit.checkIns.map((checkin) => checkin.dayKey));
          return <article className="habit-item" key={habit.id}><div className="habit-item-main"><span className="habit-icon"><Activity size={16} /></span><div className="list-main"><b>{habit.title}</b><small><Flame size={11} /> {streakFor(done, todayKey)} day streak</small></div><form action={deleteHabit}><input type="hidden" name="id" value={habit.id} /><button className="icon-button row-delete" type="submit" aria-label={`Remove ${habit.title}`}><Trash2 size={14} /></button></form></div><div className="habit-week">{week.map(({ key, date }) => <form action={toggleHabitCheckIn} key={key}><input type="hidden" name="habitId" value={habit.id} /><input type="hidden" name="dayKey" value={key} /><button className={`habit-day ${done.has(key) ? "complete" : ""}`} type="submit" aria-label={`${done.has(key) ? "Uncheck" : "Check in"} ${habit.title} on ${key}`} title={key}>{done.has(key) ? <Check size={11} /> : new Intl.DateTimeFormat("en-BD", { weekday: "narrow" }).format(date)}</button></form>)}</div></article>;
        })}</div> : <EmptyState title="Start with one repeatable action" description="Add a habit you can realistically keep, even on a busy day." icon={<Flame size={17} />} />}
      </Panel>
      <div className="stack">
        <Panel title="Add a habit" subtitle="Make it small enough to repeat">
          <form action={createHabit} className="inline-form"><input className="input" name="title" required minLength={2} maxLength={120} placeholder="e.g. Walk for 20 minutes" /><SubmitButton><Plus size={14} />Add habit</SubmitButton></form>
        </Panel>
        <Panel title="Keep it kind" subtitle="Consistency grows from a plan you can live with">
          <div className="reminder-box"><span>✦</span><p>Missing a day is part of being human. Pick up again without needing to restart everything.</p></div>
        </Panel>
      </div>
    </div>
  </>;
}
