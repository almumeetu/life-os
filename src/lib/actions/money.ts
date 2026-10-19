"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateFromField, field, messageRedirect, moneyToCents, signedMoneyToCents } from "@/lib/actions/common";
import { ensureUserDefaults } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const kinds = ["Income", "Expense"] as const;
const accountKinds = ["Bank", "Mobile wallet", "Cash", "Savings", "Other"] as const;
const cardKinds = ["Debit", "Credit", "Prepaid"] as const;
const moneyUrl = (tab: string) => `/dashboard/money?tab=${tab}`;
const imageSchema = z.string().max(900_000).refine((image) => !image || /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(image), "Upload a supported image.");

export async function saveMoneyTransaction(formData: FormData) {
  const user = await requireCurrentUser();
  await ensureUserDefaults(user.id);
  const id = field(formData, "id");
  const kind = z.enum(kinds).safeParse(field(formData, "kind"));
  const amountCents = moneyToCents(field(formData, "amount"));
  const categoryId = field(formData, "categoryId");
  const accountIdInput = field(formData, "accountId");
  const cardId = field(formData, "cardId");
  const occurredAt = dateFromField(field(formData, "occurredAt")) || new Date();
  const description = field(formData, "description");
  const note = field(formData, "note");

  if (!kind.success || !amountCents || !description || description.length > 160 || note.length > 1200) {
    messageRedirect(moneyUrl("transactions"), "Enter a description, a valid amount and a transaction type.", true);
  }
  const [category, account, card, existing] = await Promise.all([
    prisma.moneyCategory.findFirst({ where: { id: categoryId, userId: user.id }, select: { id: true } }),
    accountIdInput ? prisma.financialAccount.findFirst({ where: { id: accountIdInput, userId: user.id }, select: { id: true } }) : prisma.financialAccount.findFirst({ where: { userId: user.id, kind: "Cash" }, select: { id: true } }),
    cardId ? prisma.paymentCard.findFirst({ where: { id: cardId, userId: user.id }, select: { id: true, accountId: true } }) : Promise.resolve(null),
    id ? prisma.moneyTransaction.findFirst({ where: { id, userId: user.id }, select: { id: true } }) : Promise.resolve(null),
  ]);
  if (!category) messageRedirect(moneyUrl("transactions"), "Choose one of your money categories.", true);
  if (!account) messageRedirect(moneyUrl("transactions"), "Choose one of your accounts.", true);
  if (cardId && !card) messageRedirect(moneyUrl("transactions"), "Choose one of your saved cards.", true);
  if (card?.accountId && card.accountId !== account.id) messageRedirect(moneyUrl("transactions"), "The selected card belongs to a different account.", true);
  if (id && !existing) messageRedirect(moneyUrl("transactions"), "That transaction could not be found.", true);

  const data = { kind: kind.data, amountCents, categoryId: category.id, accountId: account.id, cardId: card?.id || null, occurredAt, description, note, userId: user.id };
  if (existing) await prisma.moneyTransaction.update({ where: { id: existing.id }, data });
  else await prisma.moneyTransaction.create({ data });
  revalidatePath("/dashboard/money");
  revalidatePath("/dashboard");
  messageRedirect(moneyUrl("transactions"), existing ? "Transaction updated." : "Transaction added.");
}

export async function deleteMoneyTransaction(formData: FormData) {
  const user = await requireCurrentUser();
  await prisma.moneyTransaction.deleteMany({ where: { id: field(formData, "id"), userId: user.id } });
  revalidatePath("/dashboard/money");
  revalidatePath("/dashboard");
  messageRedirect(moneyUrl("transactions"), "Transaction removed.");
}

export async function saveMoneyCategory(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const name = field(formData, "name");
  if (name.length < 2 || name.length > 60) messageRedirect(moneyUrl("categories"), "Category names need 2–60 characters.", true);

  if (id) {
    const current = await prisma.moneyCategory.findFirst({ where: { id, userId: user.id }, select: { name: true } });
    if (!current) messageRedirect(moneyUrl("categories"), "That category could not be found.", true);
    if (current.name === "Other" && name !== "Other") messageRedirect(moneyUrl("categories"), "Keep Other as a safe fallback category.", true);
  }

  const existingName = await prisma.moneyCategory.findFirst({ where: { userId: user.id, name, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (existingName) messageRedirect(moneyUrl("categories"), "That category already exists.", true);
  if (id) {
    const result = await prisma.moneyCategory.updateMany({ where: { id, userId: user.id }, data: { name } });
    if (!result.count) messageRedirect(moneyUrl("categories"), "That category could not be found.", true);
  } else await prisma.moneyCategory.create({ data: { userId: user.id, name } });
  revalidatePath("/dashboard/money");
  messageRedirect(moneyUrl("categories"), id ? "Category renamed." : "Category added.");
}

export async function deleteMoneyCategory(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const category = await prisma.moneyCategory.findFirst({ where: { id, userId: user.id }, select: { name: true } });
  if (!category) messageRedirect(moneyUrl("categories"), "That category could not be found.", true);
  if (category.name === "Other") messageRedirect(moneyUrl("categories"), "Keep Other as a safe fallback category.", true);
  const fallback = await prisma.moneyCategory.findFirst({ where: { userId: user.id, name: "Other" }, select: { id: true } });
  if (!fallback) messageRedirect(moneyUrl("categories"), "Could not find the fallback category.", true);

  await prisma.$transaction([
    prisma.moneyTransaction.updateMany({ where: { userId: user.id, categoryId: id }, data: { categoryId: fallback.id } }),
    prisma.moneyCategory.deleteMany({ where: { id, userId: user.id } }),
  ]);
  revalidatePath("/dashboard/money");
  messageRedirect(moneyUrl("categories"), "Category removed; its transactions now use Other.");
}

export async function saveFinancialAccount(formData: FormData) {
  const user = await requireCurrentUser();
  await ensureUserDefaults(user.id);
  const id = field(formData, "id");
  const name = field(formData, "name");
  const institution = field(formData, "institution");
  const kind = z.enum(accountKinds).safeParse(field(formData, "kind"));
  const last4 = field(formData, "last4");
  const openingBalanceCents = signedMoneyToCents(field(formData, "openingBalance"));
  if (name.length < 2 || name.length > 80 || !kind.success || openingBalanceCents === null || institution.length > 100 || (last4 && !/^\d{4}$/.test(last4))) {
    messageRedirect(moneyUrl("accounts"), "Check the account name, type, opening balance and last four digits.", true);
  }
  if (id) {
    const current = await prisma.financialAccount.findFirst({ where: { id, userId: user.id }, select: { name: true, kind: true } });
    if (!current) messageRedirect(moneyUrl("accounts"), "That account could not be found.", true);
    if (current.name === "Cash wallet" && (name !== current.name || kind.data !== current.kind)) messageRedirect(moneyUrl("accounts"), "Keep Cash wallet’s name and type as the default account.", true);
  }
  const duplicate = await prisma.financialAccount.findFirst({ where: { userId: user.id, name, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (duplicate) messageRedirect(moneyUrl("accounts"), "An account with that name already exists.", true);
  const data = { name, institution, kind: kind.data, last4, openingBalanceCents };
  if (id) {
    const result = await prisma.financialAccount.updateMany({ where: { id, userId: user.id }, data });
    if (!result.count) messageRedirect(moneyUrl("accounts"), "That account could not be found.", true);
  } else await prisma.financialAccount.create({ data: { ...data, userId: user.id } });
  revalidatePath("/dashboard/money");
  revalidatePath("/dashboard");
  messageRedirect(moneyUrl("accounts"), id ? "Account updated." : "Account added.");
}

export async function deleteFinancialAccount(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const account = await prisma.financialAccount.findFirst({ where: { id, userId: user.id }, select: { id: true, name: true } });
  if (!account) messageRedirect(moneyUrl("accounts"), "That account could not be found.", true);
  if (account.name === "Cash wallet") messageRedirect(moneyUrl("accounts"), "Keep Cash wallet as the default account.", true);
  const cash = await prisma.financialAccount.findFirst({ where: { userId: user.id, name: "Cash wallet" }, select: { id: true } });
  if (!cash) messageRedirect(moneyUrl("accounts"), "The default cash account is missing.", true);
  await prisma.$transaction([
    prisma.moneyTransaction.updateMany({ where: { userId: user.id, accountId: id }, data: { accountId: cash.id } }),
    prisma.paymentCard.updateMany({ where: { userId: user.id, accountId: id }, data: { accountId: null } }),
    prisma.financialAccount.deleteMany({ where: { id, userId: user.id } }),
  ]);
  revalidatePath("/dashboard/money");
  messageRedirect(moneyUrl("accounts"), "Account removed. Its transactions remain in Cash wallet.");
}

export async function savePaymentCard(formData: FormData) {
  const user = await requireCurrentUser();
  const id = field(formData, "id");
  const name = field(formData, "name");
  const kind = z.enum(cardKinds).safeParse(field(formData, "kind"));
  const network = field(formData, "network");
  const last4 = field(formData, "last4");
  const accountId = field(formData, "accountId");
  const rawImage = field(formData, "imageData");
  const removeImage = field(formData, "removeImage") === "true";
  const imageData = imageSchema.safeParse(rawImage);
  if (name.length < 2 || name.length > 80 || !kind.success || network.length > 40 || (last4 && !/^\d{4}$/.test(last4)) || !imageData.success) {
    messageRedirect(moneyUrl("cards"), "Check the card name, type, network, last four digits and image.", true);
  }
  const [account, existing] = await Promise.all([
    accountId ? prisma.financialAccount.findFirst({ where: { id: accountId, userId: user.id }, select: { id: true } }) : Promise.resolve(null),
    id ? prisma.paymentCard.findFirst({ where: { id, userId: user.id }, select: { id: true, imageData: true } }) : Promise.resolve(null),
  ]);
  if (accountId && !account) messageRedirect(moneyUrl("cards"), "Choose one of your accounts.", true);
  if (id && !existing) messageRedirect(moneyUrl("cards"), "That card could not be found.", true);
  const data = { name, kind: kind.data, network, last4, accountId: account?.id || null, imageData: removeImage ? null : rawImage || existing?.imageData || null };
  if (existing) await prisma.paymentCard.update({ where: { id: existing.id }, data });
  else await prisma.paymentCard.create({ data: { ...data, userId: user.id } });
  revalidatePath("/dashboard/money");
  messageRedirect(moneyUrl("cards"), existing ? "Card updated." : "Card added.");
}

export async function deletePaymentCard(formData: FormData) {
  const user = await requireCurrentUser();
  await prisma.paymentCard.deleteMany({ where: { id: field(formData, "id"), userId: user.id } });
  revalidatePath("/dashboard/money");
  messageRedirect(moneyUrl("cards"), "Card removed. Saved transactions were kept.");
}
