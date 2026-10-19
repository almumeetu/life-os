"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateFromField, field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const path = "/dashboard/ielts";
const skillSchema = z.enum(["Listening", "Reading", "Writing", "Speaking"]);
const bandSchema = z.number().min(0).max(9).refine((value) => Number.isInteger(value * 2), "Use a whole or half band score.");

export async function saveIeltsGoal(formData: FormData) {
  const user = await requireCurrentUser();
  const targetBand = bandSchema.safeParse(Number(field(formData, "targetBand")));
  if (!targetBand.success) messageRedirect(path, "Choose a valid target band from 0 to 9.", true);
  const examDateValue = field(formData, "examDate");
  const examDate = examDateValue ? dateFromField(examDateValue) : null;
  if (examDateValue && !examDate) messageRedirect(path, "Choose a valid exam date.", true);
  await prisma.ieltsGoal.upsert({
    where: { userId: user.id },
    create: { userId: user.id, targetBand: targetBand.data, examDate },
    update: { targetBand: targetBand.data, examDate },
  });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "IELTS goal saved.");
}

export async function saveIeltsPractice(formData: FormData) {
  const user = await requireCurrentUser();
  const skill = skillSchema.safeParse(field(formData, "skill"));
  const duration = z.coerce.number().int().min(5).max(600).safeParse(field(formData, "durationMinutes"));
  const scoreValue = field(formData, "bandScore");
  const bandScore = scoreValue ? bandSchema.safeParse(Number(scoreValue)) : null;
  const practicedAtValue = field(formData, "practicedAt");
  const practicedAt = practicedAtValue ? dateFromField(practicedAtValue) : null;
  const note = z.string().trim().max(2000).safeParse(field(formData, "note"));
  if (!skill.success || !duration.success || (bandScore && !bandScore.success) || !note.success) messageRedirect(path, "Check the skill, time and band score fields.", true);
  if (practicedAtValue && !practicedAt) messageRedirect(path, "Choose a valid practice date.", true);
  await prisma.ieltsPractice.create({ data: { userId: user.id, skill: skill.data, durationMinutes: duration.data, bandScore: bandScore?.data ?? null, note: note.data, practicedAt: practicedAt || new Date() } });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "IELTS practice saved.");
}

export async function deleteIeltsPractice(formData: FormData) {
  const user = await requireCurrentUser();
  await prisma.ieltsPractice.deleteMany({ where: { id: field(formData, "id"), userId: user.id } });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "Practice entry removed.");
}
