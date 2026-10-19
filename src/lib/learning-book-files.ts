import "server-only";
import path from "node:path";
import { access } from "node:fs/promises";
import { LEARNING_BOOKS, type LearningBookId } from "@/lib/learning-books";

export function learningBookFile(id: LearningBookId, filename: string) {
  return path.join(process.env.LEARNING_BOOKS_DIR || path.join(process.cwd(), ".local/learning-books"), id, filename);
}

export async function availableLearningBooks(): Promise<LearningBookId[]> {
  const available = await Promise.all(LEARNING_BOOKS.map(async (book) => {
    try {
      await access(learningBookFile(book.id, "book.pdf"));
      await access(learningBookFile(book.id, "page-001.jpg"));
      return book.id;
    } catch { return null; }
  }));
  return available.filter((id): id is LearningBookId => id !== null);
}
