import { Database, Download, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { BackupRestore } from "@/components/backup-restore";
import { LegacyBackupImport } from "@/components/legacy-backup-import";
import { RouteNotice } from "@/components/route-notice";
import { PageHeader, Panel, SubmitButton } from "@/components/ui";
import { updateProfile } from "@/lib/actions/profile";
import { requireCurrentUser } from "@/lib/session";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const user = await requireCurrentUser();
  return <>
    <PageHeader eyebrow="YOUR WORKSPACE" title="Settings & backup" description="Update your profile and keep a portable copy of your personal data." />
    <RouteNotice searchParams={searchParams} />
    <div className="settings-layout">
      <div className="stack">
        <Panel title="Profile" subtitle="This name is shown in your workspace." action={<span className="panel-icon"><UserRound size={15} /></span>}>
          <form action={updateProfile} className="settings-form">
            <label className="form-field"><span>Display name</span><input className="input" name="name" required minLength={2} maxLength={80} defaultValue={user.name} /></label>
            <label className="form-field"><span>Email address</span><input className="input" type="email" value={user.email} readOnly disabled /><small>Email is used to sign in to this account.</small></label>
            <div className="form-actions"><SubmitButton>Save profile</SubmitButton></div>
          </form>
        </Panel>
        <Panel title="Data backup" subtitle="Export everything in your Life OS workspace as a JSON file." action={<span className="panel-icon"><Database size={15} /></span>}>
          <p className="settings-copy">Your backup includes life area steps, habits and check-ins, applications, money transactions, accounts, categories, card details and images, focus sessions, interview practice, and weekly reviews. It does not include your password or sign-in sessions.</p>
          <BackupRestore />
        </Panel>
        <Panel title="Import your old standalone data" subtitle="Bring tasks, habits, applications and wallet records from the original HTML app into this workspace.">
          <p className="settings-copy">In the original app, open Backup and choose Create / copy backup. Paste that JSON here, or load a saved `.json` file. This replaces the personal data in this workspace after validation.</p>
          <LegacyBackupImport />
        </Panel>
      </div>
      <div className="stack">
        <Panel title="Restore details" subtitle="Keep a copy of the current data before restoring an older file." action={<span className="panel-icon"><Download size={15} /></span>}>
          <div className="settings-notice"><LockKeyhole size={16} /><p>Restore replaces personal workspace data with the selected backup. The replacement happens in one database transaction, so an invalid backup will not partially overwrite your data.</p></div>
          <div className="setting-row"><span><b>Account</b><small>{user.email}</small></span><span className="badge">Private</span></div>
          <div className="setting-row"><span><b>Backup format</b><small>Life OS JSON · version 1</small></span><span className="badge">Portable</span></div>
        </Panel>
        <div id="help"><Panel title="Help & privacy" subtitle="Your day-to-day data stays in your own workspace." className="help-panel">
          <p className="settings-copy">Use the tabs in the sidebar to work with one area at a time. Money has separate sections for transactions, categories, accounts and cards. Card images are stored with your account and included in downloaded backups.</p>
          <Link className="text-link" href="/dashboard/money">Open money settings →</Link>
        </Panel></div>
      </div>
    </div>
  </>;
}
