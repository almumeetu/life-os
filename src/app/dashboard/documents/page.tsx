import Link from "next/link";
import { Download, FileText, FolderLock, Trash2, Upload } from "lucide-react";
import { EmptyState, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { RouteNotice } from "@/components/route-notice";
import { deleteDocument, uploadDocument } from "@/lib/actions/documents";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { formatDate, formatNumber, translate } from "@/lib/i18n";

const categories = ["CV/Resume", "Passport/Identity", "Academic records", "IELTS/English scores", "Statement/Recommendation", "Financial records", "Other"] as const;
const MAX_ACCOUNT_BYTES = 15 * 1024 * 1024;

function formatBytes(bytes: number, locale: string) {
  if (bytes < 1024 * 1024) return `${formatNumber(locale as "en" | "bn", Math.max(1, Math.round(bytes / 1024)))} KB`;
  return `${formatNumber(locale as "en" | "bn", bytes / (1024 * 1024), { maximumFractionDigits: 1 })} MB`;
}

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const documents = await prisma.personalDocument.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, category: true, mimeType: true, sizeBytes: true, createdAt: true } });
  const usedBytes = documents.reduce((total, document) => total + document.sizeBytes, 0);

  return <>
    <PageHeader eyebrow={t("PRIVATE FILES")}
      title={t("Personal documents")}
      description={t("Keep copies of the documents you need for jobs, IELTS and study abroad.")}
      actions={<span className="badge"><FolderLock size={12} /> {formatNumber(locale, documents.length)} {t("saved files")}</span>} />
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="dashboard-grid documents-layout">
      <Panel title={t("Save a document")} subtitle={t("PDF, Word, JPG, PNG or WebP · up to 5 MB per file.")}>
        <form action={uploadDocument} encType="multipart/form-data" className="settings-form">
          <label className="form-field"><span>{t("Document type")}</span><select className="select" name="category" required defaultValue="Academic records">{categories.map((category) => <option key={category} value={category}>{t(category)}</option>)}</select></label>
          <label className="form-field"><span>{t("Choose file")}</span><input className="input file-input" type="file" name="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp" /></label>
          <div className="form-actions"><SubmitButton><Upload size={14} />{t("Save document")}</SubmitButton></div>
        </form>
        <div className="document-storage"><span><FolderLock size={15} /> {t("Private storage used")}</span><b>{formatBytes(usedBytes, locale)} / 15 MB</b><div className="progress-track"><i style={{ width: `${Math.min(100, usedBytes / MAX_ACCOUNT_BYTES * 100)}%` }} /></div></div>
        <p className="settings-copy">{t("Files are stored in your account database. Downloads require sign-in. Keep exported backups private because they include document contents.")}</p>
      </Panel>
      <Panel title={t("Saved documents")} subtitle={t("Your files are only available to your signed-in account.")}>
        {documents.length ? <div className="document-list">{documents.map((document) => <article className="document-row" key={document.id}>
          <span className="document-icon"><FileText size={17} /></span>
          <div className="document-main"><b>{document.name}</b><small>{t(document.category)} · {formatBytes(document.sizeBytes, locale)} · {formatDate(locale, document.createdAt, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })}</small></div>
          <Link className="icon-button" href={`/api/documents/${document.id}`} aria-label={t("Download {name}", { name: document.name })}><Download size={15} /></Link>
          <form action={deleteDocument}><input type="hidden" name="id" value={document.id} /><button className="icon-button row-delete" type="submit" aria-label={t("Delete {name}", { name: document.name })}><Trash2 size={14} /></button></form>
        </article>)}</div> : <EmptyState title={t("No documents saved yet")} description={t("Add a CV, passport copy, academic record or another file you need for your plans.")} icon={<FileText size={17} />} />}
      </Panel>
    </div>
  </>;
}
