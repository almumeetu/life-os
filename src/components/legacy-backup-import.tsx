"use client";

import { FileUp, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

const maxBackupBytes = 25 * 1024 * 1024;

export function LegacyBackupImport() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > maxBackupBytes) {
      setMessage("Choose a backup file that is 25 MB or smaller.");
      return;
    }
    try {
      setBackup(await file.text());
      setMessage("Backup loaded. Review it, then choose Import.");
    } catch {
      setMessage("Could not read that file.");
    }
  }

  async function importBackup() {
    setMessage("");
    if (!backup.trim()) {
      setMessage("Paste the JSON from the standalone app or load its backup file.");
      return;
    }
    if (new Blob([backup]).size > maxBackupBytes) {
      setMessage("Backup text must be 25 MB or smaller.");
      return;
    }
    if (!window.confirm("Importing replaces the personal data currently in this workspace. Continue?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/backup/legacy", { method: "POST", headers: { "Content-Type": "application/json" }, body: backup });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setMessage(result.message || "The backup could not be imported.");
        return;
      }
      setMessage(result.message || "Backup imported.");
      window.location.assign("/dashboard");
    } catch {
      setMessage("Could not reach the app. Your current workspace data was not changed.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="legacy-import-form">
    <label className="form-field"><span>Standalone app backup JSON</span><textarea className="textarea legacy-backup-textarea" value={backup} onChange={(event) => setBackup(event.target.value)} placeholder="Paste the backup text copied from the standalone Life OS app…" /></label>
    <div className="backup-actions"><button className="button button-secondary" type="button" onClick={() => fileInput.current?.click()}><FileUp size={14} />Load JSON file</button><button className="button button-primary" type="button" disabled={busy} onClick={importBackup}>{busy ? <LoaderCircle className="spin" size={14} /> : <FileUp size={14} />}{busy ? "Importing…" : "Import prototype backup"}</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={loadFile} /></div>
    {message && <p className="backup-message" role="status">{message}</p>}
  </div>;
}
