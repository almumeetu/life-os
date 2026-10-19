import Link from "next/link";
import { CalendarClock, Check, Edit3, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { addStarterItems, createLifeItem, deleteLifeItem, toggleLifeItem, updateLifeItem } from "@/lib/actions/life";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, Panel, SubmitButton } from "@/components/ui";
import { PRIORITIES, STARTER_ITEMS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

type SearchParams = Promise<{ status?: string; q?: string; edit?: string; message?: string; tone?: string }>;

function dateInputValue(date: Date | null) { return date ? date.toISOString().slice(0, 10) : ""; }

export async function StudyAbroadChecklist({ searchParams }: { searchParams: SearchParams }) {
  const [user, query, locale] = await Promise.all([requireCurrentUser(), searchParams, getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const filter = query.status === "done" || query.status === "all" ? query.status : "open";
  const search = query.q?.trim().slice(0, 100) || "";
  const where = {
    userId: user.id,
    area: "abroad",
    ...(filter === "open" ? { completed: false } : filter === "done" ? { completed: true } : {}),
    ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { note: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  const [items, editing, openCount] = await Promise.all([
    prisma.lifeItem.findMany({ where, orderBy: [{ completed: "asc" }, { priority: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }] }),
    query.edit ? prisma.lifeItem.findFirst({ where: { id: query.edit, userId: user.id, area: "abroad" } }) : Promise.resolve(null),
    prisma.lifeItem.count({ where: { userId: user.id, area: "abroad", completed: false } }),
  ]);
  const starterCount = STARTER_ITEMS.abroad.length;

  return <>
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="dashboard-grid area-detail-grid">
      <div className="stack">
        <Panel title={t(editing ? "Update this requirement" : "Add a requirement")} subtitle={t("Requirements vary by country and university. Save the exact rule and its official source link.")}>
          <form action={editing ? updateLifeItem : createLifeItem}>
            <input type="hidden" name="area" value="abroad" />
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-grid">
              <label className="form-field col-8"><span>{t("Requirement or next action")}</span><input className="input" name="title" required minLength={2} maxLength={160} defaultValue={editing?.title} placeholder={t("e.g. Request an official transcript")}/></label>
              <label className="form-field col-4"><span>{t("Due date")}</span><input className="input" type="date" name="dueAt" defaultValue={dateInputValue(editing?.dueAt || null)} /></label>
              <label className="form-field col-4"><span>{t("Priority")}</span><select className="select" name="priority" defaultValue={editing?.priority || 2}>{PRIORITIES.map((priority) => <option key={priority.value} value={priority.value}>{t(priority.label)}</option>)}</select></label>
              <label className="form-field col-8"><span>{t("Official source or note")}</span><input className="input" name="note" maxLength={1600} defaultValue={editing?.note} placeholder={t("Add the university or government link and exact details")}/></label>
            </div>
            <div className="form-actions"><SubmitButton>{editing ? t("Save changes") : <><Plus size={14} />{t("Add requirement")}</>}</SubmitButton>{editing && <Link className="button button-secondary" href="/dashboard/study-abroad">{t("Cancel")}</Link>}</div>
          </form>
        </Panel>
        <Panel title={t("My requirements")} subtitle={t("{open} open · starter checklist has {total} ideas", { open: formatNumber(locale, openCount), total: formatNumber(locale, starterCount) })} action={<form action={addStarterItems.bind(null, "abroad")}><button className="button button-quiet button-small" type="submit"><Sparkles size={13} />{t("Add starter checklist")}</button></form>}>
          <form className="filter-bar" method="get">
            <input className="input" type="search" name="q" defaultValue={search} placeholder={t("Search requirements")} aria-label={t("Search requirements")} />
            <select className="select" name="status" defaultValue={filter} aria-label={t("Filter by status")}><option value="open">{t("Open")}</option><option value="done">{t("Done")}</option><option value="all">{t("All items")}</option></select>
            <button className="button button-secondary button-small" type="submit"><Search size={13} />{t("Filter")}</button>
          </form>
          {items.length ? <div className="list">{items.map((item) => <div className={`list-row task-row ${item.completed ? "task-complete" : ""}`} key={item.id}>
            <form action={toggleLifeItem}><input type="hidden" name="id" value={item.id} /><button className={`check-button ${item.completed ? "checked" : ""}`} type="submit" aria-label={t(item.completed ? "Reopen {title}" : "Complete {title}", { title: item.title })}>{item.completed ? <Check size={12} /> : null}</button></form>
            <div className="list-main"><b>{t(item.title)}</b><small>{item.dueAt && <><CalendarClock size={11} /> {formatDate(locale, item.dueAt, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })} · </>}{t(item.priority === 1 ? "High priority" : item.priority === 3 ? "Low priority" : "Normal priority")}{item.note && <> · {item.note}</>}</small></div>
            <Link className="icon-button" href={`/dashboard/study-abroad?edit=${item.id}`} aria-label={t("Edit {title}", { title: item.title })}><Edit3 size={14} /></Link>
            <form action={deleteLifeItem}><input type="hidden" name="id" value={item.id} /><button className="icon-button row-delete" type="submit" aria-label={t("Delete {title}", { title: item.title })}><Trash2 size={14} /></button></form>
          </div>)}</div> : <EmptyState title={t("No requirements match yet")} description={t("Add a requirement or use the starter checklist to make your first plan.")} />}
        </Panel>
      </div>
      <div className="stack">
        <Panel title={t("Study-abroad steps")} subtitle={t("A simple order to get started.")}>
          <ol className="abroad-phases"><li><b>{t("Choose a course and country")}</b><span>{t("Compare programs and use each university's official requirement page.")}</span></li><li><b>{t("Prepare academic and English records")}</b><span>{t("Collect transcripts, certificates, references and IELTS results.")}</span></li><li><b>{t("Plan funding and applications")}</b><span>{t("Track scholarships, costs, proof-of-funds and each deadline.")}</span></li><li><b>{t("Prepare visa documents")}</b><span>{t("Use the destination government's current official checklist.")}</span></li></ol>
          <p className="settings-copy">{t("Requirements change. Save a link to the official university or government page beside each item.")}</p>
        </Panel>
      </div>
    </div>
  </>;
}
