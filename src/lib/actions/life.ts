"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LIFE_AREAS, STARTER_ITEMS } from "@/lib/constants";
import { dateFromField, field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const areaIds = LIFE_AREAS.map((area) => area.id) as [string, ...string[]];
const areaSchema = z.enum(areaIds);
const itemSchema = z.object({
  area: areaSchema,
  title: z.string().trim().min(2).max(160),
  note: z.string().trim().max(1600).default(""),
  dueAt: z.string().optional(),
  priority: z.coerce.number().int().min(1).max(3).default(2),
});

function areaPath(area: string) {
  return area === "abroad" ? "/dashboard/study-abroad" : "/dashboard";
}

export async function createLifeItem(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = itemSchema.safeParse({
    area: field(formData, "area"),
    title: field(formData, "title"),
    note: field(formData, "note"),
    dueAt: field(formData, "dueAt"),
    priority: field(formData, "priority") || 2,
  });

  if (!parsed.success) messageRedirect(areaPath(field(formData, "area") || "tasks"), "Add a title of at least 2 characters.", true);
  const dueAt = parsed.data.dueAt ? dateFromField(parsed.data.dueAt) : null;
  if (parsed.data.dueAt && !dueAt) messageRedirect(areaPath(parsed.data.area), "Choose a valid due date.", true);

  await prisma.lifeItem.create({ data: { ...parsed.data, userId: user.id, dueAt } });
  revalidatePath("/dashboard");
  revalidatePath(areaPath(parsed.data.area));
  messageRedirect(areaPath(parsed.data.area), "Your next step was added.");
}

export async function updateLifeItem(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const parsed = itemSchema.safeParse({
    area: field(formData, "area"), title: field(formData, "title"), note: field(formData, "note"),
    dueAt: field(formData, "dueAt"), priority: field(formData, "priority") || 2,
  });
  if (!parsed.success) messageRedirect(areaPath(field(formData, "area") || "tasks"), "Add a title of at least 2 characters.", true);
  const existing = await prisma.lifeItem.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) messageRedirect(areaPath(parsed.data.area), "That item could not be found.", true);
  const dueAt = parsed.data.dueAt ? dateFromField(parsed.data.dueAt) : null;
  if (parsed.data.dueAt && !dueAt) messageRedirect(areaPath(parsed.data.area), "Choose a valid due date.", true);

  await prisma.lifeItem.update({ where: { id: existing.id }, data: { ...parsed.data, dueAt } });
  revalidatePath("/dashboard");
  revalidatePath(areaPath(parsed.data.area));
  messageRedirect(areaPath(parsed.data.area), "Your step was updated.");
}

export async function toggleLifeItem(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const item = await prisma.lifeItem.findFirst({ where: { id, userId: user.id } });
  if (!item) messageRedirect("/dashboard", "That item could not be found.", true);

  await prisma.lifeItem.update({
    where: { id: item.id },
    data: { completed: !item.completed, completedAt: item.completed ? null : new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath(areaPath(item.area));
}

export async function deleteLifeItem(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const item = await prisma.lifeItem.findFirst({ where: { id, userId: user.id }, select: { area: true } });
  if (!item) messageRedirect("/dashboard", "That item could not be found.", true);
  await prisma.lifeItem.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
  revalidatePath(areaPath(item.area));
  messageRedirect(areaPath(item.area), "The item was removed.");
}

export async function addStarterItems(areaValue: string, _formData: FormData) {
  void _formData;
  const user = await requireCurrentUser();
  const area = areaSchema.safeParse(areaValue);
  if (!area.success) messageRedirect("/dashboard", "That area is not available.", true);
  const titles = STARTER_ITEMS[area.data] || [];
  if (!titles.length) messageRedirect(areaPath(area.data), "This area is ready for your own ideas.");

  const existing = await prisma.lifeItem.findMany({ where: { userId: user.id, area: area.data, title: { in: titles } }, select: { title: true } });
  const existingTitles = new Set(existing.map((item) => item.title));
  const missingTitles = titles.filter((title) => !existingTitles.has(title));
  if (!missingTitles.length) messageRedirect(areaPath(area.data), "Your starter steps are already in this list.");
  await prisma.lifeItem.createMany({
    data: missingTitles.map((title) => ({ userId: user.id, area: area.data, title })),
  });
  revalidatePath(areaPath(area.data));
  revalidatePath("/dashboard");
  messageRedirect(areaPath(area.data), "Starter steps added.");
}
