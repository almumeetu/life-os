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

export function moneyToCents(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 20_000_000) return null;
  return Math.round(amount * 100);
}

export function signedMoneyToCents(value: string) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || Math.abs(amount) > 20_000_000) return null;
  return Math.round(amount * 100);
}
