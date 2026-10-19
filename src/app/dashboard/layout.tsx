import { AppShell } from "@/components/app-shell";
import { ensureUserDefaults } from "@/lib/onboarding";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireCurrentUser();
  await ensureUserDefaults(user.id);
  return <AppShell user={{ id: user.id, name: user.name, email: user.email }}>{children}</AppShell>;
}
