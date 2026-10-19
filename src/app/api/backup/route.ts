import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const id = z.string().min(1).max(100);
const text = (max: number) => z.string().max(max);
const date = z.coerce.date();
const nullableDate = date.nullable();
const image = z.string().max(900_000).nullable().refine((value) => !value || /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value));
const MAX_BACKUP_BYTES = 50 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_TOTAL_BYTES = 15 * 1024 * 1024;
const documentMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] as const;

const backupSchema = z.object({
  format: z.literal("life-os-backup"),
  version: z.literal(1),
  data: z.object({
    lifeItems: z.array(z.object({ id, area: text(30), title: text(160), note: text(1600), dueAt: nullableDate, priority: z.number().int().min(1).max(3), completed: z.boolean(), completedAt: nullableDate, createdAt: date, updatedAt: date })).max(20_000),
    habits: z.array(z.object({ id, title: text(100), color: text(30), createdAt: date, updatedAt: date })).max(5_000),
    habitCheckIns: z.array(z.object({ id, habitId: id, dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), createdAt: date })).max(100_000),
    applications: z.array(z.object({ id, title: text(160), organization: text(160), kind: text(40), status: text(40), deadline: nullableDate, url: text(500), note: text(2000), createdAt: date, updatedAt: date })).max(10_000),
    categories: z.array(z.object({ id, name: text(60), color: text(30), createdAt: date })).max(1_000),
    accounts: z.array(z.object({ id, name: text(80), institution: text(100), kind: text(40), last4: text(4), openingBalanceCents: z.number().int().min(-2_000_000_000).max(2_000_000_000), currency: z.string().regex(/^[A-Z]{3}$/), createdAt: date, updatedAt: date })).max(1_000),
    cards: z.array(z.object({ id, accountId: id.nullable(), name: text(80), kind: text(40), network: text(40), last4: text(4), imageData: image, createdAt: date, updatedAt: date })).max(2_000),
    transactions: z.array(z.object({ id, categoryId: id, accountId: id.nullable(), cardId: id.nullable(), kind: z.enum(["Income", "Expense"]), amountCents: z.number().int().positive().max(2_000_000_000), description: text(160), note: text(1200), occurredAt: date, createdAt: date, updatedAt: date })).max(100_000),
    focusSessions: z.array(z.object({ id, durationSeconds: z.number().int().min(1).max(10_800), taskTitle: text(160), completedAt: date })).max(100_000),
    reviews: z.array(z.object({ id, weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), wins: text(4000), lessons: text(4000), nextFocus: text(4000), createdAt: date, updatedAt: date })).max(10_000),
    interviewAttempts: z.array(z.object({ id, category: z.enum(["job", "admission"]), question: text(500), transcript: text(12_000), wordCount: z.number().int().min(0).max(20_000), wordsPerMinute: z.number().int().min(0).max(50_000), fillerCount: z.number().int().min(0).max(20_000), durationSeconds: z.number().int().min(0).max(3_600), createdAt: date })).max(100_000),
    ieltsGoal: z.object({ targetBand: z.number().min(0).max(9), examDate: nullableDate, updatedAt: date }).nullable().optional(),
    ieltsPractices: z.array(z.object({ id, skill: z.enum(["Listening", "Reading", "Writing", "Speaking"]), durationMinutes: z.number().int().min(5).max(600), bandScore: z.number().min(0).max(9).nullable(), note: text(2000), practicedAt: date })).max(100_000).optional().default([]),
    speakingAttempts: z.array(z.object({ id, topic: z.string().max(60), transcript: text(12_000), wordCount: z.number().int().min(0).max(20_000), wordsPerMinute: z.number().int().min(0).max(50_000), fillerCount: z.number().int().min(0).max(20_000), durationSeconds: z.number().int().min(0).max(3_600), createdAt: date })).max(100_000).optional().default([]),
    documents: z.array(z.object({ id, name: text(180), category: text(60), mimeType: z.enum(documentMimeTypes), sizeBytes: z.number().int().positive().max(MAX_DOCUMENT_BYTES), contentBase64: z.string().max(7_000_000).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/), createdAt: date })).max(100).optional().default([]),
  }),
});

function withoutKeys<T extends object>(record: T, keys: string[]) {
  const result: Record<string, unknown> = { ...(record as unknown as Record<string, unknown>) };
  for (const key of keys) delete result[key];
  return result;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to download a backup." }, { status: 401 });

  const [lifeItems, habits, applications, categories, accounts, cards, transactions, focusSessions, reviews, interviewAttempts, ieltsGoal, ieltsPractices, speakingAttempts, documents] = await Promise.all([
    prisma.lifeItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.habit.findMany({ where: { userId: user.id }, include: { checkIns: { orderBy: { dayKey: "asc" } } }, orderBy: { createdAt: "asc" } }),
    prisma.application.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.moneyCategory.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.financialAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.paymentCard.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.moneyTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.focusSession.findMany({ where: { userId: user.id }, orderBy: { completedAt: "asc" } }),
    prisma.weeklyReview.findMany({ where: { userId: user.id }, orderBy: { weekStart: "asc" } }),
    prisma.interviewAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.ieltsGoal.findUnique({ where: { userId: user.id } }),
    prisma.ieltsPractice.findMany({ where: { userId: user.id }, orderBy: { practicedAt: "asc" } }),
    prisma.speakingAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.personalDocument.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);

  const payload = {
    format: "life-os-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    workspace: { name: user.name },
    data: {
      lifeItems: lifeItems.map((row) => withoutKeys(row, ["userId"])),
      habits: habits.map((row) => withoutKeys(row, ["userId", "checkIns"])),
      habitCheckIns: habits.flatMap((habit) => habit.checkIns.map((row) => ({ ...withoutKeys(row, ["habitId"]), habitId: habit.id }))),
      applications: applications.map((row) => withoutKeys(row, ["userId"])),
      categories: categories.map((row) => withoutKeys(row, ["userId"])),
      accounts: accounts.map((row) => withoutKeys(row, ["userId"])),
      cards: cards.map((row) => withoutKeys(row, ["userId"])),
      transactions: transactions.map((row) => withoutKeys(row, ["userId"])),
      focusSessions: focusSessions.map((row) => withoutKeys(row, ["userId"])),
      reviews: reviews.map((row) => withoutKeys(row, ["userId"])),
      interviewAttempts: interviewAttempts.map((row) => withoutKeys(row, ["userId"])),
      ieltsGoal: ieltsGoal ? withoutKeys(ieltsGoal, ["userId"]) : null,
      ieltsPractices: ieltsPractices.map((row) => withoutKeys(row, ["userId"])),
      speakingAttempts: speakingAttempts.map((row) => withoutKeys(row, ["userId"])),
      documents: documents.map((row) => ({ ...withoutKeys(row, ["userId", "content"]), contentBase64: Buffer.from(row.content).toString("base64") })),
    },
  };
  const filename = `preparation-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in before restoring a backup." }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  try {
    if (origin && host && new URL(origin).host !== host) return NextResponse.json({ message: "This restore request could not be verified." }, { status: 403 });
  } catch {
    return NextResponse.json({ message: "This restore request could not be verified." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > MAX_BACKUP_BYTES) return NextResponse.json({ message: "Backup files must be 50 MB or smaller." }, { status: 413 });

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_BACKUP_BYTES) return NextResponse.json({ message: "Backup files must be 50 MB or smaller." }, { status: 413 });
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: "That file is not valid JSON." }, { status: 400 });
  }

  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ message: "This is not a supported Preparation Hub backup. Check the file and try again." }, { status: 400 });
  const data = parsed.data.data;
  const categoryIds = new Set(data.categories.map((row) => row.id));
  const accountIds = new Set(data.accounts.map((row) => row.id));
  const cardById = new Map(data.cards.map((row) => [row.id, row]));
  const habitIds = new Set(data.habits.map((row) => row.id));
  const documentBytes = data.documents.reduce((total, row) => total + row.sizeBytes, 0);
  const validReferences =
    data.habitCheckIns.every((row) => habitIds.has(row.habitId)) &&
    data.cards.every((row) => row.accountId === null || accountIds.has(row.accountId)) &&
    data.transactions.every((row) => categoryIds.has(row.categoryId) && (row.accountId === null || accountIds.has(row.accountId)) && (!row.cardId || cardById.has(row.cardId))) &&
    documentBytes <= MAX_DOCUMENT_TOTAL_BYTES &&
    data.documents.every((row) => Buffer.from(row.contentBase64, "base64").byteLength === row.sizeBytes);
  if (!validReferences) return NextResponse.json({ message: "The backup contains invalid references or document contents." }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.moneyTransaction.deleteMany({ where: { userId: user.id } });
      await tx.paymentCard.deleteMany({ where: { userId: user.id } });
      await tx.financialAccount.deleteMany({ where: { userId: user.id } });
      await tx.moneyCategory.deleteMany({ where: { userId: user.id } });
      await tx.habitCheckIn.deleteMany({ where: { habit: { userId: user.id } } });
      await tx.habit.deleteMany({ where: { userId: user.id } });
      await tx.lifeItem.deleteMany({ where: { userId: user.id } });
      await tx.application.deleteMany({ where: { userId: user.id } });
      await tx.focusSession.deleteMany({ where: { userId: user.id } });
      await tx.weeklyReview.deleteMany({ where: { userId: user.id } });
      await tx.interviewAttempt.deleteMany({ where: { userId: user.id } });
      await tx.personalDocument.deleteMany({ where: { userId: user.id } });
      await tx.speakingAttempt.deleteMany({ where: { userId: user.id } });
      await tx.ieltsPractice.deleteMany({ where: { userId: user.id } });
      await tx.ieltsGoal.deleteMany({ where: { userId: user.id } });

      if (data.lifeItems.length) await tx.lifeItem.createMany({ data: data.lifeItems.map((row) => ({ ...row, userId: user.id })) });
      if (data.habits.length) await tx.habit.createMany({ data: data.habits.map((row) => ({ ...row, userId: user.id })) });
      if (data.habitCheckIns.length) await tx.habitCheckIn.createMany({ data: data.habitCheckIns });
      if (data.applications.length) await tx.application.createMany({ data: data.applications.map((row) => ({ ...row, userId: user.id })) });
      if (data.categories.length) await tx.moneyCategory.createMany({ data: data.categories.map((row) => ({ ...row, userId: user.id })) });
      if (data.accounts.length) await tx.financialAccount.createMany({ data: data.accounts.map((row) => ({ ...row, userId: user.id })) });
      if (data.cards.length) await tx.paymentCard.createMany({ data: data.cards.map((row) => ({ ...row, userId: user.id })) });
      if (data.transactions.length) await tx.moneyTransaction.createMany({ data: data.transactions.map((row) => ({ ...row, userId: user.id })) });
      if (data.focusSessions.length) await tx.focusSession.createMany({ data: data.focusSessions.map((row) => ({ ...row, userId: user.id })) });
      if (data.reviews.length) await tx.weeklyReview.createMany({ data: data.reviews.map((row) => ({ ...row, userId: user.id })) });
      if (data.interviewAttempts.length) await tx.interviewAttempt.createMany({ data: data.interviewAttempts.map((row) => ({ ...row, userId: user.id })) });
      if (data.ieltsGoal) await tx.ieltsGoal.create({ data: { ...data.ieltsGoal, userId: user.id } });
      if (data.ieltsPractices.length) await tx.ieltsPractice.createMany({ data: data.ieltsPractices.map((row) => ({ ...row, userId: user.id })) });
      if (data.speakingAttempts.length) await tx.speakingAttempt.createMany({ data: data.speakingAttempts.map((row) => ({ ...row, userId: user.id })) });
      if (data.documents.length) await tx.personalDocument.createMany({ data: data.documents.map((row) => ({ id: row.id, name: row.name, category: row.category, mimeType: row.mimeType, sizeBytes: row.sizeBytes, content: Buffer.from(row.contentBase64, "base64"), createdAt: row.createdAt, userId: user.id })) });
    });
  } catch {
    return NextResponse.json({ message: "The restore could not be completed. Your existing data was kept." }, { status: 500 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ielts");
  revalidatePath("/dashboard/speaking");
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/study-abroad");
  revalidatePath("/dashboard/documents");
  return NextResponse.json({ message: "Your Preparation Hub backup has been restored." });
}
