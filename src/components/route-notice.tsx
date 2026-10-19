import { ActionMessage } from "@/components/ui";
import { translate, type Locale } from "@/lib/i18n";

export async function RouteNotice({ searchParams, locale }: { searchParams: Promise<{ message?: string; tone?: string }>; locale: Locale }) {
  const params = await searchParams;
  return <ActionMessage message={params.message ? translate(locale, params.message) : undefined} error={params.tone === "error"} />;
}
