import { Activity, Check, Flame, Plus, Sparkles, Trash2 } from "lucide-react";
import { addStarterHabits, createHabit, deleteHabit, toggleHabitCheckIn } from "@/lib/actions/habits";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

function dayKey(date: Date) { return date.toISOString().slice(0, 10); }

function streakFor(checkins: Set<string>, today: string) {
  const cursor = new Date(`${today}T12:00:00.000Z`);
  if (!checkins.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (checkins.has(dayKey(cursor))) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  return streak;
}

export default async function HabitsPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
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
    <PageHeader eyebrow={t("SMALL REPEATED WINS")} title={t("Daily habits")} description={t("Build routines that support the person you want to become.")} actions={<form action={addStarterHabits}><button className="button button-secondary" type="submit"><Sparkles size={14} />{t("Starter set")}</button></form>} />
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="metric-grid habit-metrics"><MetricCard label={t("Today")} value={`${formatNumber(locale, todayCount)} / ${formatNumber(locale, habits.length)}`} note={t("Habits checked in")} icon={<Check size={16} />} /><MetricCard label={t("This week")} value={`${formatNumber(locale, completion)}%`} note={`${formatNumber(locale, checkins)} ${t("check-ins so far")}`} icon={<Activity size={16} />} /><MetricCard label={t("Active habits")} value={formatNumber(locale, habits.length)} note={t("Keep the list realistic")} icon={<Flame size={16} />} /><MetricCard label={t("Today’s date")} value={formatDate(locale, today, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })} note={formatDate(locale, today, { weekday: "long", timeZone: "Asia/Dhaka" })} icon={<Sparkles size={16} />} /></div>
    <div className="dashboard-grid">
      <Panel title={t("Your habits")} subtitle={t("Tap a day to check in. Streaks count consecutive days.")}>
        {habits.length ? <div className="habit-list">{habits.map((habit) => {
          const done = new Set(habit.checkIns.map((checkin) => checkin.dayKey));
          return <article className="habit-item" key={habit.id}><div className="habit-item-main"><span className="habit-icon"><Activity size={16} /></span><div className="list-main"><b>{t(habit.title)}</b><small><Flame size={11} /> {formatNumber(locale, streakFor(done, todayKey))} {t("day streak")}</small></div><form action={deleteHabit}><input type="hidden" name="id" value={habit.id} /><button className="icon-button row-delete" type="submit" aria-label={t("Remove {title}", { title: habit.title })}><Trash2 size={14} /></button></form></div><div className="habit-week">{week.map(({ key, date }) => <form action={toggleHabitCheckIn} key={key}><input type="hidden" name="habitId" value={habit.id} /><input type="hidden" name="dayKey" value={key} /><button className={`habit-day ${done.has(key) ? "complete" : ""}`} type="submit" aria-label={t(done.has(key) ? "Uncheck {title} on {date}" : "Check in {title} on {date}", { title: t(habit.title), date: formatDate(locale, date, { dateStyle: "long", timeZone: "Asia/Dhaka" }) })} title={formatDate(locale, date, { dateStyle: "long", timeZone: "Asia/Dhaka" })}>{done.has(key) ? <Check size={11} /> : formatDate(locale, date, { weekday: "narrow", timeZone: "Asia/Dhaka" })}</button></form>)}</div></article>;
        })}</div> : <EmptyState title={t("Start with one repeatable action")} description={t("Add a habit you can realistically keep, even on a busy day.")} icon={<Flame size={17} />} />}
      </Panel>
      <div className="stack">
        <Panel title={t("Add a habit")} subtitle={t("Make it small enough to repeat")}>
          <form action={createHabit} className="inline-form"><input className="input" name="title" required minLength={2} maxLength={120} placeholder={t("e.g. Walk for 20 minutes")} /><SubmitButton><Plus size={14} />{t("Add a habit")}</SubmitButton></form>
        </Panel>
        <Panel title={t("Keep it kind")} subtitle={t("Consistency grows from a plan you can live with")}>
          <div className="reminder-box"><span>✦</span><p>{t("Missing a day is part of being human. Pick up again without needing to restart everything.")}</p></div>
        </Panel>
      </div>
    </div>
  </>;
}
