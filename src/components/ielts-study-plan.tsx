"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, Check, ChevronDown, Headphones, Volume2 } from "lucide-react";
import { saveIeltsPractice } from "@/lib/actions/ielts";
import { Panel } from "@/components/ui";
import { IELTS_BOOK_CHAPTERS, IELTS_BOOK_SECTIONS, type IeltsBookChapter } from "@/lib/ielts-course";
import { formatNumber, translate, type Locale } from "@/lib/i18n";
import { IELTS_BEGINNER_HELP } from "@/lib/learning-books";

type VoiceAccent = "en-US" | "en-GB";

export function IeltsStudyPlan({ locale, completedChapterIds, today }: { locale: Locale; completedChapterIds: string[]; today: string }) {
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const [completed, setCompleted] = useState(() => new Set(completedChapterIds));
  const firstOpenChapter = IELTS_BOOK_CHAPTERS.find((chapter) => !completedChapterIds.includes(chapter.id));
  const [section, setSection] = useState<IeltsBookChapter["section"]>(firstOpenChapter?.section || "Academic Writing");
  const [openId, setOpenId] = useState(firstOpenChapter?.id || IELTS_BOOK_CHAPTERS[0].id);
  const [accent, setAccent] = useState<VoiceAccent>("en-US");
  const [voiceNotice, setVoiceNotice] = useState("");
  const sectionChapters = useMemo(() => IELTS_BOOK_CHAPTERS.filter((chapter) => chapter.section === section), [section]);
  const completedCount = IELTS_BOOK_CHAPTERS.filter((chapter) => completed.has(chapter.id)).length;

  useEffect(() => {
    setCompleted(new Set(completedChapterIds));
  }, [completedChapterIds]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("life-os-speaking-accent");
      if (saved === "en-US" || saved === "en-GB") setAccent(saved);
    } catch {
      // Browser voice preferences are optional.
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function chooseSection(nextSection: IeltsBookChapter["section"]) {
    setSection(nextSection);
    const first = IELTS_BOOK_CHAPTERS.find((chapter) => chapter.section === nextSection && !completed.has(chapter.id));
    setOpenId(first?.id || IELTS_BOOK_CHAPTERS.find((chapter) => chapter.section === nextSection)?.id || "");
  }

  function speakChapter(chapter: IeltsBookChapter) {
    if (!("speechSynthesis" in window)) {
      setVoiceNotice(t("English voice playback is unavailable in this browser."));
      return;
    }
    setVoiceNotice("");
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(`${chapter.title}. Goal: ${chapter.goal} Practice: ${chapter.practice}`);
    utterance.lang = accent;
    utterance.rate = 0.88;
    const voice = synthesis.getVoices().find((entry) => entry.lang.toLowerCase() === accent.toLowerCase())
      || synthesis.getVoices().find((entry) => entry.lang.toLowerCase().startsWith(accent.slice(0, 2).toLowerCase()));
    if (voice) utterance.voice = voice;
    synthesis.cancel();
    synthesis.speak(utterance);
  }

  return <Panel title={t("IELTS book: guided 38-chapter plan")} subtitle={t("Work through every chapter with a short original practice task, listen to the instructions, and save your progress.")}>
    <div className="beginner-entry-banner" lang="bn"><div><b>বই থেকে পড়ুন, তারপর চর্চা করুন</b><p>একটি অধ্যায় বেছে নিন → বইয়ের উদাহরণ পড়ুন → নিচের কাজটি করুন → সময় দিয়ে অনুশীলন সংরক্ষণ করুন।</p></div><Link className="button button-primary" href="/dashboard/learn?book=ielts">IELTS বই খুলুন</Link></div>
    <div className="ielts-plan-intro">
      <span className="ielts-plan-bookmark"><BookOpenCheck size={17} /></span>
      <p>{t("Structured from the chapter outline in Ghore Boshe IELTS Prostuti. The practice prompts and examples here are freshly written for your app.")}</p>
      <label className="form-field ielts-voice-select"><span>{t("Listening voice")}</span><select className="select" value={accent} onChange={(event) => setAccent(event.target.value as VoiceAccent)}><option value="en-US">US English</option><option value="en-GB">UK English</option></select></label>
    </div>

    <div className="ielts-plan-progress"><div><b>{formatNumber(locale, completedCount)} / {formatNumber(locale, IELTS_BOOK_CHAPTERS.length)}</b><span>{t("chapters practised")}</span></div><div className="progress-track"><i style={{ width: `${Math.round(completedCount / IELTS_BOOK_CHAPTERS.length * 100)}%` }} /></div><small>{completedCount === IELTS_BOOK_CHAPTERS.length ? t("All chapters completed. Revisit any section to practise again.") : t("Save a chapter practice to keep your place.")}</small></div>

    <div className="ielts-section-tabs" role="group" aria-label={t("IELTS study sections")}>
      {IELTS_BOOK_SECTIONS.map((entry) => {
        const total = IELTS_BOOK_CHAPTERS.filter((chapter) => chapter.section === entry).length;
        const done = IELTS_BOOK_CHAPTERS.filter((chapter) => chapter.section === entry && completed.has(chapter.id)).length;
        return <button type="button" key={entry} className={`ielts-section-tab ${section === entry ? "active" : ""}`} aria-pressed={section === entry} onClick={() => chooseSection(entry)}><span>{t(entry)}</span><small>{formatNumber(locale, done)}/{formatNumber(locale, total)}</small></button>;
      })}
    </div>

    <p className="ielts-bangla-help" lang="bn"><b>সহজভাবে শুরু করুন: </b>{IELTS_BEGINNER_HELP[section]}</p>
    <div className="ielts-chapter-list">
      {sectionChapters.map((chapter) => {
        const isOpen = openId === chapter.id;
        const isDone = completed.has(chapter.id);
        return <article className={`ielts-chapter ${isOpen ? "open" : ""} ${isDone ? "complete" : ""}`} key={chapter.id}>
          <button type="button" className="ielts-chapter-toggle" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? "" : chapter.id)}>
            <span className="ielts-chapter-number">{isDone ? <Check size={14} /> : formatNumber(locale, IELTS_BOOK_CHAPTERS.findIndex((entry) => entry.id === chapter.id) + 1)}</span>
            <span className="ielts-chapter-name"><b>{chapter.title}</b><small>{t(chapter.skill)} · {isDone ? t("Practised") : t("Not started")}</small></span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {isOpen && <div className="ielts-chapter-content">
            <p><b>{t("Goal")}</b> {chapter.goal}</p>
            <p><b>{t("Practice task")}</b> {chapter.practice}</p>
            <div className="ielts-chapter-actions">
              <button type="button" className="button button-secondary button-small" onClick={() => speakChapter(chapter)}><Volume2 size={14} />{t("Hear this chapter")}</button>
              <form action={saveIeltsPractice} className="ielts-chapter-log-form">
                <input type="hidden" name="skill" value={chapter.skill} />
                <input type="hidden" name="bandScore" value="" />
                <input type="hidden" name="practicedAt" value={today} />
                <input type="hidden" name="note" value={`[IELTS-CHAPTER:${chapter.id}] ${chapter.title}: ${chapter.practice}`} />
                <label className="ielts-chapter-minutes form-field"><span>{t("Minutes")}</span><input className="input" type="number" name="durationMinutes" min={5} max={600} defaultValue={15} required /></label>
                <button className="button button-primary button-small" type="submit"><Headphones size={14} />{isDone ? t("Log another practice") : t("Save chapter practice")}</button>
              </form>
            </div>
          </div>}
        </article>;
      })}
    </div>
    {voiceNotice && <p className="practice-notice" role="status">{voiceNotice}</p>}
    <p className="ielts-plan-footnote">{t("Use the book for its full explanations. For current exam logistics and booking details, confirm with the official IELTS provider in your location.")}</p>
  </Panel>;
}
