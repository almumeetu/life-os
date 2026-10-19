import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Check, CheckSquare, CircleDollarSign, Clock3, FlaskConical, Flame, Globe2, HeartPulse, Layers3, Lightbulb, Sparkles, Target, WalletCards } from "lucide-react";
import { EmptyState, MetricCard, PageHeader, Panel } from "@/components/ui";
import { LIFE_AREAS } from "@/lib/constants";
import { formatMoney } from "@/lib/constants";
import { toggleLifeItem } from "@/lib/actions/life";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

const areaIcons = {
  tasks: CheckSquare,
  abroad: Globe2,
  career: BriefcaseBusiness,
  research: FlaskConical,
  goals: Target,
  money: WalletCards,
  health: HeartPulse,
  ideas: Lightbulb,
} as const;

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export default async function DashboardPage() {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = new Date(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [openTasks, dueApplications, completedThisWeek, totalThisWeek, habits, checkedToday, income, expenses, focusSessions, areaCounts] = await Promise.all([
    prisma.lifeItem.findMany({ where: { userId: user.id, completed: false }, orderBy: [{ priority: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }], take: 6 }),
    prisma.application.findMany({ where: { userId: user.id, deadline: { gte: today }, status: { notIn: ["Offer", "Rejected"] } }, orderBy: { deadline: "asc" }, take: 4 }),
    prisma.lifeItem.count({ where: { userId: user.id, completed: true, completedAt: { gte: weekStart } } }),
    prisma.lifeItem.count({ where: { userId: user.id, createdAt: { gte: weekStart } } }),
    prisma.habit.count({ where: { userId: user.id } }),
    prisma.habitCheckIn.count({ where: { habit: { userId: user.id }, dayKey: today.toISOString().slice(0, 10) } }),
    prisma.moneyTransaction.aggregate({ where: { userId: user.id, kind: "Income", occurredAt: { gte: monthStart, lt: nextMonth } }, _sum: { amountCents: true } }),
    prisma.moneyTransaction.aggregate({ where: { userId: user.id, kind: "Expense", occurredAt: { gte: monthStart, lt: nextMonth } }, _sum: { amountCents: true } }),
    prisma.focusSession.count({ where: { userId: user.id, completedAt: { gte: weekStart } } }),
    prisma.lifeItem.groupBy({ by: ["area"], where: { userId: user.id, completed: false }, _count: { _all: true } }),
  ]);

  const firstName = user.name.trim().split(/\s+/)[0] || "there";
  const completedRatio = totalThisWeek ? Math.round(completedThisWeek / totalThisWeek * 100) : 0;
  const dateLabel = formatDate(locale, now, { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" });
  const areaCountMap = new Map(areaCounts.map((entry) => [entry.area, entry._count._all]));
  const greeting = t(now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening");

  return <>
    <PageHeader eyebrow={t("YOUR PERSONAL WORKSPACE")} title={`${greeting}, ${firstName}`} description={`${dateLabel} · ${t("Take the next step at your own pace.")}`} actions={<Link className="button button-primary" href="/dashboard/areas/tasks">{t("Plan a task")} <ArrowRight size={15} aria-hidden="true" /></Link>} />

    <section className="welcome-banner">
      <div>
        <span className="welcome-eyebrow"><Sparkles size={13} aria-hidden="true" /> {t("A LITTLE PROGRESS ADDS UP · প্রতিদিনের ছোট অগ্রগতি")}</span>
        <h2>{t("Make today a little clearer.")}</h2>
        <p>{t("Choose one useful next step. Your plans, habits, money and career stay organized in one private place.")}</p>
        <div className="welcome-actions">
          <Link className="button welcome-button" href="/dashboard/areas/tasks">{t("Open my tasks")} <ArrowRight size={14} aria-hidden="true" /></Link>
          <Link className="welcome-link" href="/dashboard/focus">{t("Start a focus session")}</Link>
          <Link className="welcome-link" href="/dashboard/interview">{t("Practice interview ↗")}</Link>
        </div>
      </div>
      <div className="welcome-progress">
        <span className="welcome-progress-icon"><Target size={18} /></span>
        <small>{t("THIS WEEK")}</small>
        <b>{formatNumber(locale, completedRatio)}<em>%</em></b>
        <span>{formatNumber(locale, completedThisWeek)} {t(completedThisWeek === 1 ? "step completed" : "steps completed")}</span>
        <div className="progress-track"><i style={{ width: `${completedRatio}%` }} /></div>
      </div>
      <div className="welcome-spark spark-one">✳</div><div className="welcome-spark spark-two">✦</div>
    </section>

    <div className="metric-grid">
      <MetricCard label={t("Open next steps")} value={formatNumber(locale, openTasks.length)} note={t("Across your life areas")} icon={<Layers3 size={17} aria-hidden="true" />} />
      <MetricCard label={t("Habits checked today")} value={`${formatNumber(locale, checkedToday)} / ${formatNumber(locale, habits)}`} note={t("A small check-in counts")} icon={<Flame size={17} aria-hidden="true" />} />
      <MetricCard label={t("Focus sessions this week")} value={formatNumber(locale, focusSessions)} note={t("Keep building momentum")} icon={<Clock3 size={17} aria-hidden="true" />} />
      <MetricCard label={t("Spent this month")} value={formatMoney(expenses._sum.amountCents || 0, "BDT", locale)} note={t("See your money overview")} icon={<CircleDollarSign size={17} aria-hidden="true" />} />
    </div>

    <div className="dashboard-grid">
      <div className="stack">
        <Panel title={t("Your next steps")} subtitle={t("A short, prioritized view of what is still open")} action={<Link className="text-link" href="/dashboard/areas/tasks">{t("View tasks")} <ArrowRight size={13} aria-hidden="true" /></Link>}>
          {openTasks.length ? <div className="list">{openTasks.map((task) => <div className="list-row" key={task.id}><form action={toggleLifeItem}><input type="hidden" name="id" value={task.id} /><button className="check-button" type="submit" aria-label={t("Complete {title}", { title: task.title })}><Check size={12} aria-hidden="true" /></button></form><div className="list-main"><b>{t(task.title)}</b><small>{t(LIFE_AREAS.find((area) => area.id === task.area)?.label || "Task")}{task.dueAt ? ` · ${t("Due {date}", { date: formatDate(locale, task.dueAt, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }) })}` : ""}</small></div><span className={`priority-dot priority-${task.priority === 1 ? "high" : task.priority === 3 ? "low" : "normal"}`} title={t(task.priority === 1 ? "High priority" : task.priority === 3 ? "Low priority" : "Normal priority")} /></div>)}</div> : <EmptyState title={t("Your list is clear")} description={t("Add one next step to make progress on something that matters.")} icon={<Check size={17} aria-hidden="true" />} />}
        </Panel>

        <Panel title={t("Life areas")} subtitle={t("Open an area to add, edit and complete its steps")}>
          <div className="area-grid">{LIFE_AREAS.map((area) => { const AreaIcon = areaIcons[area.id]; const count = areaCountMap.get(area.id) || 0; return <Link className="area-card" href={`/dashboard/areas/${area.id}`} key={area.id}><span className={`area-card-icon tone-${area.color}`} aria-hidden="true"><AreaIcon size={19} strokeWidth={2.1} /></span><b>{t(area.label)}</b><small>{formatNumber(locale, count)} {t(count === 1 ? "open step" : "open steps")}</small></Link>; })}</div>
        </Panel>
      </div>

      <div className="stack">
        <Panel title={t("Upcoming deadlines")} subtitle={t("Applications and important dates")} action={<Link className="text-link" href="/dashboard/applications">{t("Open tracker")} <ArrowRight size={13} aria-hidden="true" /></Link>}>
          {dueApplications.length ? <div className="list">{dueApplications.map((application) => <div className="list-row" key={application.id}><span className="deadline-icon" aria-hidden="true"><CalendarDays size={17} /></span><div className="list-main"><b>{application.title}</b><small>{application.organization || t(application.kind)}</small></div><span className="list-meta">{application.deadline ? formatDate(locale, application.deadline, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }) : "—"}</span></div>)}</div> : <EmptyState title={t("No deadlines coming up")} description={t("Add a university, job or scholarship to keep the next important date visible.")} icon={<CalendarDays size={17} aria-hidden="true" />} />}
        </Panel>

        <Panel title={t("Money snapshot")} subtitle={formatDate(locale, now, { month: "long", year: "numeric" })} action={<Link className="text-link" href="/dashboard/money">{t("Details")} <ArrowRight size={13} aria-hidden="true" /></Link>}>
          <div className="money-mini"><span><small>{t("INCOME")}</small><b className="positive-value">{formatMoney(income._sum.amountCents || 0, "BDT", locale)}</b></span><span><small>{t("EXPENSES")}</small><b className="negative-value">{formatMoney(expenses._sum.amountCents || 0, "BDT", locale)}</b></span></div>
          <Link className="subtle-action" href="/dashboard/money?tab=transactions">{t("＋ Add a transaction")}</Link>
        </Panel>

        <Panel title={t("A gentle reminder")} subtitle={t("You do not have to do everything today")}>
          <div className="reminder-box"><span aria-hidden="true">✦</span><p>{t("Start with one action that will make tomorrow easier.")}</p></div>
        </Panel>
      </div>
    </div>
  </>;
}
