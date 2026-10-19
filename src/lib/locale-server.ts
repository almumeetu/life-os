import { cookies } from "next/headers";
import { parseLocale } from "@/lib/i18n";

export async function getLocale() {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get("life-os-locale")?.value);
}
