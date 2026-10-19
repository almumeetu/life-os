import "server-only";
import { redirect } from "next/navigation";

export function messageRedirect(path: string, message: string, error = false): never {
  const params = new URLSearchParams({ message, ...(error ? { tone: "error" } : {}) });
  redirect(`${path}${path.includes("?") ? "&" : "?"}${params.toString()}`);
}

export function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function dateFromField(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}
