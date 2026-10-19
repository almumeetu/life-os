import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { getCurrentUser } from "@/lib/session";
import { LEARNING_BOOKS } from "@/lib/learning-books";
import { learningBookFile } from "@/lib/learning-book-files";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getCurrentUser()) return new Response("Sign in to read your books.", { status: 401 });
  const { id } = await params;
  const book = LEARNING_BOOKS.find((entry) => entry.id === id);
  if (!book) return new Response("Book not found.", { status: 404 });
  const query = new URL(request.url).searchParams;
  const download = query.get("download") === "1";
  const rawPage = query.get("page") || "1";
  const page = Number(rawPage);
  if (!download && (!/^\d+$/.test(rawPage) || !Number.isInteger(page) || page < 1 || page > book.pages)) {
    return new Response("Invalid page.", { status: 400 });
  }
  const filename = download ? "book.pdf" : `page-${String(page).padStart(3, "0")}.jpg`;
  const file = learningBookFile(book.id, filename);
  try {
    const metadata = await stat(file);
    return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>, {
      headers: {
        "Content-Type": download ? "application/pdf" : "image/jpeg",
        "Content-Length": String(metadata.size),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        ...(download ? { "Content-Disposition": `attachment; filename="${book.id}-book.pdf"` } : {}),
      },
    });
  } catch { return new Response("This book is not available on this server yet.", { status: 404 }); }
}
