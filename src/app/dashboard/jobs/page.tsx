import { OpportunityTracker } from "@/components/opportunity-tracker";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ status?: string; edit?: string; message?: string; tone?: string }> }) {
  return <OpportunityTracker mode="jobs" searchParams={searchParams} />;
}
