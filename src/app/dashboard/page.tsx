import Link from "next/link";
import { ArrowRight, CalendarDays, Check, CircleDollarSign, Clock3, Flame, Layers3, Sparkles, Target } from "lucide-react";
import { EmptyState, MetricCard, PageHeader, Panel } from "@/components/ui";
import { LIFE_AREAS } from "@/lib/constants";
import { formatMoney } from "@/lib/constants";
import { toggleLifeItem } from "@/lib/actions/life";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const areaIcons = ["✓", "✈", "↗", "⌕", "◎", "৳", "♡", "✦"];

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export default async function DashboardPage() {
  const user = await requireCurrentUser();
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
  const dateLabel = new Intl.DateTimeFormat("en-BD", { weekday: "long", day: "numeric", month: "long" }).format(now);
  const areaCountMap = new Map(areaCounts.map((entry) => [entry.area, entry._count._all]));
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return <>
    <PageHeader eyebrow="YOUR PERSONAL WORKSPACE" title={`${greeting}, ${firstName}`} description={`${dateLabel} · Take the next step at your own pace.`} actions={<Link className="button button-primary" href="/dashboard/areas/tasks">Plan a task <ArrowRight size={15} /></Link>} />

    <section className="welcome-banner">
      <div>
        <span className="welcome-eyebrow"><Sparkles size={13} /> A LITTLE PROGRESS ADDS UP · প্রতিদিনের ছোট অগ্রগতি</span>
        <h2>Make today a little clearer.</h2>
        <p>Choose one useful next step. Your plans, habits, money and career stay organized in one private place.</p>
        <div className="welcome-actions">
          <Link className="button welcome-button" href="/dashboard/areas/tasks">Open my tasks <ArrowRight size={14} /></Link>
          <Link className="welcome-link" href="/dashboard/focus">Start a focus session</Link>
          <Link className="welcome-link" href="/dashboard/interview">Practice interview ↗</Link>
        </div>
      </div>
      <div className="welcome-progress">
        <span className="welcome-progress-icon"><Target size={18} /></span>
        <small>THIS WEEK</small>
        <b>{completedRatio}<em>%</em></b>
        <span>{completedThisWeek} step{completedThisWeek === 1 ? "" : "s"} completed</span>
        <div className="progress-track"><i style={{ width: `${completedRatio}%` }} /></div>
      </div>
      <div className="welcome-spark spark-one">✳</div><div className="welcome-spark spark-two">✦</div>
    </section>

    <div className="metric-grid">
      <MetricCard label="Open next steps" value={openTasks.length} note="Across your life areas" icon={<Layers3 size={16} />} />
      <MetricCard label="Habits checked today" value={`${checkedToday} / ${habits}`} note="A small check-in counts" icon={<Flame size={16} />} />
      <MetricCard label="Focus sessions this week" value={focusSessions} note="Keep building momentum" icon={<Clock3 size={16} />} />
      <MetricCard label="Spent this month" value={formatMoney(expenses._sum.amountCents || 0)} note="See your money overview" icon={<CircleDollarSign size={16} />} />
    </div>

    <div className="dashboard-grid">
      <div className="stack">
        <Panel title="Your next steps" subtitle="A short, prioritized view of what is still open" action={<Link className="text-link" href="/dashboard/areas/tasks">View tasks <ArrowRight size={13} /></Link>}>
          {openTasks.length ? <div className="list">{openTasks.map((task) => <div className="list-row" key={task.id}><form action={toggleLifeItem}><input type="hidden" name="id" value={task.id} /><button className="check-button" type="submit" aria-label={`Complete ${task.title}`}><Check size={12} /></button></form><div className="list-main"><b>{task.title}</b><small>{LIFE_AREAS.find((area) => area.id === task.area)?.label || "Task"}{task.dueAt ? ` · Due ${new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short" }).format(task.dueAt)}` : ""}</small></div><span className={`priority-dot priority-${task.priority === 1 ? "high" : task.priority === 3 ? "low" : "normal"}`} title={task.priority === 1 ? "High priority" : task.priority === 3 ? "Low priority" : "Normal priority"} /></div>)}</div> : <EmptyState title="Your list is clear" description="Add one next step to make progress on something that matters." icon={<Check size={17} />} />}
        </Panel>

        <Panel title="Life areas" subtitle="Open an area to add, edit and complete its steps">
          <div className="area-grid">{LIFE_AREAS.map((area, index) => <Link className="area-card" href={`/dashboard/areas/${area.id}`} key={area.id}><span className={`area-card-icon tone-${area.color}`}>{areaIcons[index]}</span><b>{area.label}</b><small>{areaCountMap.get(area.id) || 0} open step{areaCountMap.get(area.id) === 1 ? "" : "s"}</small></Link>)}</div>
        </Panel>
      </div>

      <div className="stack">
        <Panel title="Upcoming deadlines" subtitle="Applications and important dates" action={<Link className="text-link" href="/dashboard/applications">Open tracker <ArrowRight size={13} /></Link>}>
          {dueApplications.length ? <div className="list">{dueApplications.map((application) => <div className="list-row" key={application.id}><span className="deadline-icon"><CalendarDays size={15} /></span><div className="list-main"><b>{application.title}</b><small>{application.organization || application.kind}</small></div><span className="list-meta">{application.deadline ? new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short" }).format(application.deadline) : "—"}</span></div>)}</div> : <EmptyState title="No deadlines coming up" description="Add a university, job or scholarship to keep the next important date visible." icon={<CalendarDays size={17} />} />}
        </Panel>

        <Panel title="Money snapshot" subtitle={new Intl.DateTimeFormat("en-BD", { month: "long", year: "numeric" }).format(now)} action={<Link className="text-link" href="/dashboard/money">Details <ArrowRight size={13} /></Link>}>
          <div className="money-mini"><span><small>INCOME</small><b className="positive-value">{formatMoney(income._sum.amountCents || 0)}</b></span><span><small>EXPENSES</small><b className="negative-value">{formatMoney(expenses._sum.amountCents || 0)}</b></span></div>
          <Link className="subtle-action" href="/dashboard/money?tab=transactions">＋ Add a transaction</Link>
        </Panel>

        <Panel title="A gentle reminder" subtitle="You do not have to do everything today">
          <div className="reminder-box"><span>✦</span><p>Start with one action that will make tomorrow easier.</p></div>
        </Panel>
      </div>
    </div>
  </>;
}
