import Link from "next/link";
import { BriefcaseBusiness, ExternalLink, Plus, Trash2 } from "lucide-react";
import { createApplication, deleteApplication, updateApplication, updateApplicationStatus } from "@/lib/actions/applications";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

type Mode = "jobs" | "study";
type SearchParams = Promise<{ status?: string; edit?: string; message?: string; tone?: string; tab?: string }>;

function dateInput(date: Date | null) { return date ? date.toISOString().slice(0, 10) : ""; }
function badgeTone(status: string) { return status === "Offer" ? "green" : status === "Applied" ? "blue" : status === "Interview" ? "purple" : status === "Rejected" ? "red" : "orange"; }

export async function OpportunityTracker({ mode, searchParams, embedded = false }: { mode: Mode; searchParams: SearchParams; embedded?: boolean }) {
  const [user, query, locale] = await Promise.all([requireCurrentUser(), searchParams, getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const kinds = mode === "jobs" ? ["Job"] : ["University", "Scholarship"];
  const basePath = mode === "jobs" ? "/dashboard/jobs" : "/dashboard/study-abroad?tab=applications";
  const editPath = (id: string) => mode === "jobs" ? `${basePath}?edit=${encodeURIComponent(id)}` : `${basePath}&edit=${encodeURIComponent(id)}`;
  const statusFilter = APPLICATION_STATUSES.includes(query.status as typeof APPLICATION_STATUSES[number]) ? query.status : "all";
  const where = { userId: user.id, kind: { in: kinds }, ...(statusFilter === "all" ? {} : { status: statusFilter }) };
  const [applications, editing, counts] = await Promise.all([
    prisma.application.findMany({ where, orderBy: [{ deadline: "asc" }, { createdAt: "desc" }] }),
    query.edit ? prisma.application.findFirst({ where: { id: query.edit, userId: user.id, kind: { in: kinds } } }) : Promise.resolve(null),
    Promise.all(APPLICATION_STATUSES.map(async (status) => {
      const count = await prisma.application.count({ where: { userId: user.id, kind: { in: kinds }, status } });
      return [status, count] as const;
    })),
  ]);
  const countMap = Object.fromEntries(counts) as Record<string, number>;
  const formAction = editing ? updateApplication : createApplication;
  const heading = mode === "jobs" ? "Job search" : "Universities & scholarships";
  const titleLabel = mode === "jobs" ? "Job title" : "Name";
  const namePlaceholder = mode === "jobs" ? "e.g. Full-stack developer" : "University or scholarship";
  const organizationLabel = mode === "jobs" ? "Company" : "Organization";
  const organizationPlaceholder = mode === "jobs" ? "Company name" : "University or scholarship provider";

  return <>
    {!embedded && <PageHeader eyebrow={t(mode === "jobs" ? "FIND YOUR NEXT ROLE" : "PLAN YOUR STUDY ABROAD")}
      title={t(heading)}
      description={t(mode === "jobs" ? "Save roles, application links, deadlines and follow-ups in one place." : "Track universities and scholarships alongside your study-abroad requirements.")}
      actions={<span className="badge"><BriefcaseBusiness size={12} /> {formatNumber(locale, applications.length)} {t("shown")}</span>} />}
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="application-stage-grid" aria-label={t("Application stages")}>{APPLICATION_STATUSES.map((status) => <div className="stage-card" key={status}><small>{t(status).toUpperCase()}</small><b>{formatNumber(locale, countMap[status] || 0)}</b></div>)}</div>

    <div className="dashboard-grid application-layout">
      <div className="stack">
        <Panel title={t(editing ? "Edit opportunity" : mode === "jobs" ? "Save a job" : "Add a university or scholarship")} subtitle={t(mode === "jobs" ? "Record the role and its next action." : "Record an option and the requirements or dates that matter.")}>
          <form action={formAction}>
            <input type="hidden" name="mode" value={mode} />
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-grid">
              <label className="form-field col-6"><span>{t(titleLabel)}</span><input className="input" name="title" required minLength={2} maxLength={160} defaultValue={editing?.title} placeholder={t(namePlaceholder)} /></label>
              <label className="form-field col-6"><span>{t(organizationLabel)}</span><input className="input" name="organization" maxLength={160} defaultValue={editing?.organization} placeholder={t(organizationPlaceholder)} /></label>
              {mode === "study" && <label className="form-field col-4"><span>{t("Type")}</span><select className="select" name="kind" defaultValue={editing?.kind || "University"}><option value="University">{t("University")}</option><option value="Scholarship">{t("Scholarship")}</option></select></label>}
              <label className={`form-field ${mode === "jobs" ? "col-6" : "col-4"}`}><span>{t("Stage")}</span><select className="select" name="status" defaultValue={editing?.status || "Wishlist"}>{APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select></label>
              <label className={`form-field ${mode === "jobs" ? "col-6" : "col-4"}`}><span>{t(mode === "jobs" ? "Follow-up date" : "Deadline")}</span><input className="input" type="date" name="deadline" defaultValue={dateInput(editing?.deadline || null)} /></label>
              <label className="form-field col-12"><span>{t(mode === "jobs" ? "Job posting link" : "Official link")}</span><input className="input" type="url" name="url" defaultValue={editing?.url} placeholder="https://…" /></label>
              <label className="form-field col-12"><span>{t("Notes")}</span><textarea className="textarea" name="note" maxLength={2000} defaultValue={editing?.note} placeholder={t(mode === "jobs" ? "Requirements, contact or next follow-up" : "Entry requirements, funding or next action")} /></label>
            </div>
            <div className="form-actions"><SubmitButton>{editing ? t("Save changes") : <><Plus size={14} />{t(mode === "jobs" ? "Save job" : "Add to tracker")}</>}</SubmitButton>{editing && <Link className="button button-secondary" href={basePath}>{t("Cancel")}</Link>}</div>
          </form>
        </Panel>

        <Panel title={t(mode === "jobs" ? "Saved jobs" : "Study options")} subtitle={t("Update the stage as you move through the process.")} action={<form method="get" className="stage-filter">{mode === "study" && <input type="hidden" name="tab" value="applications" />}<select className="select" name="status" defaultValue={statusFilter} aria-label={t("Filter applications")}><option value="all">{t("All stages")}</option>{APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select><button className="button button-secondary button-small">{t("Filter")}</button></form>}>
          {applications.length ? <div className="application-list">{applications.map((application) => <article className="application-card" key={application.id}>
            <div className="application-card-top"><div><span className="application-kind">{t(application.kind)}</span><h3>{application.title}</h3><p>{application.organization || t("Organization not set")}</p></div><span className={`badge badge-${badgeTone(application.status)}`}>{t(application.status)}</span></div>
            <div className="application-details">{application.deadline && <span>{t(mode === "jobs" ? "Follow-up · " : "Deadline · ")}{formatDate(locale, application.deadline, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })}</span>}{application.url && <a href={application.url} target="_blank" rel="noreferrer">{t(mode === "jobs" ? "Job posting link" : "Official link")} <ExternalLink size={11} /></a>}</div>
            {application.note && <p className="application-note">{application.note}</p>}
            <div className="application-card-actions"><form action={updateApplicationStatus} className="status-form"><input type="hidden" name="mode" value={mode} /><input type="hidden" name="id" value={application.id} /><select className="status-select" name="status" defaultValue={application.status} aria-label={t("Stage for {title}", { title: application.title })}>{APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select><button className="button button-secondary button-small" type="submit">{t("Update stage")}</button></form><Link className="button button-quiet button-small" href={editPath(application.id)}>{t("Edit details")}</Link><form action={deleteApplication}><input type="hidden" name="mode" value={mode} /><input type="hidden" name="id" value={application.id} /><button className="icon-button row-delete" type="submit" aria-label={t("Delete {title}", { title: application.title })}><Trash2 size={14} /></button></form></div>
          </article>)}</div> : <EmptyState title={t("Your tracker is ready")} description={t(mode === "jobs" ? "Save a role to keep its application stage and follow-up visible." : "Add a university or scholarship and keep its next deadline visible.")} icon={<BriefcaseBusiness size={17} />} />}
        </Panel>
      </div>
      <div className="stack"><Panel title={t("A useful next step")} subtitle={t("Keep momentum without making the tracker a second job.")}><div className="reminder-box"><span>↗</span><p>{t(mode === "jobs" ? "For each role, save the application link and write down the next follow-up date." : "Check each university's official page and save its exact requirements and deadline in your notes.")}</p></div></Panel><Panel title={t("Stage guide")} subtitle={t("A clear place for each opportunity.")}><div className="stage-guide">{APPLICATION_STATUSES.map((status) => <div key={status}><span className={`badge badge-${badgeTone(status)}`}>{t(status)}</span><small>{t(status === "Wishlist" ? "A possible fit" : status === "Preparing" ? "Gathering materials" : status === "Applied" ? "Submitted and waiting" : status === "Interview" ? "Preparing to meet" : status === "Offer" ? "An outcome received" : "Closed for now")}</small></div>)}</div></Panel></div>
    </div>
  </>;
}
