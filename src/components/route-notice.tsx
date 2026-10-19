import { ActionMessage } from "@/components/ui";

export async function RouteNotice({ searchParams }: { searchParams: Promise<{ message?: string; tone?: string }> }) {
  const params = await searchParams;
  return <ActionMessage message={params.message} error={params.tone === "error"} />;
}
