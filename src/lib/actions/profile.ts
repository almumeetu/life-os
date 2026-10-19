"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { field, messageRedirect } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

export async function updateProfile(formData: FormData) {
  const user = await requireCurrentUser();
  const name = z.string().trim().min(2).max(80).safeParse(field(formData, "name"));
  if (!name.success) messageRedirect("/dashboard/settings", "Use a name between 2 and 80 characters.", true);
  await prisma.user.update({ where: { id: user.id }, data: { name: name.data } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  messageRedirect("/dashboard/settings", "Profile updated.");
}
