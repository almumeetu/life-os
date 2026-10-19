import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/locale-server";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Preparation Hub", template: "%s · Preparation Hub" },
  description: "A private workspace for interview practice, IELTS preparation, English speaking, job search and study abroad.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
