"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Download, ZoomIn, ZoomOut } from "lucide-react";
import { BeginnerSpeakingGuide } from "@/components/beginner-speaking-guide";
import { VoiceReplay } from "@/components/voice-replay";
import { LEARNING_BOOKS, type LearningBook } from "@/lib/learning-books";

const steps = [
  { title: "বই পড়ুন", time: "৫ মিনিট", hint: "একটি বিষয় বেছে ১–২ পাতা পড়ুন। সব শব্দ না বুঝলেও উদাহরণের অর্থ বোঝার চেষ্টা করুন।" },
  { title: "বুঝে শুনুন", time: "৪ মিনিট", hint: "ছোট বাক্যের বাংলা অর্থ বুঝুন। ইংরেজি উদাহরণ শুনে একইভাবে বলুন।" },
  { title: "নিজে বলুন", time: "৪ মিনিট", hint: "উদাহরণে নিজের নাম, শহর বা কাজ বসিয়ে বলুন। রেকর্ড করে শুনুন, তারপর কোর্সে উত্তর দিন।" },
  { title: "মনে করে লিখুন", time: "২ মিনিট", hint: "বই বন্ধ রেখে আজ শেখা ৩টি বাক্য লিখুন। কাল শুরুতে এগুলো আবার বলুন।" },
];

export function BookLearningRoom({ book, available, userId, initialPage }: { book: LearningBook; available: boolean; userId: string; initialPage?: number }) {
  const [page, setPage] = useState(initialPage || 1);
  const [pageInput, setPageInput] = useState(String(initialPage || 1));
  const [zoom, setZoom] = useState(100);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const [pageNotice, setPageNotice] = useState("");
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const storageKey = `learning-book:${userId}:${book.id}`;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        if (initialPage === undefined && Number.isInteger(saved.page) && saved.page >= 1 && saved.page <= book.pages) {
          setPage(saved.page); setPageInput(String(saved.page));
        }
        if (typeof saved.note === "string") setNote(saved.note.slice(0, 4000));
        if (saved.reviewedOn === today) setReviewed(true);
      }
    } catch { setStorageNotice("এই ব্রাউজারে অগ্রগতি রাখা যাচ্ছে না। নোট কপি করে রাখুন।"); }
    setReady(true);
  }, [storageKey, initialPage, book.pages, today]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ page, note, reviewedOn: reviewed ? today : null }));
    } catch { setStorageNotice("এই ব্রাউজারে অগ্রগতি রাখা যাচ্ছে না। নোট কপি করে রাখুন।"); }
  }, [storageKey, ready, page, note, reviewed, today]);

  function goToPage(next: number) {
    if (!Number.isInteger(next) || next < 1 || next > book.pages) { setPageNotice(`১ থেকে ${book.pages.toLocaleString("bn-BD")} এর মধ্যে পাতার নম্বর লিখুন।`); return; }
    setPageNotice("");
    if (page !== next) setImageState("loading");
    setPage(next); setPageInput(String(next));
  }

  return <div className="stack">
    <div className="learning-book-choices" aria-label="পড়ার বই বেছে নিন">
      {LEARNING_BOOKS.map((entry, index) => <Link key={entry.id} href={`/dashboard/learn?book=${entry.id}`} className={`learning-book-choice ${entry.id === book.id ? "selected" : ""}`} aria-current={entry.id === book.id ? "page" : undefined}>
        <span className="learning-book-icon"><BookOpen size={24} /></span><div><small>{index === 0 ? "শুরু করুন এখানে · ৬০ ক্লাস" : "পরের ধাপ · ৩৮ অধ্যায়"}</small><h2>{entry.title}</h2><p>{entry.description}</p><span>{entry.author} · {entry.pages.toLocaleString("bn-BD")} পাতা</span></div>{entry.id === book.id && <Check size={18} aria-label="নির্বাচিত" />}
      </Link>)}
    </div>
    <section className="panel learning-daily-plan">
      <div className="reader-section-heading"><div><span className="eyebrow">আজকের ছোট লক্ষ্য</span><h2>১৫ মিনিট, চারটি সহজ ধাপ</h2></div><span className="badge">{reviewed ? "আজকের চর্চা শেষ ✓" : "নিজের গতিতে শিখুন"}</span></div>
      <div className="learning-step-nav" role="group" aria-label="শেখার ধাপ">{steps.map((entry, index) => <button type="button" className={step === index ? "active" : ""} aria-pressed={step === index} onClick={() => setStep(index)} key={entry.title}><b>{(index + 1).toLocaleString("bn-BD")}</b><span>{entry.title}<small>{entry.time}</small></span></button>)}</div>
      <p className="learning-step-hint" aria-live="polite">{steps[step].hint}</p>
      {step === 0 && <div className="learning-reader">
        <div className="reader-section-heading"><h3>{book.title}</h3><div className="reader-toolbar"><button type="button" className="button button-secondary" onClick={() => goToPage(book.contentsPage)}>সূচিপত্র</button><button type="button" className="button button-secondary" onClick={() => goToPage(book.firstLessonPage)}>প্রথম পাঠ</button>{available && <a className="button button-secondary" href={`/api/learning-books/${book.id}?download=1`}><Download size={15} />পুরো PDF</a>}</div></div>
        <p className="reader-help">এখানে আপনার দেওয়া বইয়ের আসল পাতা আছে। নিচের নম্বর PDF-এর পাতা; বইয়ে ছাপা নম্বর আলাদা হতে পারে। শেষ পড়া পাতা এই ব্রাউজারে মনে থাকবে।</p>
        {!available ? <div className="reader-error" role="status"><b>এই সার্ভারে বইয়ের ফাইল এখনো যুক্ত নেই।</b><p>ফাইল যুক্ত হলে এখানে পড়তে পারবেন। আপাতত বাংলা সহায়িকা ও অনুশীলন চালিয়ে যান।</p><button className="button button-primary" type="button" onClick={() => setStep(1)}>বাংলা সহায়িকা খুলুন</button></div> : <>
          <div className="reader-toolbar reader-page-controls">
            <button type="button" className="button button-secondary" disabled={!ready || page === 1} onClick={() => goToPage(page - 1)}><ArrowLeft size={15} />আগের পাতা</button>
            <form onSubmit={(event) => { event.preventDefault(); goToPage(Number(pageInput.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))))); }}><label htmlFor="book-page-number">পাতা</label><input className="input" id="book-page-number" inputMode="numeric" value={pageInput} onChange={(event) => setPageInput(event.target.value)} aria-describedby="book-total-pages" /><span id="book-total-pages">/ {book.pages.toLocaleString("bn-BD")}</span><button type="submit" className="button button-secondary" disabled={!ready}>যান</button></form>
            <button type="button" className="button button-primary" disabled={!ready || page === book.pages} onClick={() => goToPage(page + 1)}>পরের পাতা<ArrowRight size={15} /></button>
          </div>
          {pageNotice && <p role="alert">{pageNotice}</p>}
          <div className="reader-zoom"><button type="button" className="button button-secondary" disabled={zoom <= 100} onClick={() => setZoom(zoom - 25)} aria-label="পাতা ছোট করুন"><ZoomOut size={16} /></button><span>{zoom.toLocaleString("bn-BD")}%</span><button type="button" className="button button-secondary" disabled={zoom >= 200} onClick={() => setZoom(zoom + 25)} aria-label="পাতা বড় করুন"><ZoomIn size={16} /></button><small>বড় করলে আঙুল দিয়ে ডানে-বাঁয়ে সরিয়ে পড়ুন।</small></div>
          {imageState === "loading" && <p role="status">পাতা আসছে…</p>}
          {imageState === "error" && <div className="reader-error" role="alert"><p>পাতা আসেনি। সংযোগ দেখে আবার চেষ্টা করুন। লগইন শেষ হয়ে গেলে আবার লগইন করুন।</p><button type="button" className="button button-secondary" onClick={() => { setRetry(retry + 1); setImageState("loading"); }}>আবার দেখুন</button><Link className="button button-secondary" href="/sign-in">লগইন</Link></div>}
          <div className="book-page-viewport" tabIndex={0} role="region" aria-label="বইয়ের পাতা, বড় করলে পাশে সরিয়ে পড়ুন" aria-busy={imageState === "loading"}>
            {/* Plain image keeps authenticated requests on this server, without a public image optimiser. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={`${page}-${retry}`} src={`/api/learning-books/${book.id}?page=${page}&retry=${retry}`} alt={`${book.title}, PDF পাতা ${page.toLocaleString("bn-BD")}`} style={{ width: `${zoom}%`, display: imageState === "error" ? "none" : "block" }} onLoad={() => setImageState("ready")} onError={() => setImageState("error")} />
          </div>
          <div className="reader-bottom-nav"><span>পাতা {page.toLocaleString("bn-BD")} / {book.pages.toLocaleString("bn-BD")}</span><button className="button button-secondary" type="button" disabled={page === book.pages} onClick={() => { goToPage(page + 1); document.querySelector(".learning-reader")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>পরের পাতা<ArrowRight size={15} /></button></div>
        </>}
      </div>}
      {step === 1 && (book.id === "spoken" ? <BeginnerSpeakingGuide chooseLesson /> : <div className="beginner-guide"><h3>IELTS বই কীভাবে পড়বেন?</h3><ol><li>সূচিপত্র থেকে একটি skill বেছে নিন। শুরুতে সব অধ্যায় একসঙ্গে ধরবেন না।</li><li>প্রশ্নের ধরন ও একটি উদাহরণ পড়ুন। বাংলায় এক লাইনে লিখুন কী করতে হবে।</li><li>একটি ছোট অনুশীলন করুন। উত্তরের সঙ্গে মিলিয়ে কোথায় ভুল হলো লিখুন।</li><li>IELTS পেজে অধ্যায় অনুযায়ী চর্চা ও সময় সংরক্ষণ করুন।</li></ol><p>ইংরেজিতে বাক্য বলতে কষ্ট হলে আগে Spoken English-এর প্রথম ৭ ক্লাসের বাংলা সহায়িকা করুন।</p><Link className="button button-secondary" href="/dashboard/learn?book=spoken">Spoken English দিয়ে শুরু</Link><Link className="button button-primary" href="/dashboard/ielts">IELTS অধ্যায়ের অনুশীলন</Link></div>)}
      {step === 2 && <><VoiceReplay /><div className="learning-practice-link"><p>কোর্সে গিয়ে নমুনা শুনুন → নিজের উত্তর বলুন বা লিখুন → উত্তর সংরক্ষণ করুন। Speaking ক্লাস শেষ করতে সাধারণত অন্তত ২০টি শব্দ দিন।</p><Link className="button button-primary" href={book.practiceHref}>{book.practiceLabel}<ArrowRight size={15} /></Link></div></>}
      {step === 3 && <div className="learning-review"><label className="form-field"><span>আজ শেখা ৩টি বাক্য / ৫টি শব্দ ও বাংলা অর্থ</span><textarea className="textarea" rows={7} maxLength={4000} value={note} onChange={(event) => { setNote(event.target.value); setReviewed(false); }} placeholder={"I am a student. — আমি একজন শিক্ষার্থী।\nI live in… — আমি … থাকি।\nআজকের যে ভুলটি কাল ঠিক করব…"} /></label><p>আগামীকাল প্রথমে আজকের বাক্যগুলো বই না দেখে বলুন। তারপর নতুন পাঠে যান।</p><button className="button button-primary" type="button" disabled={!ready || !note.trim() || reviewed} onClick={() => setReviewed(true)}><Check size={15} />{reviewed ? "আজকের চর্চা শেষ হয়েছে" : "আজকের চর্চা শেষ"}</button><small>এটি আপনার নিজের চর্চার চিহ্ন। কোর্সের ক্লাস সম্পন্ন হবে সেখানে উত্তর সংরক্ষণ করলে।</small></div>}
      <div className="learning-step-footer">{step > 0 && <button className="button button-secondary" type="button" onClick={() => setStep(step - 1)}><ArrowLeft size={15} />আগের ধাপ</button>}{step < 3 && <button className="button button-primary" type="button" onClick={() => setStep(step + 1)}>পরের ধাপ: {steps[step + 1].title}<ArrowRight size={15} /></button>}</div>
      <p className="reader-storage-notice" role="status">{storageNotice || "পড়ার জায়গা ও নোট এই ব্রাউজারে অটো সেভ হয়; অন্য ডিভাইসে যাবে না। কোর্সের সংরক্ষিত অনুশীলন আপনার অ্যাকাউন্টে থাকে।"}</p>
    </section>
  </div>;
}
