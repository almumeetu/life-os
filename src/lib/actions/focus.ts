"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const sessionSchema = z.object({ durationSeconds: z.number().int().min(60).max(10_800), taskTitle: z.string().trim().max(160).default("") });

export async function recordFocusSession(input: { durationSeconds: number; taskTitle: string }) {
  const user = await requireCurrentUser();
  const parsed = sessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That focus session could not be saved." };
  await prisma.focusSession.create({ data: { ...parsed.data, userId: user.id } });
  revalidatePath("/dashboard/focus");
  revalidatePath("/dashboard");
  return { ok: true, message: "Focus session saved." };
}
