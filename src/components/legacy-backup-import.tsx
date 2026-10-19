"use client";

import { FileUp, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { translate, type Locale } from "@/lib/i18n";

const maxBackupBytes = 25 * 1024 * 1024;

export function LegacyBackupImport({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = (message: string) => translate(locale, message);
  const fileInput = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > maxBackupBytes) {
      setMessage(t("Choose a backup file that is 25 MB or smaller."));
      return;
    }
    try {
      setBackup(await file.text());
      setMessage(t("Backup loaded. Review it, then choose Import."));
    } catch {
      setMessage(t("Could not read that file."));
    }
  }

  async function importBackup() {
    setMessage("");
    if (!backup.trim()) {
      setMessage(t("Paste the JSON from the standalone app or load its backup file."));
      return;
    }
    if (new Blob([backup]).size > maxBackupBytes) {
      setMessage(t("Backup text must be 25 MB or smaller."));
      return;
    }
    if (!window.confirm(t("Importing replaces the personal data currently in this workspace. Continue?"))) return;
    setBusy(true);
    try {
      const response = await fetch("/api/backup/legacy", { method: "POST", headers: { "Content-Type": "application/json" }, body: backup });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setMessage(result.message ? translate(locale, result.message) : t("The backup could not be imported."));
        return;
      }
      setMessage(result.message ? translate(locale, result.message) : t("Backup imported."));
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage(t("Could not reach the app. Your current workspace data was not changed."));
    } finally {
      setBusy(false);
    }
  }

  return <div className="legacy-import-form">
    <label className="form-field"><span>{t("Standalone app backup JSON")}</span><textarea className="textarea legacy-backup-textarea" value={backup} onChange={(event) => setBackup(event.target.value)} placeholder={t("Paste the backup text copied from the standalone Life OS app…")} /></label>
    <div className="backup-actions"><button className="button button-secondary" type="button" onClick={() => fileInput.current?.click()}><FileUp size={14} />{t("Load JSON file")}</button><button className="button button-primary" type="button" disabled={busy} onClick={importBackup}>{busy ? <LoaderCircle className="spin" size={14} /> : <FileUp size={14} />}{busy ? t("Importing…") : t("Import prototype backup")}</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={loadFile} /></div>
    {message && <p className="backup-message" role="status">{message}</p>}
  </div>;
}
