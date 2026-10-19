"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const path = "/dashboard/documents";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ACCOUNT_BYTES = 15 * 1024 * 1024;
const categories = ["CV/Resume", "Passport/Identity", "Academic records", "IELTS/English scores", "Statement/Recommendation", "Financial records", "Other"] as const;
const mimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadDocument(formData: FormData) {
  const user = await requireCurrentUser();
  const category = z.enum(categories).safeParse(field(formData, "category"));
  const file = formData.get("file");
  if (!category.success || !file || typeof file !== "object" || !("arrayBuffer" in file)) messageRedirect(path, "Choose a document category and file.", true);
  const upload = file as File;
  if (!upload.size || upload.size > MAX_FILE_BYTES) messageRedirect(path, "Each document must be smaller than 5 MB.", true);
  if (!mimeTypes.has(upload.type)) messageRedirect(path, "Use a PDF, Word document, JPG, PNG or WebP file.", true);
  const name = upload.name.split(/[\\/]/).pop()?.replace(/[\r\n\u0000]/g, " ").trim().slice(0, 180) || "Personal document";
  const existing = await prisma.personalDocument.aggregate({ where: { userId: user.id }, _sum: { sizeBytes: true } });
  if ((existing._sum.sizeBytes || 0) + upload.size > MAX_ACCOUNT_BYTES) messageRedirect(path, "Your private document storage limit is 15 MB. Remove a file before adding another.", true);
  const content = Buffer.from(await upload.arrayBuffer());
  await prisma.personalDocument.create({ data: { userId: user.id, name, category: category.data, mimeType: upload.type, sizeBytes: content.byteLength, content } });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "Document saved privately.");
}

export async function deleteDocument(formData: FormData) {
  const user = await requireCurrentUser();
  await prisma.personalDocument.deleteMany({ where: { id: field(formData, "id"), userId: user.id } });
  revalidatePath(path);
  revalidatePath("/dashboard");
  messageRedirect(path, "Document removed.");
}
