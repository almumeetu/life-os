import { Clock3, Focus } from "lucide-react";
import { FocusTimer } from "@/components/focus-timer";
import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

export default async function FocusPage() {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string) => translate(locale, message);
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const [activeTasks, sessionsToday, recentSessions] = await Promise.all([
    prisma.lifeItem.findMany({ where: { userId: user.id, completed: false }, orderBy: [{ priority: "asc" }, { dueAt: "asc" }], take: 30, select: { title: true } }),
    prisma.focusSession.count({ where: { userId: user.id, completedAt: { gte: start } } }),
    prisma.focusSession.findMany({ where: { userId: user.id }, orderBy: { completedAt: "desc" }, take: 6 }),
  ]);
  const weeklyMinutes = recentSessions.reduce((total, session) => total + Math.round(session.durationSeconds / 60), 0);

  return <>
    <PageHeader eyebrow={t("FOCUS MODE")} title={t("One thing at a time")} description={t("Protect a little space for your most important work.")} />
    <div className="stack">
      <FocusTimer activeTasks={activeTasks.map((task) => task.title)} sessionsToday={sessionsToday} locale={locale} />
      <Panel title={t("Recent sessions")} subtitle={t("Your latest completed focus blocks")} action={<span className="badge"><Clock3 size={12} /> {formatNumber(locale, weeklyMinutes)} {t("min shown")}</span>}>
        {recentSessions.length ? <div className="list">{recentSessions.map((session) => <div className="list-row" key={session.id}><span className="panel-icon"><Focus size={15} /></span><div className="list-main"><b>{session.taskTitle || t("Focus block")}</b><small>{formatDate(locale, session.completedAt, { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Dhaka" })}</small></div><span className="list-meta">{formatNumber(locale, Math.round(session.durationSeconds / 60))} {t("min")}</span></div>)}</div> : <p className="muted-copy">{t("Complete your first focus block and it will appear here.")}</p>}
      </Panel>
    </div>
  </>;
}
