import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/locale-server";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Life OS", template: "%s · Life OS" },
  description: "A calm workspace for your plans, habits, applications and money.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
