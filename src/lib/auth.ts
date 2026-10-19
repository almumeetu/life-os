import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to a random value of at least 32 characters.");
}

export const auth = betterAuth({
  appName: "Saikat’s Life OS",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [nextCookies()],
});
