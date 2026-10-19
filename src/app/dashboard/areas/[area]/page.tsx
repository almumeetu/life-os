import Link from "next/link";
import { ArrowLeft, CalendarClock, Check, ListChecks, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { addStarterItems, createLifeItem, deleteLifeItem, toggleLifeItem, updateLifeItem } from "@/lib/actions/life";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { VoiceInput } from "@/components/voice-input";
import { getArea, PRIORITIES, STARTER_ITEMS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";

type SearchParams = Promise<{ status?: string; q?: string; edit?: string; message?: string; tone?: string }>;

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function LifeAreaPage({ params, searchParams }: { params: Promise<{ area: string }>; searchParams: SearchParams }) {
  const [{ area: areaId }, query, user] = await Promise.all([params, searchParams, requireCurrentUser()]);
  const area = getArea(areaId);
  if (!area) notFound();
  const filter = query.status === "done" || query.status === "all" ? query.status : "open";
  const search = query.q?.trim().slice(0, 100) || "";
  const where = {
    userId: user.id,
    area: area.id,
    ...(filter === "open" ? { completed: false } : filter === "done" ? { completed: true } : {}),
    ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { note: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  const [items, editing] = await Promise.all([
    prisma.lifeItem.findMany({ where, orderBy: [{ completed: "asc" }, { priority: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }] }),
    query.edit ? prisma.lifeItem.findFirst({ where: { id: query.edit, userId: user.id, area: area.id } }) : Promise.resolve(null),
  ]);
  const openCount = items.filter((item) => !item.completed).length;
  const totalStarter = STARTER_ITEMS[area.id]?.length || 0;
  const icon = area.id === "ideas" ? <Sparkles size={17} /> : <ListChecks size={17} />;

  return <>
    <PageHeader eyebrow="LIFE AREA" title={area.label} description={area.description} actions={<Link className="button button-secondary" href="/dashboard"><ArrowLeft size={14} />Overview</Link>} />
    <RouteNotice searchParams={searchParams} />

    <div className="dashboard-grid area-detail-grid">
      <div className="stack">
        <Panel title={editing ? "Update this step" : "Add a next step"} subtitle={editing ? "Change the details and save." : "Keep it small and clear. You can update it later."}>
          <form action={editing ? updateLifeItem : createLifeItem}>
            <input type="hidden" name="area" value={area.id} />
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-grid">
              <label className="form-field col-8"><span>What needs doing?</span><VoiceInput name="title" required maxLength={160} defaultValue={editing?.title} placeholder={area.id === "ideas" ? "Capture a thought…" : "Write one specific action…"} /></label>
              <label className="form-field col-4"><span>Due date</span><input className="input" type="date" name="dueAt" defaultValue={dateInputValue(editing?.dueAt || null)} /></label>
              <label className="form-field col-4"><span>Priority</span><select className="select" name="priority" defaultValue={editing?.priority || 2}>{PRIORITIES.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}</select></label>
              <label className="form-field col-8"><span>Note or link</span><input className="input" name="note" maxLength={1600} defaultValue={editing?.note} placeholder="Optional context, URL or reminder" /></label>
            </div>
            <div className="form-actions"><SubmitButton>{editing ? "Save changes" : <><Plus size={14} />Add step</>}</SubmitButton>{editing && <Link className="button button-secondary" href={`/dashboard/areas/${area.id}`}>Cancel</Link>}</div>
          </form>
        </Panel>

        <Panel title="Your list" subtitle={`${openCount} open of ${items.length} shown`} action={totalStarter > 0 ? <form action={addStarterItems.bind(null, area.id)}><button className="button button-quiet button-small" type="submit"><Sparkles size={13} />Starter list</button></form> : undefined}>
          <form className="filter-bar" method="get">
            <input className="input" type="search" name="q" defaultValue={search} placeholder="Search this area" aria-label="Search this area" />
            <select className="select" name="status" defaultValue={filter} aria-label="Filter by status"><option value="open">Open</option><option value="done">Done</option><option value="all">All items</option></select>
            <button className="button button-secondary button-small" type="submit"><Search size={13} />Filter</button>
          </form>
          {items.length ? <div className="list">{items.map((item) => <div className={`list-row task-row ${item.completed ? "task-complete" : ""}`} key={item.id}>
            <form action={toggleLifeItem}><input type="hidden" name="id" value={item.id} /><button className={`check-button ${item.completed ? "checked" : ""}`} type="submit" aria-label={item.completed ? `Reopen ${item.title}` : `Complete ${item.title}`}>{item.completed ? <Check size={12} /> : null}</button></form>
            <div className="list-main"><b>{item.title}</b><small>{item.dueAt ? <><CalendarClock size={11} /> {new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(item.dueAt)} · </> : null}{item.note || "No note"}</small></div>
            <span className={`priority-dot priority-${item.priority === 1 ? "high" : item.priority === 3 ? "low" : "normal"}`} title={item.priority === 1 ? "High priority" : item.priority === 3 ? "Low priority" : "Normal priority"} />
            <Link className="button button-quiet button-small" href={`/dashboard/areas/${area.id}?status=${filter}${search ? `&q=${encodeURIComponent(search)}` : ""}&edit=${item.id}`}>Edit</Link>
            <form action={deleteLifeItem}><input type="hidden" name="id" value={item.id} /><button className="icon-button row-delete" type="submit" aria-label={`Delete ${item.title}`}><Trash2 size={14} /></button></form>
          </div>)}</div> : <EmptyState title={search ? "No matching steps" : filter === "done" ? "Nothing completed yet" : "A fresh start"} description={search ? "Try a different search or switch to All items." : "Add your first next step above, or use the starter list to get moving."} icon={icon} />}
        </Panel>
      </div>

      <div className="stack">
        <Panel title="A clear next step" subtitle="Turn a big outcome into a small action">
          <div className="reminder-box"><span>{icon}</span><p>{area.id === "abroad" ? "Start with one decision: country, course, document, or deadline." : area.id === "career" ? "Choose one action that moves your work or job search forward." : area.id === "ideas" ? "Save the thought now. Decide what it means later." : "Choose one specific action you can finish in a short block."}</p></div>
        </Panel>
        <Panel title="Progress" subtitle="Your open steps in this area">
          <div className="area-progress-row"><span className="progress-ring">{items.length ? Math.round((items.length - openCount) / items.length * 100) : 0}%</span><div><b>{openCount} open step{openCount === 1 ? "" : "s"}</b><small>{items.length - openCount} completed · {items.length} total shown</small></div></div>
          <div className="progress-track"><i style={{ width: `${items.length ? Math.round((items.length - openCount) / items.length * 100) : 0}%` }} /></div>
        </Panel>
      </div>
    </div>
  </>;
}
