import { notFound, redirect } from "next/navigation";

export default async function LegacyAreaRedirect({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  if (area !== "abroad") notFound();
  redirect("/dashboard/study-abroad");
}
