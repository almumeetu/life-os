import "server-only";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function ensureUserDefaults(userId: string) {
  await Promise.all([
    prisma.financialAccount.upsert({
      where: { userId_name: { userId, name: "Cash wallet" } },
      update: {},
      create: { userId, name: "Cash wallet", kind: "Cash", institution: "", openingBalanceCents: 0 },
    }),
    ...DEFAULT_CATEGORIES.map((name) =>
      prisma.moneyCategory.upsert({
        where: { userId_name: { userId, name } },
        update: {},
        create: { userId, name },
      }),
    ),
  ]);
}
