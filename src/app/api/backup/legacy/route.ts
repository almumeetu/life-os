import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_CATEGORIES, LIFE_AREAS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const oldId = z.union([z.string().max(100), z.number().int().transform(String)]).optional();
const dateKey = z.string().max(10).optional().default("").refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value));
const legacySchema = z.object({
  items: z.array(z.object({ id: oldId, m: z.string().max(40), t: z.string().trim().min(1).max(160), d: dateKey, p: z.coerce.number().int().min(1).max(3).optional().default(2), n: z.string().max(1600).optional().default(""), x: z.union([z.boolean(), z.number()]).optional().default(false), dn: dateKey })).max(20_000).default([]),
  hb: z.array(z.object({ id: oldId, t: z.string().trim().min(1).max(120), log: z.record(z.string(), z.union([z.boolean(), z.number()])).optional().default({}) })).max(5_000).default([]),
  ap: z.array(z.object({ id: oldId, t: z.string().trim().min(1).max(160), k: z.string().max(40).optional().default("University"), s: z.coerce.number().int().min(0).max(5).optional().default(0), d: dateKey, n: z.string().max(2000).optional().default("") })).max(10_000).default([]),
  wl: z.array(z.object({ id: oldId, a: z.coerce.number().finite().positive().max(20_000_000), t: z.string().max(20), c: z.string().max(60).optional().default("Other"), d: dateKey, n: z.string().max(160).optional().default("Transaction"), accountId: oldId, cardId: oldId })).max(100_000).default([]),
  wa: z.array(z.object({ id: oldId, n: z.string().trim().min(1).max(80), bank: z.string().max(100).optional().default(""), k: z.string().max(40).optional().default("Bank"), last4: z.string().max(4).optional().default(""), opening: z.coerce.number().finite().min(-20_000_000).max(20_000_000).optional().default(0) })).max(1_000).default([]),
  cards: z.array(z.object({ id: oldId, n: z.string().trim().min(1).max(80), k: z.string().max(40).optional().default("Debit"), network: z.string().max(40).optional().default(""), last4: z.string().max(4).optional().default(""), accountId: oldId, image: z.string().max(900_000).optional().default("") })).max(2_000).default([]),
  wcats: z.array(z.string().trim().min(2).max(60)).max(1_000).default([]),
  fs: z.record(z.string(), z.number().int().min(0).max(100)).optional().default({}),
  rv: z.record(z.string(), z.object({ w: z.string().max(4000).optional().default(""), l: z.string().max(4000).optional().default(""), n: z.string().max(4000).optional().default("") })).optional().default({}),
  mi: z.array(z.object({ q: z.string().trim().min(1).max(500), w: z.number().int().min(0).max(20_000).optional().default(0), p: z.number().int().min(0).max(50_000).optional().default(0), f: z.number().int().min(0).max(20_000).optional().default(0), d: dateKey })).max(20_000).default([]),
}).passthrough();

const statuses = ["Wishlist", "Preparing", "Applied", "Interview", "Offer", "Rejected"];
const today = () => new Date();
const validDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00.000Z`).getTime());
const noon = (value: string) => new Date(`${validDay(value) ? value : new Date().toISOString().slice(0, 10)}T12:00:00.000Z`);
const safeImage = (value: string) => value.length <= 900_000 && /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value) ? value : null;
const sourceId = (value?: string) => value || "";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in before importing a backup." }, { status: 401 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  try {
    if (origin && host && new URL(origin).host !== host) return NextResponse.json({ message: "This restore request could not be verified." }, { status: 403 });
  } catch {
    return NextResponse.json({ message: "This restore request could not be verified." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 25 * 1024 * 1024) return NextResponse.json({ message: "Backup text must be 25 MB or smaller." }, { status: 413 });

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > 25 * 1024 * 1024) return NextResponse.json({ message: "Backup text must be 25 MB or smaller." }, { status: 413 });
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: "Paste the JSON created by the standalone Life OS backup tool." }, { status: 400 });
  }
  const parsed = legacySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ message: "This is not a supported standalone Life OS backup." }, { status: 400 });
  const legacy = parsed.data;
  if (legacy.cards.some((card) => card.last4 && !/^\d{4}$/.test(card.last4)) || legacy.wa.some((account) => account.last4 && !/^\d{4}$/.test(account.last4))) {
    return NextResponse.json({ message: "Account and card details must contain only the last four digits." }, { status: 400 });
  }

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

      const categories = new Map<string, string>();
      const categoryNames = [...new Set([...DEFAULT_CATEGORIES, ...legacy.wcats].map((name) => name.trim()).filter((name) => name.length >= 2))];
      for (const name of categoryNames) {
        const key = name.toLocaleLowerCase();
        if (categories.has(key)) continue;
        const category = await tx.moneyCategory.create({ data: { userId: user.id, name } });
        categories.set(key, category.id);
      }
      const otherCategoryId = categories.get("other")!;

      const accounts = new Map<string, string>();
      const accountsByLegacyId = new Map<string, string>();
      const cashSource = legacy.wa.find((row) => row.n.toLocaleLowerCase() === "cash wallet");
      const accountRows = [{ id: cashSource?.id || "cash", n: "Cash wallet", bank: cashSource?.bank || "", k: "Cash", last4: cashSource?.last4 || "", opening: cashSource?.opening || 0 }, ...legacy.wa.filter((row) => row.n.toLocaleLowerCase() !== "cash wallet")];
      for (const row of accountRows) {
        const key = row.n.toLocaleLowerCase();
        if (accounts.has(key)) {
          if (row.id) accountsByLegacyId.set(sourceId(row.id), accounts.get(key)!);
          continue;
        }
        const account = await tx.financialAccount.create({ data: { userId: user.id, name: row.n, institution: row.bank, kind: row.k, last4: row.last4, openingBalanceCents: Math.round(row.opening * 100) } });
        accounts.set(key, account.id);
        if (row.id) accountsByLegacyId.set(sourceId(row.id), account.id);
      }
      const cashAccountId = accounts.get("cash wallet")!;
      accountsByLegacyId.set("cash", cashAccountId);

      const cardsByLegacyId = new Map<string, string>();
      for (const row of legacy.cards) {
        const card = await tx.paymentCard.create({ data: { userId: user.id, name: row.n, kind: ["Debit", "Credit", "Prepaid"].includes(row.k) ? row.k : "Debit", network: row.network, last4: row.last4, accountId: accountsByLegacyId.get(sourceId(row.accountId)) || null, imageData: safeImage(row.image) } });
        if (row.id) cardsByLegacyId.set(sourceId(row.id), card.id);
      }

      const seenHabits = new Set<string>();
      for (const row of legacy.hb) {
        const key = row.t.toLocaleLowerCase();
        if (seenHabits.has(key)) continue;
        seenHabits.add(key);
        const habit = await tx.habit.create({ data: { userId: user.id, title: row.t } });
        const checkIns = Object.entries(row.log).filter(([day, done]) => validDay(day) && Boolean(done)).map(([dayKey]) => ({ habitId: habit.id, dayKey, createdAt: noon(dayKey) }));
        for (let index = 0; index < checkIns.length; index += 500) await tx.habitCheckIn.createMany({ data: checkIns.slice(index, index + 500), skipDuplicates: true });
      }

      const lifeItems = legacy.items.flatMap((row) => {
        const area = LIFE_AREAS.find((item) => item.id === row.m)?.id;
        if (!area) return [];
        const completed = Boolean(row.x);
        return [{ userId: user.id, area, title: row.t, note: row.n, dueAt: validDay(row.d) ? noon(row.d) : null, priority: row.p, completed, completedAt: completed ? (validDay(row.dn) ? noon(row.dn) : today()) : null }];
      });
      for (let index = 0; index < lifeItems.length; index += 500) await tx.lifeItem.createMany({ data: lifeItems.slice(index, index + 500) });

      const applications = legacy.ap.map((row) => ({ userId: user.id, title: row.t, organization: "", kind: ["University", "Job", "Scholarship"].includes(row.k) ? row.k : "University", status: statuses[row.s] || "Wishlist", deadline: validDay(row.d) ? noon(row.d) : null, url: "", note: row.n }));
      for (let index = 0; index < applications.length; index += 500) await tx.application.createMany({ data: applications.slice(index, index + 500) });

      const transactions = legacy.wl.map((row) => ({
        userId: user.id,
        categoryId: categories.get(row.c.trim().toLocaleLowerCase()) || otherCategoryId,
        accountId: accountsByLegacyId.get(sourceId(row.accountId)) || cashAccountId,
        cardId: cardsByLegacyId.get(sourceId(row.cardId)) || null,
        kind: row.t === "in" || row.t === "Income" ? "Income" : "Expense",
        amountCents: Math.round(row.a * 100),
        description: row.n || row.c || "Transaction",
        note: "",
        occurredAt: noon(row.d),
      }));
      for (let index = 0; index < transactions.length; index += 500) await tx.moneyTransaction.createMany({ data: transactions.slice(index, index + 500) });

      const focusSessions = Object.entries(legacy.fs).flatMap(([day, count]) => validDay(day) ? Array.from({ length: Math.min(count, 100) }, () => ({ userId: user.id, durationSeconds: 25 * 60, taskTitle: "Legacy focus session", completedAt: noon(day) })) : []);
      for (let index = 0; index < focusSessions.length; index += 500) await tx.focusSession.createMany({ data: focusSessions.slice(index, index + 500) });

      const reviews = Object.entries(legacy.rv).flatMap(([weekStart, row]) => validDay(weekStart) ? [{ userId: user.id, weekStart, wins: row.w, lessons: row.l, nextFocus: row.n }] : []);
      for (const row of reviews) await tx.weeklyReview.upsert({ where: { userId_weekStart: { userId: user.id, weekStart: row.weekStart } }, update: row, create: row });

      const interviewAttempts = legacy.mi.flatMap((row) => {
        if (!row.q.trim()) return [];
        const durationSeconds = row.w && row.p ? Math.max(1, Math.round(row.w / row.p * 60)) : 60;
        return [{ userId: user.id, category: "job", question: row.q, transcript: "", wordCount: row.w, wordsPerMinute: row.p, fillerCount: row.f, durationSeconds, createdAt: noon(row.d) }];
      });
      for (let index = 0; index < interviewAttempts.length; index += 500) await tx.interviewAttempt.createMany({ data: interviewAttempts.slice(index, index + 500) });
    });
  } catch {
    return NextResponse.json({ message: "The import could not be completed. Your existing data was kept." }, { status: 500 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/money");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard/review");
  return NextResponse.json({ message: "Your standalone Life OS backup has been imported." });
}
