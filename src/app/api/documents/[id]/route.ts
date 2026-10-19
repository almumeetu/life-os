import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to download this document." }, { status: 401 });
  const { id } = await params;
  const document = await prisma.personalDocument.findFirst({ where: { id, userId: user.id } });
  if (!document) return NextResponse.json({ message: "Document not found." }, { status: 404 });
  const safeName = document.name.replace(/[\r\n\u0000]/g, " ").slice(0, 180);
  return new Response(Buffer.from(document.content), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Length": String(document.sizeBytes),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
    },
  });
}
