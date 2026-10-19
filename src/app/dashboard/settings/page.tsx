import { Database, Download, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { BackupRestore } from "@/components/backup-restore";
import { LegacyBackupImport } from "@/components/legacy-backup-import";
import { RouteNotice } from "@/components/route-notice";
import { PageHeader, Panel, SubmitButton } from "@/components/ui";
import { updateProfile } from "@/lib/actions/profile";
import { requireCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { translate } from "@/lib/i18n";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  const t = (message: string) => translate(locale, message);
  return <>
    <PageHeader eyebrow={t("YOUR WORKSPACE")} title={t("Settings & backup")} description={t("Update your profile and keep a portable copy of your personal data.")} />
    <RouteNotice searchParams={searchParams} locale={locale} />
    <div className="settings-layout">
      <div className="stack">
        <Panel title={t("Profile")} subtitle={t("This name is shown in your workspace.")} action={<span className="panel-icon"><UserRound size={15} /></span>}>
          <form action={updateProfile} className="settings-form">
            <label className="form-field"><span>{t("Display name")}</span><input className="input" name="name" required minLength={2} maxLength={80} defaultValue={user.name} /></label>
            <label className="form-field"><span>{t("Email address")}</span><input className="input" type="email" value={user.email} readOnly disabled /><small>{t("Email is used to sign in to this account.")}</small></label>
            <div className="form-actions"><SubmitButton>{t("Save profile")}</SubmitButton></div>
          </form>
        </Panel>
        <Panel title={t("Data backup")} subtitle={t("Export everything in your Life OS workspace as a JSON file.")} action={<span className="panel-icon"><Database size={15} /></span>}>
          <p className="settings-copy">{t("Your backup includes life area steps, habits and check-ins, applications, money transactions, accounts, categories, card details and images, focus sessions, interview practice, and weekly reviews. It does not include your password or sign-in sessions.")}</p>
          <BackupRestore locale={locale} />
        </Panel>
        <Panel title={t("Import your old standalone data")} subtitle={t("Bring tasks, habits, applications and wallet records from the original HTML app into this workspace.")}>
          <p className="settings-copy">{t("In the original app, open Backup and choose Create / copy backup. Paste that JSON here, or load a saved `.json` file. This replaces the personal data in this workspace after validation.")}</p>
          <LegacyBackupImport locale={locale} />
        </Panel>
      </div>
      <div className="stack">
        <Panel title={t("Restore details")} subtitle={t("Keep a copy of the current data before restoring an older file.")} action={<span className="panel-icon"><Download size={15} /></span>}>
          <div className="settings-notice"><LockKeyhole size={16} /><p>{t("Restore replaces personal workspace data with the selected backup. The replacement happens in one database transaction, so an invalid backup will not partially overwrite your data.")}</p></div>
          <div className="setting-row"><span><b>{t("Account")}</b><small>{user.email}</small></span><span className="badge">{t("Private")}</span></div>
          <div className="setting-row"><span><b>{t("Backup format")}</b><small>Life OS JSON · {t("version 1")}</small></span><span className="badge">{t("Portable")}</span></div>
        </Panel>
        <div id="help"><Panel title={t("Help & privacy")} subtitle={t("Your day-to-day data stays in your own workspace.")} className="help-panel">
          <p className="settings-copy">{t("Use the tabs in the sidebar to work with one area at a time. Money has separate sections for transactions, categories, accounts and cards. Card images are stored with your account and included in downloaded backups.")}</p>
          <Link className="text-link" href="/dashboard/money">{t("Open money settings →")}</Link>
        </Panel></div>
      </div>
    </div>
  </>;
}
