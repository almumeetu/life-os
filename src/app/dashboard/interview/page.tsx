import { Mic, Sparkles } from "lucide-react";
import { InterviewPractice } from "@/components/interview-practice";
import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

export default async function InterviewPage() {
  const user = await requireCurrentUser();
  const history = await prisma.interviewAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 });
  const words = history.reduce((total, attempt) => total + attempt.wordCount, 0);

  return <>
    <PageHeader eyebrow="CAREER & STUDY ABROAD" title="Interview practice" description="Practice job and admission questions, save your answers and build confidence a little at a time." actions={<span className="badge"><Sparkles size={12} /> {history.length} saved answers</span>} />
    <div className="interview-summary"><span className="interview-summary-icon"><Mic size={17} /></span><div><b>{history.length ? `${words} words practiced` : "A low-pressure place to rehearse"}</b><small>{history.length ? "Your recent practice is saved privately in your workspace." : "Start with a question, answer out loud or type, then save your practice."}</small></div></div>
    <InterviewPractice history={history} />
  </>;
}
