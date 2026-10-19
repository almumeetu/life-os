"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const attemptSchema = z.object({
  category: z.enum(["job", "admission"]),
  question: z.string().trim().min(4).max(500),
  transcript: z.string().trim().min(1).max(12_000),
  durationSeconds: z.number().int().min(1).max(3_600),
});

export async function saveInterviewAttempt(input: {
  category: string;
  question: string;
  transcript: string;
  durationSeconds: number;
}) {
  const user = await requireCurrentUser();
  const parsed = attemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Add an answer before saving your practice." };

  const words = parsed.data.transcript.match(/\b[\p{L}\p{N}’'-]+\b/gu) || [];
  const fillerCount = (parsed.data.transcript.match(/\b(um+|uh+|like|you know|actually|basically)\b/gi) || []).length;
  const wordsPerMinute = Math.round(words.length / (parsed.data.durationSeconds / 60));
  await prisma.interviewAttempt.create({
    data: {
      userId: user.id,
      ...parsed.data,
      wordCount: words.length,
      wordsPerMinute,
      fillerCount,
    },
  });
  revalidatePath("/dashboard/interview");
  revalidatePath("/dashboard");
  return { ok: true, message: "Practice answer saved to your history." };
}
