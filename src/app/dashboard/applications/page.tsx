import Link from "next/link";
import { BriefcaseBusiness, ExternalLink, Plus, Trash2 } from "lucide-react";
import { createApplication, deleteApplication, updateApplication, updateApplicationStatus } from "@/lib/actions/applications";
import { RouteNotice } from "@/components/route-notice";
import { EmptyState, MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { APPLICATION_STATUSES, APPLICATION_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

type SearchParams = Promise<{ status?: string; edit?: string; message?: string; tone?: string }>;

function dateInput(date: Date | null) { return date ? date.toISOString().slice(0, 10) : ""; }
function badgeTone(status: string) { return status === "Offer" ? "green" : status === "Applied" ? "blue" : status === "Interview" ? "purple" : status === "Rejected" ? "red" : "orange"; }

export default async function ApplicationsPage({ searchParams }: { searchParams: SearchParams }) {
  const [user, query] = await Promise.all([requireCurrentUser(), searchParams]);
  const statusFilter = APPLICATION_STATUSES.includes(query.status as typeof APPLICATION_STATUSES[number]) ? query.status : "all";
  const [applications, editing] = await Promise.all([
    prisma.application.findMany({ where: { userId: user.id, ...(statusFilter === "all" ? {} : { status: statusFilter }) }, orderBy: [{ deadline: "asc" }, { createdAt: "desc" }] }),
    query.edit ? prisma.application.findFirst({ where: { id: query.edit, userId: user.id } }) : Promise.resolve(null),
  ]);
  const counts = Object.fromEntries(await Promise.all(APPLICATION_STATUSES.map(async (status) => [status, await prisma.application.count({ where: { userId: user.id, status } })])));
  const formAction = editing ? updateApplication : createApplication;

  return <>
    <PageHeader eyebrow="KEEP YOUR OPTIONS MOVING" title="Applications" description="Track universities, jobs and scholarships from shortlist to outcome." actions={<span className="badge"><BriefcaseBusiness size={12} /> {applications.length} shown</span>} />
    <RouteNotice searchParams={searchParams} />
    <div className="application-stage-grid">{APPLICATION_STATUSES.map((status) => <div className="stage-card" key={status}><small>{status.toUpperCase()}</small><b>{counts[status] || 0}</b></div>)}</div>

    <div className="dashboard-grid application-layout">
      <div className="stack">
        <Panel title={editing ? "Edit application" : "Add an application"} subtitle="Capture the next opportunity and its important details.">
          <form action={formAction}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-grid">
              <label className="form-field col-6"><span>Name</span><input className="input" name="title" required minLength={2} maxLength={160} defaultValue={editing?.title} placeholder="University, role or scholarship" /></label>
              <label className="form-field col-6"><span>Organization</span><input className="input" name="organization" maxLength={160} defaultValue={editing?.organization} placeholder="School, company or provider" /></label>
              <label className="form-field col-4"><span>Type</span><select className="select" name="kind" defaultValue={editing?.kind || "University"}>{APPLICATION_TYPES.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
              <label className="form-field col-4"><span>Stage</span><select className="select" name="status" defaultValue={editing?.status || "Wishlist"}>{APPLICATION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="form-field col-4"><span>Deadline</span><input className="input" type="date" name="deadline" defaultValue={dateInput(editing?.deadline || null)} /></label>
              <label className="form-field col-12"><span>Official link</span><input className="input" type="url" name="url" defaultValue={editing?.url} placeholder="https://…" /></label>
              <label className="form-field col-12"><span>Notes</span><textarea className="textarea" name="note" maxLength={2000} defaultValue={editing?.note} placeholder="Requirements, contacts, funding plan or follow-up" /></label>
            </div>
            <div className="form-actions"><SubmitButton>{editing ? "Save changes" : <><Plus size={14} />Add to tracker</>}</SubmitButton>{editing && <Link className="button button-secondary" href="/dashboard/applications">Cancel</Link>}</div>
          </form>
        </Panel>
        <Panel title="Your tracker" subtitle="Update the stage as you move through the process" action={<form method="get" className="stage-filter"><select className="select" name="status" defaultValue={statusFilter} aria-label="Filter applications"><option value="all">All stages</option>{APPLICATION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select><button className="button button-secondary button-small">Filter</button></form>}>
          {applications.length ? <div className="application-list">{applications.map((application) => <article className="application-card" key={application.id}>
            <div className="application-card-top"><div><span className="application-kind">{application.kind}</span><h3>{application.title}</h3><p>{application.organization || "Organization not set"}</p></div><span className={`badge badge-${badgeTone(application.status)}`}>{application.status}</span></div>
            <div className="application-details">{application.deadline && <span>Deadline · {new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "long", year: "numeric" }).format(application.deadline)}</span>}{application.url && <a href={application.url} target="_blank" rel="noreferrer">Official link <ExternalLink size={11} /></a>}</div>
            {application.note && <p className="application-note">{application.note}</p>}
            <div className="application-card-actions"><form action={updateApplicationStatus} className="status-form"><input type="hidden" name="id" value={application.id} /><select className="status-select" name="status" defaultValue={application.status} aria-label={`Stage for ${application.title}`}>{APPLICATION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select><button className="button button-secondary button-small" type="submit">Update stage</button></form><Link className="button button-quiet button-small" href={`/dashboard/applications?edit=${application.id}`}>Edit details</Link><form action={deleteApplication}><input type="hidden" name="id" value={application.id} /><button className="icon-button row-delete" type="submit" aria-label={`Delete ${application.title}`}><Trash2 size={14} /></button></form></div>
          </article>)}</div> : <EmptyState title="Your tracker is ready" description="Add a university, job or scholarship and keep its next deadline visible." icon={<BriefcaseBusiness size={17} />} />}
        </Panel>
      </div>
      <div className="stack"><Panel title="A useful next step" subtitle="Keep momentum without making the tracker a second job"><div className="reminder-box"><span>↗</span><p>For every application, write down the next action and a real deadline. Start with one opportunity you care about.</p></div></Panel><Panel title="Stage guide" subtitle="A clear place for each opportunity"><div className="stage-guide">{APPLICATION_STATUSES.map((status) => <div key={status}><span className={`badge badge-${badgeTone(status)}`}>{status}</span><small>{status === "Wishlist" ? "A possible fit" : status === "Preparing" ? "Gathering materials" : status === "Applied" ? "Submitted and waiting" : status === "Interview" ? "Preparing to meet" : status === "Offer" ? "An outcome received" : "Closed for now"}</small></div>)}</div></Panel></div>
    </div>
  </>;
}
