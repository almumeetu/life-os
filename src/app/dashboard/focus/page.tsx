import { Clock3, Focus } from "lucide-react";
import { FocusTimer } from "@/components/focus-timer";
import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

export default async function FocusPage() {
  const user = await requireCurrentUser();
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const [activeTasks, sessionsToday, recentSessions] = await Promise.all([
    prisma.lifeItem.findMany({ where: { userId: user.id, completed: false }, orderBy: [{ priority: "asc" }, { dueAt: "asc" }], take: 30, select: { title: true } }),
    prisma.focusSession.count({ where: { userId: user.id, completedAt: { gte: start } } }),
    prisma.focusSession.findMany({ where: { userId: user.id }, orderBy: { completedAt: "desc" }, take: 6 }),
  ]);
  const weeklyMinutes = recentSessions.reduce((total, session) => total + Math.round(session.durationSeconds / 60), 0);

  return <>
    <PageHeader eyebrow="FOCUS MODE" title="One thing at a time" description="Protect a little space for your most important work." />
    <div className="stack">
      <FocusTimer activeTasks={activeTasks.map((task) => task.title)} sessionsToday={sessionsToday} />
      <Panel title="Recent sessions" subtitle="Your latest completed focus blocks" action={<span className="badge"><Clock3 size={12} /> {weeklyMinutes} min shown</span>}>
        {recentSessions.length ? <div className="list">{recentSessions.map((session) => <div className="list-row" key={session.id}><span className="panel-icon"><Focus size={15} /></span><div className="list-main"><b>{session.taskTitle || "Focus block"}</b><small>{new Intl.DateTimeFormat("en-BD", { weekday: "short", day: "numeric", month: "short" }).format(session.completedAt)}</small></div><span className="list-meta">{Math.round(session.durationSeconds / 60)} min</span></div>)}</div> : <p className="muted-copy">Complete your first focus block and it will appear here.</p>}
      </Panel>
    </div>
  </>;
}
