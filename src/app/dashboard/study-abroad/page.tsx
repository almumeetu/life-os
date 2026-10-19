import Link from "next/link";
import { BookOpenCheck, FileText, Globe2 } from "lucide-react";
import { OpportunityTracker } from "@/components/opportunity-tracker";
import { StudyAbroadChecklist } from "@/components/study-abroad-checklist";
import { PageHeader } from "@/components/ui";
import { getLocale } from "@/lib/locale-server";
import { translate } from "@/lib/i18n";

export default async function StudyAbroadPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; edit?: string; message?: string; tone?: string; q?: string }> }) {
  const [query, locale] = await Promise.all([searchParams, getLocale()]);
  const t = (message: string) => translate(locale, message);
  const tab = query.tab === "applications" ? "applications" : "checklist";

  return <>
    <PageHeader eyebrow={t("YOUR STUDY PLAN")} title={t("Study abroad")} description={t("Manage university requirements, scholarships and your next study-abroad steps.")} actions={<span className="badge"><Globe2 size={12} /> {t("Study plan")}</span>} />
    <nav className="section-tabs" aria-label={t("Study-abroad sections")}>
      <Link className={`section-tab ${tab === "checklist" ? "active" : ""}`} href="/dashboard/study-abroad" aria-current={tab === "checklist" ? "page" : undefined}><FileText size={14} /> {t("Requirements checklist")}</Link>
      <Link className={`section-tab ${tab === "applications" ? "active" : ""}`} href="/dashboard/study-abroad?tab=applications" aria-current={tab === "applications" ? "page" : undefined}><BookOpenCheck size={14} /> {t("Universities & scholarships")}</Link>
    </nav>
    {tab === "applications" ? <OpportunityTracker mode="study" searchParams={searchParams} embedded /> : <StudyAbroadChecklist searchParams={searchParams} />}
  </>;
}
