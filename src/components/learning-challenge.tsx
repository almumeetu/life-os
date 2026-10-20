"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { CHALLENGE_TOPICS, LEARNING_CHALLENGES, parseChallengeProgress, type ChallengeTopic } from "@/lib/learning-challenges";
import { formatNumber, type Locale } from "@/lib/i18n";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("learning-challenge-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("learning-challenge-change", onChange);
  };
}

export function LearningChallenge({ userId, locale }: { userId: string; locale: Locale }) {
  const bn = locale === "bn";
  const copy = (en: string, bangla: string) => bn ? bangla : en;
  const number = (value: number) => formatNumber(locale, value);
  const [topic, setTopic] = useState<ChallengeTopic>("everyday");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const storageKey = `learning-challenges:v1:${userId}`;
  const rawProgress = useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  }, () => null);
  const progress = parseChallengeProgress(rawProgress);
  const questions = LEARNING_CHALLENGES[topic];
  const question = questions[Math.min(answers.length, questions.length - 1)];
  const score = answers.filter((answer, index) => answer === questions[index].answer).length;
  const reviewedCount = answers.length + (selected === null || finished ? 0 : 1);

  useEffect(() => {
    if (started) headingRef.current?.focus();
  }, [started, answers.length, finished]);

  function restart() {
    setAnswers([]);
    setSelected(null);
    setFinished(false);
    setStarted(false);
  }

  function advance() {
    if (selected === null || finished) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (nextAnswers.length === questions.length) {
      setFinished(true);
      const correct = nextAnswers.filter((answer, index) => answer === questions[index].answer).length;
      try {
        const latest = parseChallengeProgress(localStorage.getItem(storageKey));
        latest[topic] = { best: Math.max(latest[topic]?.best ?? 0, correct), rounds: Math.min((latest[topic]?.rounds ?? 0) + 1, 100000) };
        localStorage.setItem(storageKey, JSON.stringify(latest));
        setStorageError(false);
        window.dispatchEvent(new Event("learning-challenge-change"));
      } catch { setStorageError(true); }
    }
  }

  return <section className="challenge-room" aria-label={copy("English mini challenges", "ইংরেজির ছোট চ্যালেঞ্জ")}>
    <div className="challenge-topics" role="group" aria-label={copy("Choose a topic", "বিষয় বেছে নিন")}>
      {CHALLENGE_TOPICS.map((entry, index) => <button key={entry.id} type="button" className={`challenge-topic ${topic === entry.id ? "selected" : ""}`} aria-pressed={topic === entry.id} disabled={started && !finished} onClick={() => { setTopic(entry.id); restart(); }}>
        <span className="challenge-topic-number" aria-hidden="true">0{index + 1}</span>
        <b>{bn ? entry.titleBn : entry.title}</b>
        <small>{bn ? entry.descriptionBn : entry.description}</small>
        <span className="challenge-topic-status">{progress[entry.id] ? <><Check size={14} />{copy("Best", "সেরা")}: {number(progress[entry.id]!.best)}/{number(4)}</> : copy("4 questions · about 2 min", "৪টি প্রশ্ন · প্রায় ২ মিনিট")}</span>
      </button>)}
    </div>

    <div className="challenge-stage">
      {!started ? <div className="challenge-intro">
        <span className="challenge-emblem"><Sparkles size={32} /></span>
        <span className="eyebrow">{copy("A LITTLE PRACTICE, A LITTLE DISCOVERY", "ছোট্ট চর্চায় নতুন কিছু শিখি")}</span>
        <h2>{copy("Let's make English click.", "খেলতে খেলতে ইংরেজি শিখি।")}</h2>
        <p>{copy("Choose an answer, discover why it works, then try saying it aloud. Every mistake is something new to learn.", "উত্তর বেছে নিন, কেন সঠিক তা বুঝুন, তারপর জোরে বলুন। ভুল হলেও সমস্যা নেই—সেখান থেকেই নতুন কিছু শিখবেন।")}</p>
        <button className="button button-primary" type="button" onClick={() => setStarted(true)}>{copy("Start this challenge", "চ্যালেঞ্জ শুরু করি")}<ArrowRight size={17} /></button>
        <small>{copy("No timer. No pressure. Go at your own pace.", "সময় ধরার চাপ নেই। নিজের গতিতে এগিয়ে যান।")}</small>
      </div> : finished ? <div className="challenge-results">
        <span className="challenge-emblem"><Trophy size={32} /></span>
        <h2 ref={headingRef} tabIndex={-1}>{copy("A little more confident.", "আত্মবিশ্বাস আরেকটু বাড়ল।")}</h2>
        <p>{copy("You explored all four questions. Here's what to take with you.", "চারটি প্রশ্নই চর্চা করেছেন। এবার শেখাগুলো মনে রাখুন।")}</p>
        <div className="challenge-score"><b>{number(score)}<span> / {number(questions.length)}</span></b><small>{copy("correct on your first try", "প্রথম চেষ্টায় সঠিক")}</small></div>
        <div className="challenge-review">{questions.map((entry, index) => <details key={entry.id}>
          <summary><span className={`review-marker ${answers[index] === entry.answer ? "correct" : ""}`}>{answers[index] === entry.answer ? <Check size={16} /> : <Lightbulb size={16} />}</span><span lang="en">{entry.options[entry.answer]}</span><span className="review-label">{answers[index] === entry.answer ? copy("Got it", "পেরেছেন") : copy("Review", "আবার দেখি")}</span></summary>
          <p>{bn ? entry.explanationBn : entry.explanation}</p>
        </details>)}</div>
        <div className="challenge-result-actions"><button type="button" className="button button-secondary" onClick={restart}><RotateCcw size={16} />{copy("Choose another challenge", "আরেকটি চ্যালেঞ্জ")}</button><Link className="button button-primary" href="/dashboard/speaking">{copy("Try speaking now", "এবার নিজে বলি")}<ArrowRight size={16} /></Link></div>
        <p className="challenge-gentle-note">{copy("Nice work for today. Continue if you feel like it, or come back whenever you're ready.", "আজ ভালো চর্চা হয়েছে। ইচ্ছে হলে চালিয়ে যান, অথবা বিশ্রাম নিয়ে আবার আসুন।")}</p>
      </div> : <>
        <div className="challenge-question-meta"><button type="button" className="button button-quiet" onClick={restart}><ArrowLeft size={15} />{copy("Choose topic", "বিষয় বাছাই")}</button><span>{copy("Question", "প্রশ্ন")} {number(answers.length + 1)} / {number(questions.length)}</span></div>
        <progress className="challenge-progress" max={questions.length} value={reviewedCount} aria-label={copy("Questions reviewed", "যতটি প্রশ্ন চর্চা করেছেন")} />
        <h2 ref={headingRef} tabIndex={-1}>{bn ? question.promptBn : question.prompt}</h2>
        {bn && <p className="challenge-english-prompt" lang="en">{question.prompt}</p>}
        <div className="challenge-options" role="group" aria-label={copy("Answer choices", "উত্তরগুলো")}>{question.options.map((option, index) => {
          const correct = selected !== null && index === question.answer;
          const incorrect = selected === index && !correct;
          return <button key={option} type="button" className={`challenge-option ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`} aria-pressed={selected === index} aria-disabled={selected !== null} onClick={() => { if (selected === null) setSelected(index); }}>
            <span className="option-letter">{String.fromCharCode(65 + index)}</span><span lang="en">{option}</span>{correct && <Check size={19} aria-label={copy("Correct answer", "সঠিক উত্তর")} />}{incorrect && <span className="option-result">{copy("Your choice", "আপনার উত্তর")}</span>}
          </button>;
        })}</div>
        {selected !== null && <div className={`challenge-feedback ${selected === question.answer ? "correct" : ""}`} role="status">
          <Lightbulb size={21} /><div><b>{selected === question.answer ? copy("You've got it!", "ঠিক ধরেছেন!") : copy("Good try. Here's the idea.", "ভালো চেষ্টা। নিয়মটি বুঝে নিই।")}</b><p>{bn ? question.explanationBn : question.explanation}</p><small>{copy("Say the correct answer aloud once to make it stick.", "মনে রাখতে সঠিক উত্তরটি একবার জোরে বলুন।")}</small></div>
        </div>}
        <div className="challenge-next"><span>{selected === null ? copy("Pick the answer that feels right.", "আপনার মনে হয় সঠিক—এমন উত্তর বেছে নিন।") : copy("Ready when you are.", "প্রস্তুত হলে এগিয়ে যান।")}</span><button type="button" className="button button-primary" disabled={selected === null} onClick={advance}>{answers.length === questions.length - 1 ? copy("See my results", "ফলাফল দেখি") : copy("Next question", "পরের প্রশ্ন")}<ArrowRight size={16} /></button></div>
      </>}
    </div>
    <p className="challenge-storage-note" role="status">{storageError ? copy("Your result couldn't be saved in this browser. You can still keep practising.", "এই ব্রাউজারে ফলাফল রাখা যায়নি। অনুশীলন চালিয়ে যেতে পারবেন।") : copy("Challenge results stay in this browser for your account. They don't change your course progress.", "চ্যালেঞ্জের ফলাফল এই ব্রাউজারে আপনার অ্যাকাউন্টের জন্য থাকে। কোর্সের অগ্রগতি আলাদা।")}</p>
  </section>;
}
