"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { APPLICATION_STATUSES, APPLICATION_TYPES } from "@/lib/constants";
import { dateFromField, field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const applicationSchema = z.object({
  title: z.string().trim().min(2).max(160),
  organization: z.string().trim().max(160).default(""),
  kind: z.enum(APPLICATION_TYPES).default("University"),
  status: z.enum(APPLICATION_STATUSES).default("Wishlist"),
  deadline: z.string().optional(),
  url: z.string().trim().max(500).default(""),
  note: z.string().trim().max(2000).default(""),
});

export async function createApplication(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = applicationSchema.safeParse({
    title: field(formData, "title"), organization: field(formData, "organization"),
    kind: field(formData, "kind") || "University", status: field(formData, "status") || "Wishlist",
    deadline: field(formData, "deadline"), url: field(formData, "url"), note: field(formData, "note"),
  });
  if (!parsed.success) messageRedirect("/dashboard/applications", "Add the university, company or scholarship name.", true);
  const deadline = parsed.data.deadline ? dateFromField(parsed.data.deadline) : null;
  if (parsed.data.deadline && !deadline) messageRedirect("/dashboard/applications", "Choose a valid deadline.", true);
  if (parsed.data.url && !/^https?:\/\//i.test(parsed.data.url)) messageRedirect("/dashboard/applications", "Links must start with http:// or https://.", true);

  await prisma.application.create({ data: { ...parsed.data, deadline, userId: user.id } });
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
  messageRedirect("/dashboard/applications", "Application added to your tracker.");
}

export async function updateApplication(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const parsed = applicationSchema.safeParse({
    title: field(formData, "title"), organization: field(formData, "organization"),
    kind: field(formData, "kind") || "University", status: field(formData, "status") || "Wishlist",
    deadline: field(formData, "deadline"), url: field(formData, "url"), note: field(formData, "note"),
  });
  if (!parsed.success) messageRedirect("/dashboard/applications", "Add an application name and check the other fields.", true);
  const deadline = parsed.data.deadline ? dateFromField(parsed.data.deadline) : null;
  if (parsed.data.deadline && !deadline) messageRedirect("/dashboard/applications", "Choose a valid deadline.", true);
  if (parsed.data.url && !/^https?:\/\//i.test(parsed.data.url)) messageRedirect("/dashboard/applications", "Links must start with http:// or https://.", true);
  const result = await prisma.application.updateMany({ where: { id, userId: user.id }, data: { ...parsed.data, deadline } });
  if (!result.count) messageRedirect("/dashboard/applications", "That application could not be found.", true);
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
  messageRedirect("/dashboard/applications", "Application updated.");
}

export async function updateApplicationStatus(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const status = z.enum(APPLICATION_STATUSES).safeParse(field(formData, "status"));
  if (!status.success) messageRedirect("/dashboard/applications", "Choose a valid application stage.", true);
  const result = await prisma.application.updateMany({ where: { id, userId: user.id }, data: { status: status.data } });
  if (!result.count) messageRedirect("/dashboard/applications", "That application could not be found.", true);
  revalidatePath("/dashboard/applications");
}

export async function deleteApplication(formData: FormData) {
  const user = await requireCurrentUser();
  await prisma.application.deleteMany({ where: { id: field(formData, "id"), userId: user.id } });
  revalidatePath("/dashboard/applications");
  messageRedirect("/dashboard/applications", "Application removed.");
}
