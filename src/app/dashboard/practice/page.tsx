import { LearningChallenge } from "@/components/learning-challenge";
import { PageHeader } from "@/components/ui";
import { getLocale } from "@/lib/locale-server";
import { requireCurrentUser } from "@/lib/session";

export default async function PracticePage() {
  const [user, locale] = await Promise.all([requireCurrentUser(), getLocale()]);
  return <>
    <PageHeader
      eyebrow={locale === "bn" ? "শিখি · চেষ্টা করি · মনে রাখি" : "EXPLORE · TRY · REMEMBER"}
      title={locale === "bn" ? "একটু খেলি, একটু শিখি" : "Your learning playground"}
      description={locale === "bn" ? "ছোট ছোট চ্যালেঞ্জে ইংরেজি চর্চা। প্রতিটি উত্তরের সঙ্গে সহজ ব্যাখ্যা।" : "Bite-sized English challenges, with a helpful explanation after every answer."}
    />
    <LearningChallenge userId={user.id} locale={locale} />
  </>;
}
