"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const reviewSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  wins: z.string().trim().max(4000).default(""),
  lessons: z.string().trim().max(4000).default(""),
  nextFocus: z.string().trim().max(4000).default(""),
});

export async function saveWeeklyReview(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = reviewSchema.safeParse({ weekStart: field(formData, "weekStart"), wins: field(formData, "wins"), lessons: field(formData, "lessons"), nextFocus: field(formData, "nextFocus") });
  if (!parsed.success) messageRedirect("/dashboard/review", "The review date is invalid.", true);
  await prisma.weeklyReview.upsert({
    where: { userId_weekStart: { userId: user.id, weekStart: parsed.data.weekStart } },
    update: { wins: parsed.data.wins, lessons: parsed.data.lessons, nextFocus: parsed.data.nextFocus },
    create: { ...parsed.data, userId: user.id },
  });
  revalidatePath("/dashboard/review");
  messageRedirect("/dashboard/review", "Your weekly reflection was saved.");
}
