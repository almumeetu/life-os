import { AppShell } from "@/components/app-shell";
import { getLocale } from "@/lib/locale-server";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  return <AppShell locale={locale} user={{ id: user.id, name: user.name, email: user.email }}>{children}</AppShell>;
}
