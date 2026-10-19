"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { SPEAKING_LESSONS, SPOKEN_ENGLISH_BOOK_LESSONS } from "@/lib/speaking-course";

const path = "/dashboard/speaking";
export async function saveSpeakingAttempt(input: { topic: string; transcript: string; durationSeconds: number }) {
  const user = await requireCurrentUser();
  const parsed = z.object({
    topic: z.string().max(60).refine((topic) => [...SPEAKING_LESSONS, ...SPOKEN_ENGLISH_BOOK_LESSONS].some((lesson) => lesson.id === topic)),
    transcript: z.string().trim().min(1).max(12_000),
    durationSeconds: z.number().int().min(0).max(3_600),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Write or speak an answer before saving." };
  const courseLessons = parsed.data.topic.startsWith("spoken-book-class-") ? SPOKEN_ENGLISH_BOOK_LESSONS : SPEAKING_LESSONS;
  const lessonIndex = courseLessons.findIndex((lesson) => lesson.id === parsed.data.topic);
  if (lessonIndex > 0) {
    const earlierLessons = courseLessons.slice(0, lessonIndex).map((lesson) => lesson.id);
    const completedEarlierLessons = await prisma.speakingAttempt.findMany({ where: { userId: user.id, topic: { in: earlierLessons } }, select: { topic: true }, distinct: ["topic"] });
    if (new Set(completedEarlierLessons.map((attempt) => attempt.topic)).size !== earlierLessons.length) return { ok: false, message: "Complete the earlier speaking lessons first." };
  }
  const words = parsed.data.transcript.match(/[\p{L}\p{N}’'-]+/gu) || [];
  const minimumWords = parsed.data.topic === SPEAKING_LESSONS[2].id ? 10 : 20;
  if (words.length < minimumWords) return { ok: false, message: `Say at least ${minimumWords} words before completing this lesson.` };
  const fillerCount = (parsed.data.transcript.match(/\b(um+|uh+|like|you know|actually|basically)\b/gi) || []).length;
  const wordsPerMinute = parsed.data.durationSeconds ? Math.round(words.length / (parsed.data.durationSeconds / 60)) : 0;
  await prisma.speakingAttempt.create({ data: { userId: user.id, ...parsed.data, wordCount: words.length, wordsPerMinute, fillerCount } });
  revalidatePath(path);
  revalidatePath("/dashboard");
  return { ok: true, message: "Speaking practice saved." };
}

export async function deleteSpeakingAttempt(formData: FormData) {
  const user = await requireCurrentUser();
  await prisma.speakingAttempt.deleteMany({ where: { id: field(formData, "id"), userId: user.id } });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "Speaking practice removed.");
}
