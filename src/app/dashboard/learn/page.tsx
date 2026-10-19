import { PageHeader } from "@/components/ui";
import { BookLearningRoom } from "@/components/book-learning-room";
import { requireCurrentUser } from "@/lib/session";
import { LEARNING_BOOKS } from "@/lib/learning-books";
import { availableLearningBooks } from "@/lib/learning-book-files";

export const runtime = "nodejs";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ book?: string; page?: string }> }) {
  const [user, query, available] = await Promise.all([requireCurrentUser(), searchParams, availableLearningBooks()]);
  const book = LEARNING_BOOKS.find((entry) => entry.id === query.book) || LEARNING_BOOKS[0];
  const requestedPage = Number(query.page);
  const initialPage = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= book.pages ? requestedPage : undefined;
  return <div lang="bn" className="learning-room">
    <PageHeader eyebrow="পড়ি → বুঝি → বলি → আবার চর্চা করি" title="বই পড়ে ইংরেজি শিখি" description="একদিনে পুরো বই নয়। আজ ১–২ পাতা পড়ুন, ৩টি বাক্য শিখুন, নিজের কথা বলুন। ভুল হলেও এগিয়ে যান।" />
    <BookLearningRoom key={`${book.id}-${initialPage ?? "resume"}`} book={book} available={available.includes(book.id)} userId={user.id} initialPage={initialPage} />
  </div>;
}
