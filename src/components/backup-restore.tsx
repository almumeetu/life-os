"use client";

import { Download, FileUp, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { translate, type Locale } from "@/lib/i18n";

const maxBackupBytes = 25 * 1024 * 1024;

export function BackupRestore({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = (message: string) => translate(locale, message);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setMessage("");
    if (file.size > maxBackupBytes) {
      setMessage(t("Choose a backup file that is 25 MB or smaller."));
      return;
    }
    if (!window.confirm(t("Restoring replaces the personal data currently in this workspace with the backup. Continue?"))) return;
    setBusy(true);
    try {
      const contents = await file.text();
      const response = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: contents });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setMessage(result.message ? translate(locale, result.message) : t("The backup could not be restored."));
        return;
      }
      setMessage(result.message ? translate(locale, result.message) : t("Backup restored."));
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage(t("Could not read or restore that file. Your workspace data was not changed."));
    } finally {
      setBusy(false);
    }
  }

  return <div className="backup-actions">
    <a className="button button-secondary" href="/api/backup"><Download size={14} />{t("Download backup")}</a>
    <button className="button button-secondary" type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? <LoaderCircle className="spin" size={14} /> : <FileUp size={14} />}{busy ? t("Restoring…") : t("Restore backup")}</button>
    <input ref={input} className="visually-hidden" type="file" accept="application/json,.json" onChange={restore} aria-label={t("Choose a Life OS backup JSON file")} />
    {message && <p className="backup-message" role="status">{message}</p>}
  </div>;
}
