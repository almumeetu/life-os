"use client";

import { Download, FileUp, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

const maxBackupBytes = 25 * 1024 * 1024;

export function BackupRestore() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setMessage("");
    if (file.size > maxBackupBytes) {
      setMessage("Choose a backup file that is 25 MB or smaller.");
      return;
    }
    if (!window.confirm("Restoring replaces the personal data currently in this workspace with the backup. Continue?")) return;
    setBusy(true);
    try {
      const contents = await file.text();
      const response = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: contents });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setMessage(result.message || "The backup could not be restored.");
        return;
      }
      setMessage(result.message || "Backup restored.");
      window.location.assign("/dashboard");
    } catch {
      setMessage("Could not read or restore that file. Your workspace data was not changed.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="backup-actions">
    <a className="button button-secondary" href="/api/backup"><Download size={14} />Download backup</a>
    <button className="button button-secondary" type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? <LoaderCircle className="spin" size={14} /> : <FileUp size={14} />}{busy ? "Restoring…" : "Restore backup"}</button>
    <input ref={input} className="visually-hidden" type="file" accept="application/json,.json" onChange={restore} aria-label="Choose a Life OS backup JSON file" />
    {message && <p className="backup-message" role="status">{message}</p>}
  </div>;
}
