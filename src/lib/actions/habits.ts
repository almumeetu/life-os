"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const habitSchema = z.object({ title: z.string().trim().min(2).max(120) });
const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function createHabit(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = habitSchema.safeParse({ title: field(formData, "title") });
  if (!parsed.success) messageRedirect("/dashboard/habits", "Give the habit a short name.", true);

  await prisma.habit.upsert({
    where: { userId_title: { userId: user.id, title: parsed.data.title } },
    update: {},
    create: { userId: user.id, title: parsed.data.title },
  });
  revalidatePath("/dashboard/habits");
  messageRedirect("/dashboard/habits", "Habit saved.");
}

export async function addStarterHabits(_formData: FormData) {
  const user = await requireCurrentUser();
  const titles = ["Speak English 20 min", "IELTS practice 30 min", "Walk 30 min", "Code 1 hour", "Read 15 min"];
  await Promise.all(titles.map((title) => prisma.habit.upsert({
    where: { userId_title: { userId: user.id, title } },
    update: {},
    create: { userId: user.id, title },
  })));
  revalidatePath("/dashboard/habits");
  messageRedirect("/dashboard/habits", "Starter habits are ready.");
}

export async function toggleHabitCheckIn(formData: FormData) {
  const user = await requireCurrentUser();
  const habitId = field(formData, "habitId");
  const dayKey = field(formData, "dayKey");
  if (!daySchema.safeParse(dayKey).success) messageRedirect("/dashboard/habits", "Choose a valid day.", true);
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: user.id }, select: { id: true } });
  if (!habit) messageRedirect("/dashboard/habits", "That habit could not be found.", true);

  const existing = await prisma.habitCheckIn.findUnique({ where: { habitId_dayKey: { habitId, dayKey } } });
  if (existing) await prisma.habitCheckIn.delete({ where: { id: existing.id } });
  else await prisma.habitCheckIn.create({ data: { habitId, dayKey } });
  revalidatePath("/dashboard/habits");
}

export async function deleteHabit(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  await prisma.habit.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/habits");
  messageRedirect("/dashboard/habits", "Habit removed.");
}
