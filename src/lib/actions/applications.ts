"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { dateFromField, field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const modeSchema = z.enum(["jobs", "study"]);
const statusSchema = z.enum(APPLICATION_STATUSES);
const allowedKinds = { jobs: ["Job"], study: ["University", "Scholarship"] } as const;
const pathForMode = (mode: "jobs" | "study") => mode === "jobs" ? "/dashboard/jobs" : "/dashboard/study-abroad";

const applicationSchema = z.object({
  title: z.string().trim().min(2).max(160),
  organization: z.string().trim().max(160).default(""),
  kind: z.enum(["Job", "University", "Scholarship"]),
  status: statusSchema.default("Wishlist"),
  deadline: z.string().optional(),
  url: z.string().trim().max(500).default(""),
  note: z.string().trim().max(2000).default(""),
});

function readMode(formData: FormData) {
  const parsed = modeSchema.safeParse(field(formData, "mode"));
  return parsed.success ? parsed.data : null;
}

function parseApplication(formData: FormData, mode: "jobs" | "study") {
  const kind = mode === "jobs" ? "Job" : field(formData, "kind");
  const parsed = applicationSchema.safeParse({
    title: field(formData, "title"), organization: field(formData, "organization"), kind,
    status: field(formData, "status") || "Wishlist", deadline: field(formData, "deadline"),
    url: field(formData, "url"), note: field(formData, "note"),
  });
  if (parsed.success && !(allowedKinds[mode] as readonly string[]).includes(parsed.data.kind)) return null;
  return parsed.success ? parsed.data : null;
}

function validateApplication(parsed: NonNullable<ReturnType<typeof parseApplication>>, mode: "jobs" | "study") {
  const path = pathForMode(mode);
  const deadline = parsed.deadline ? dateFromField(parsed.deadline) : null;
  if (parsed.deadline && !deadline) messageRedirect(path, "Choose a valid deadline.", true);
  if (parsed.url && !/^https?:\/\//i.test(parsed.url)) messageRedirect(path, "Links must start with http:// or https://.", true);
  return { ...parsed, deadline };
}

export async function createApplication(formData: FormData) {
  const user = await requireCurrentUser();
  const mode = readMode(formData);
  if (!mode) messageRedirect("/dashboard/jobs", "That tracker is not available.", true);
  const parsed = parseApplication(formData, mode);
  if (!parsed) messageRedirect(pathForMode(mode), "Add an opportunity name and check the other fields.", true);
  await prisma.application.create({ data: { ...validateApplication(parsed, mode), userId: user.id } });
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/study-abroad");
  revalidatePath("/dashboard");
  messageRedirect(pathForMode(mode), mode === "jobs" ? "Job added to your search." : "Study opportunity added.");
}

export async function updateApplication(formData: FormData) {
  const user = await requireCurrentUser();
  const mode = readMode(formData);
  if (!mode) messageRedirect("/dashboard/jobs", "That tracker is not available.", true);
  const id = field(formData, "id");
  const parsed = parseApplication(formData, mode);
  if (!parsed) messageRedirect(pathForMode(mode), "Add an opportunity name and check the other fields.", true);
  const data = validateApplication(parsed, mode);
  const result = await prisma.application.updateMany({
    where: { id, userId: user.id, kind: { in: [...allowedKinds[mode]] } },
    data,
  });
  if (!result.count) messageRedirect(pathForMode(mode), "That opportunity could not be found.", true);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/study-abroad");
  revalidatePath("/dashboard");
  messageRedirect(pathForMode(mode), "Opportunity updated.");
}

export async function updateApplicationStatus(formData: FormData) {
  const user = await requireCurrentUser();
  const mode = readMode(formData);
  if (!mode) messageRedirect("/dashboard/jobs", "That tracker is not available.", true);
  const path = pathForMode(mode);
  const status = statusSchema.safeParse(field(formData, "status"));
  if (!status.success) messageRedirect(path, "Choose a valid application stage.", true);
  const result = await prisma.application.updateMany({
    where: { id: field(formData, "id"), userId: user.id, kind: { in: [...allowedKinds[mode]] } },
    data: { status: status.data },
  });
  if (!result.count) messageRedirect(path, "That opportunity could not be found.", true);
  revalidatePath(path);
  revalidatePath("/dashboard");
}

export async function deleteApplication(formData: FormData) {
  const user = await requireCurrentUser();
  const mode = readMode(formData);
  if (!mode) messageRedirect("/dashboard/jobs", "That tracker is not available.", true);
  const path = pathForMode(mode);
  await prisma.application.deleteMany({
    where: { id: field(formData, "id"), userId: user.id, kind: { in: [...allowedKinds[mode]] } },
  });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "Opportunity removed.");
}
