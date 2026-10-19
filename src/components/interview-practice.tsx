"use client";

import { BriefcaseBusiness, Check, ChevronDown, ChevronUp, GraduationCap, Mic, MicOff, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveInterviewAttempt } from "@/lib/actions/interview";
import { formatDate, formatNumber, translate, type Locale } from "@/lib/i18n";

type QuestionItem = {
  id: string;
  category: "job" | "admission";
  topic: string;
  question: string;
  questionBn: string;
  en: string;
  bn: string;
  tip: string;
  tipBn: string;
};

const QUESTION_BANK: QuestionItem[] = [
  {
    id: "job-intro",
    category: "job",
    topic: "Intro & Pitch",
    question: "Tell me about yourself.",
    questionBn: "নিজের সম্পর্কে বলুন।",
    en: "I’m Al Mumeetu Saikat, a full stack developer with 4+ years of experience. On the frontend I use React, Next.js and TypeScript; on the backend Node.js, Express and PostgreSQL with Prisma. I focus on turning product requirements into clean, scalable applications.",
    bn: "আমি আল মুমিতু সাইকাত, ৪+ বছরের অভিজ্ঞতার ফুল স্ট্যাক ডেভেলপার। ফ্রন্টএন্ডে React, Next.js, TypeScript এবং ব্যাকএন্ডে Node.js, Express, PostgreSQL ও Prisma ব্যবহার করি। স্কেলেবল ফিচার ও নিখুঁত ইউজার এক্সপেরিয়েন্স ডেলিভারি দিতে পছন্দ করি।",
    tip: "Keep it within 60–90 seconds: Present (current role & stack) → Past (proven experience) → Future (enthusiasm for this team).",
    tipBn: "৬০–৯০ সেকেন্ডে বলুন: বর্তমান ভূমিকা ও প্রযুক্তি → আগের অভিজ্ঞতা → এই দলের প্রতি আগ্রহ।",
  },
  {
    id: "job-why-hire",
    category: "job",
    topic: "Intro & Pitch",
    question: "Why should we hire you for this role?",
    questionBn: "এই পদের জন্য আমরা আপনাকে কেন নিয়োগ দেব?",
    en: "I cover the full workflow: responsive UI, robust APIs and relational database architecture. I take ownership of features, adhere to clean code reviews, and ship fast without sacrificing quality.",
    bn: "আমি ইউআই, ব্যাকএন্ড এপিআই এবং ডাটাবেস— পুরো আর্কিটেকচার সামলাতে পারি। টিমে যোগ দিয়েই দ্রুত প্রোডাক্টিভ হতে পারি এবং দায়িত্ব নিয়ে কাজ শেষ করি।",
    tip: "Highlight full-stack ownership and how quickly you can contribute to their active sprint.",
    tipBn: "আপনার পূর্ণাঙ্গ কাজের দায়িত্ব নেওয়ার দক্ষতা এবং চলমান স্প্রিন্টে দ্রুত অবদান রাখার সক্ষমতা তুলে ধরুন।",
  },
  {
    id: "job-star-project",
    category: "job",
    topic: "Experience & STAR",
    question: "Describe a project you are proud of and the impact it had.",
    questionBn: "আপনি গর্বিত এমন একটি প্রকল্প এবং তার প্রভাব সম্পর্কে বলুন।",
    en: "Situation: A retail business needed a reliable commerce & POS platform. Task: Build catalog, multi-register checkout and real-time inventory. Action: Developed with Next.js, TypeScript, PostgreSQL and Prisma with database transactions to prevent overselling. Result: Seamless daily sales with zero inventory discrepancies.",
    bn: "পরিস্থিতি: একটি রিটেল ক্লায়েন্টের POS ও ই-কমার্স দরকার ছিল। কাজ: প্রোডাক্ট ক্যাটালগ ও চেকআউট তৈরি। অ্যাকশন: Next.js, Prisma ট্রানজাকশন ব্যবহার করে ও স্টক ওভারসেলিং আটকেছি। ফলাফল: মসৃণ ডেলিভারি ও রিয়েল-টাইম স্টক আপডেট।",
    tip: "Use the STAR format: Situation (context) → Task (your goal) → Action (specific tech decisions) → Result (measurable impact).",
    tipBn: "STAR পদ্ধতি ব্যবহার করুন: পরিস্থিতি → দায়িত্ব → নির্দিষ্ট পদক্ষেপ → পরিমাপযোগ্য ফলাফল।",
  },
  {
    id: "job-closure",
    category: "job",
    topic: "JS & TypeScript",
    question: "What is a closure in JavaScript, and when do you use it?",
    questionBn: "JavaScript-এ closure কী এবং কখন এটি ব্যবহার করেন?",
    en: "A closure is a function that retains access to variables from its lexical scope even after that outer function has executed. It's commonly used for data encapsulation, function factories, and hooks like useState.",
    bn: "Closure হলো এমন ফাংশন যা বাইরের ফাংশন এক্সিকিউট হয়ে গেলেও তার ভেরিয়েবল মনে রাখে ও এক্সেস করতে পারে। প্রাইভেট স্টেট ও ফাংশন ফ্যাক্টরিতে ব্যবহৃত হয়।",
    tip: "Real-world analogy: An ATM balance or counter function where internal count cannot be altered from the outside.",
    tipBn: "একটি বাস্তব উদাহরণ দিন: ATM ব্যালেন্স বা কাউন্টার, যার ভেতরের মান বাইরে থেকে বদলানো যায় না।",
  },
  {
    id: "job-event-loop",
    category: "job",
    topic: "JS & TypeScript",
    question: "Explain async/await and how the JavaScript event loop works.",
    questionBn: "async/await কীভাবে কাজ করে এবং JavaScript event loop কীভাবে চলে?",
    en: "JavaScript is single-threaded. Synchronous code runs on the call stack, while async operations like database or API queries are offloaded to Web APIs/Node C++ threads. When resolved, their callbacks enter the microtask/task queue and are pushed back onto the stack by the event loop when empty.",
    bn: "JavaScript সিঙ্গেল-থ্রেডেড। ইভেন্ট লুপ নিশ্চিত করে যাতে async কাজের জন্য UI আটকে না যায়। কল স্ট্যাক খালি হলে কিউ থেকে টাস্ক স্ট্যাকে নিয়ে আসে।",
    tip: "Restaurant waiter analogy: The waiter takes your food order to the kitchen and serves other tables instead of standing idle waiting.",
    tipBn: "রেস্তোরাঁর ওয়েটারের উদাহরণ দিন: অর্ডার রান্নাঘরে দিয়ে অপেক্ষার সময় অন্য টেবিল সামলানো।",
  },
  {
    id: "job-react-hooks",
    category: "job",
    topic: "React & Next.js",
    question: "Explain the difference between useState and useEffect.",
    questionBn: "useState ও useEffect-এর মধ্যে পার্থক্য ব্যাখ্যা করুন।",
    en: "useState holds component-level state and triggers a re-render upon update. useEffect synchronizes the component with external systems (API calls, subscriptions, DOM mutations) after render, managed strictly by its dependency array.",
    bn: "useState কম্পোনেন্টের ডেটা রাখে যা পরিবর্তিত হলে রি-রেন্ডার হয়; useEffect রেন্ডারের পর এক্সটার্নাল সিস্টেম বা সাইড-ইফেক্ট সামলায়।",
    tip: "Cart item count = useState; fetching product details when the page loads = useEffect.",
    tipBn: "উদাহরণ দিন: কার্টের আইটেম সংখ্যা useState-এ, পেজ লোডে ডেটা আনা useEffect-এ।",
  },
  {
    id: "job-nextjs-rendering",
    category: "job",
    topic: "React & Next.js",
    question: "Compare SSR, SSG and Client-Side Rendering in Next.js.",
    questionBn: "Next.js-এ SSR, SSG ও Client-Side Rendering-এর তুলনা করুন।",
    en: "SSG pre-renders HTML at build time for fast static delivery. SSR renders HTML per request on the server with fresh dynamic data. CSR ships minimal HTML and runs the React tree in the browser, ideal for authenticated dashboards.",
    bn: "SSG আগে থেকেই পেজ বানায় (দ্রুত)। SSR প্রতি রিকোয়েস্টে ফ্রেশ ডেটা দিয়ে সার্ভারে বানায়। CSR ব্রাউজারে জাভাস্ক্রিপ্ট দিয়ে ড্যাশবোর্ড রেন্ডার করে।",
    tip: "Blog/Documentation = SSG; E-commerce product listing = SSR/ISR; User Settings dashboard = CSR.",
    tipBn: "ব্লগ বা ডকুমেন্টেশনে SSG, পরিবর্তনশীল পণ্যের তালিকায় SSR/ISR এবং ব্যক্তিগত ড্যাশবোর্ডে CSR বেছে নেওয়ার কারণ বলুন।",
  },
  {
    id: "job-postgres-mongo",
    category: "job",
    topic: "Database & Backend",
    question: "When would you choose PostgreSQL over MongoDB?",
    questionBn: "কোন পরিস্থিতিতে MongoDB-এর বদলে PostgreSQL বেছে নেবেন?",
    en: "PostgreSQL excels with structured relational schemas, ACID transactions, complex joins, and financial or inventory integrity. MongoDB is best when data schemas evolve rapidly or are hierarchical documents without relational constraints.",
    bn: "টাকার হিসাব, ইনভেন্টরি ও রিলেশনাল ডেটার জন্য PostgreSQL সেরা। ডকুমেন্ট-ভিত্তিক ফ্লেক্সিবল স্ট্রাকচারের জন্য MongoDB ভালো।",
    tip: "For money and transactions, ACID consistency in PostgreSQL is the gold standard.",
    tipBn: "অর্থ বা লেনদেনে PostgreSQL-এর ACID consistency এবং ডেটার নির্ভুলতা কেন গুরুত্বপূর্ণ তা বলুন।",
  },
  {
    id: "admission-why-course",
    category: "admission",
    topic: "Course & University",
    question: "Why did you choose this particular course and university?",
    questionBn: "এই কোর্স ও বিশ্ববিদ্যালয়টি কেন বেছে নিয়েছেন?",
    en: "I chose this program because of its specialized curriculum in Advanced Software Engineering, strong practical lab components, and faculty research. It directly aligns with my career goal of designing resilient distributed systems.",
    bn: "কোর্সটির প্র্যাকটিক্যাল ল্যাব ও স্পেশালাইজড কারিকুলাম আমার ক্যারিয়ার লক্ষ্যের সাথে হুবহু মিলে যায়।",
    tip: "Mention 1–2 specific professors, labs, or unique modules from the university course catalog.",
    tipBn: "বিশ্ববিদ্যালয়ের নির্দিষ্ট শিক্ষক, ল্যাব বা কোর্সের বিশেষ বিষয় উল্লেখ করুন।",
  },
  {
    id: "admission-funding",
    category: "admission",
    topic: "Visa & Funding",
    question: "How do you plan to fund your tuition and living expenses abroad?",
    questionBn: "বিদেশে টিউশন ও জীবনযাত্রার খরচ কীভাবে বহন করার পরিকল্পনা করেছেন?",
    en: "My studies will be funded through a combination of dedicated family savings, academic scholarships, and personal funds set aside specifically for tuition and living costs.",
    bn: "আমার টিউশন ও থাকার খরচ পারিবারিক সঞ্চয়, স্কলারশিপ ও ব্যাংকে সংরক্ষিত ফান্ড দ্বারা নির্বাহ করা হবে।",
    tip: "Be concise, confident, and specific about the exact funding sources ready in your account.",
    tipBn: "প্রস্তুত তহবিলের নির্দিষ্ট উৎস সংক্ষেপে এবং আত্মবিশ্বাসের সঙ্গে বলুন।",
  },
  {
    id: "admission-future",
    category: "admission",
    topic: "Future Goals",
    question: "What are your post-graduation plans after completing this degree?",
    questionBn: "এই ডিগ্রি শেষ করার পর আপনার পরিকল্পনা কী?",
    en: "Upon graduating, I aim to apply advanced architectural principles to build high-impact software products, gaining industry expertise before driving technological innovations in my home country.",
    bn: "ডিগ্রী শেষ করে আমি ইন্ডাস্ট্রি লিডিং সফটওয়্যার ইঞ্জিনিয়ার হিসেবে অভিজ্ঞতা অর্জন করব এবং দীর্ঘমেয়াদে দেশে প্রযুক্তি উন্নয়নে অবদান রাখব।",
    tip: "Highlight strong career intent, clear professional focus, and ties to home country.",
    tipBn: "স্পষ্ট পেশাগত লক্ষ্য, কাজের ক্ষেত্র এবং নিজ দেশে ফেরার পরিকল্পনা থাকলে তা তুলে ধরুন।",
  },
];

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionWindow = Window & {
  SpeechRecognition?: new () => RecognitionLike;
  webkitSpeechRecognition?: new () => RecognitionLike;
};

export function InterviewPractice({
  history,
  locale,
}: {
  locale: Locale;
  history: Array<{
    id: string;
    category: string;
    question: string;
    transcript: string;
    wordCount: number;
    wordsPerMinute: number;
    fillerCount: number;
    durationSeconds: number;
    createdAt: Date;
  }>;
}) {
  const t = (message: string) => translate(locale, message);
  const [category, setCategory] = useState<"job" | "admission">("job");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem>(QUESTION_BANK[0]);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [langPreference, setLangPreference] = useState<"both" | "en" | "bn">("both");
  const startedAt = useRef<number | null>(null);
  const recognition = useRef<RecognitionLike | null>(null);

  const availableQuestions = QUESTION_BANK.filter(
    (q) => q.category === category && (selectedTopic === "all" || q.topic === selectedTopic)
  );

  const topics = Array.from(new Set(QUESTION_BANK.filter((q) => q.category === category).map((q) => q.topic)));
  const questionText = (question: QuestionItem) => locale === "bn" ? question.questionBn : question.question;
  const topicText = (topic: string) => t(topic);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, [recording]);

  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const fillers = (transcript.match(/\b(um+|uh+|like|you know|actually|basically)\b/gi) || []).length;
  const wpm = elapsed > 4 ? Math.round((words / elapsed) * 60) : 0;

  function pickRandomQuestion() {
    recognition.current?.stop();
    recognition.current = null;
    startedAt.current = null;
    setRecording(false);
    const pool = availableQuestions.length ? availableQuestions : QUESTION_BANK.filter((q) => q.category === category);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(next);
    setTranscript("");
    setElapsed(0);
    setNotice("");
    speakQuestion(questionText(next));
  }

  function speakQuestion(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === "bn" ? "bn-BD" : "en-US";
      utterance.rate = 0.94;
      window.speechSynthesis.speak(utterance);
    }
  }

  function startVoiceRecording() {
    setNotice("");
    setTranscript("");
    setElapsed(0);
    startedAt.current = Date.now();
    setRecording(true);
    const Recognition = (window as RecognitionWindow).SpeechRecognition || (window as RecognitionWindow).webkitSpeechRecognition;
    if (!Recognition) {
      setNotice(t("Voice speech recognition is unavailable in this browser. You can type your answer below."));
      return;
    }
    try {
      const instance = new Recognition();
      instance.lang = locale === "bn" ? "bn-BD" : "en-US";
      instance.continuous = true;
      instance.interimResults = true;
      instance.onresult = (event) => {
        setTranscript(Array.from(event.results).map((result) => result[0].transcript).join(" ").trim());
      };
      instance.onerror = () => setNotice(t("Microphone input stopped. You can continue typing."));
      recognition.current = instance;
      instance.start();
    } catch {
      setNotice(t("Could not start microphone. You can type your answer below."));
    }
  }

  function stopRecording() {
    recognition.current?.stop();
    recognition.current = null;
    setRecording(false);
  }

  async function saveAnswer() {
    if (!transcript.trim()) {
      setNotice(t("Please record or write an answer first."));
      return;
    }
    setSaving(true);
    stopRecording();
    const durationSeconds = Math.max(1, elapsed || (startedAt.current ? Math.floor((Date.now() - startedAt.current) / 1000) : 1));
    try {
      const result = await saveInterviewAttempt({
        category,
        question: currentQuestion.question,
        transcript,
        durationSeconds,
      });
      setNotice(t(result.message));
      if (result.ok) {
        setTranscript("");
        setElapsed(0);
      }
    } catch {
      setNotice(t("Could not save your answer. Please try again."));
    } finally {
      setSaving(false);
      startedAt.current = null;
    }
  }

  function resetAnswer() {
    stopRecording();
    startedAt.current = null;
    setTranscript("");
    setElapsed(0);
    setNotice("");
  }

  return (
    <div className="stack">
      <div className="interview-layout">
        <section className="panel interview-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">{t("Interactive Interview Studio")}</h2>
              <p className="panel-subtitle">{t("Practice answers with voice or text, examine sample notes, and measure your speaking pace.")}</p>
            </div>
            <span className="interview-badge"><Mic size={13} /> {t("Rehearsal Mode")}</span>
          </div>

          {/* Category Tabs */}
          <div className="interview-controls">
            <div className="section-tabs compact-tabs" aria-label={t("Question category")}>
              <button
                className={`section-tab ${category === "job" ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setCategory("job");
                  setSelectedTopic("all");
                  const first = QUESTION_BANK.find((q) => q.category === "job")!;
                  setCurrentQuestion(first);
                  resetAnswer();
                }}
              >
                <BriefcaseBusiness size={15} />{t("💼 Job & Tech Interview")}
              </button>
              <button
                className={`section-tab ${category === "admission" ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setCategory("admission");
                  setSelectedTopic("all");
                  const first = QUESTION_BANK.find((q) => q.category === "admission")!;
                  setCurrentQuestion(first);
                  resetAnswer();
                }}
              >
                <GraduationCap size={15} />{t("🎓 Study Abroad & Visa")}
              </button>
            </div>

            <button className="button button-secondary button-small" type="button" onClick={pickRandomQuestion}>
              <RotateCcw size={13} /> {t("Next Question")}
            </button>
          </div>

          {/* Subtopic Filters */}
          <div className="subtopic-bar">
            <span className="subtopic-label">{t("Filter:")}</span>
            <button
              type="button"
              className={`subtopic-chip ${selectedTopic === "all" ? "active" : ""}`}
              onClick={() => setSelectedTopic("all")}
            >
              {t("All Topics")}
            </button>
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                className={`subtopic-chip ${selectedTopic === t ? "active" : ""}`}
                onClick={() => {
                  setSelectedTopic(t);
                  const first = QUESTION_BANK.find((q) => q.category === category && q.topic === t);
                  if (first) setCurrentQuestion(first);
                }}
              >
                {topicText(t)}
              </button>
            ))}
          </div>

          {/* Question Card */}
          <div className="question-card">
            <div className="question-card-top">
              <span className="eyebrow">{topicText(currentQuestion.topic).toUpperCase()}</span>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => speakQuestion(questionText(currentQuestion))}
                title={t("Listen to question")}
              >
                <Volume2 size={14} /> {t("Listen")}
              </button>
            </div>
            <p className="question-text">{questionText(currentQuestion)}</p>
          </div>

          {/* Sample Guide Drawer */}
          <div className="interview-guide-card">
            <button
              type="button"
              className="guide-toggle-btn"
              onClick={() => setShowGuide((prev) => !prev)}
            >
              <div className="guide-btn-left">
                <Sparkles size={14} className="sparkle-icon" />
                <span><b>{t("Sample Answer & Key Talking Points")}</b> <small>(English + বাংলা)</small></span>
              </div>
              {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showGuide && (
              <div className="guide-body">
                <div className="guide-lang-tabs">
                  <button
                    type="button"
                    className={`guide-lang-tab ${langPreference === "both" ? "active" : ""}`}
                    onClick={() => setLangPreference("both")}
                  >
                    {t("Both Languages")}
                  </button>
                  <button
                    type="button"
                    className={`guide-lang-tab ${langPreference === "en" ? "active" : ""}`}
                    onClick={() => setLangPreference("en")}
                  >
                    {t("English Only")}
                  </button>
                  <button
                    type="button"
                    className={`guide-lang-tab ${langPreference === "bn" ? "active" : ""}`}
                    onClick={() => setLangPreference("bn")}
                  >
                    বাংলা
                  </button>
                </div>

                {(langPreference === "both" || langPreference === "en") && (
                  <div className="guide-section">
                    <span className="guide-section-label">{t("English Talking Points:")}</span>
                    <p>{currentQuestion.en}</p>
                  </div>
                )}

                {(langPreference === "both" || langPreference === "bn") && (
                  <div className="guide-section bn-section">
                    <span className="guide-section-label">{t("বাংলা নমুনা পয়েন্ট:")}</span>
                    <p>{currentQuestion.bn}</p>
                  </div>
                )}

                <div className="guide-tip-box">
                  <b>{t("💡 Pro Tip:")}</b>
                  {langPreference !== "bn" && <span>{currentQuestion.tip}</span>}
                  {langPreference === "both" && <span className="tip-bengali">{currentQuestion.tipBn}</span>}
                  {langPreference === "bn" && <span>{currentQuestion.tipBn}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Live Metrics */}
          <div className="interview-metrics">
            <div><b>{formatNumber(locale, elapsed)}s</b><small>{t("Time")}</small></div>
            <div><b>{formatNumber(locale, words)}</b><small>{t("Words")}</small></div>
            <div><b>{formatNumber(locale, wpm)}</b><small>{t("Words / min")}</small></div>
            <div><b>{formatNumber(locale, fillers)}</b><small>{t("Filler words")}</small></div>
          </div>

          {/* Answer Area */}
          <label className="form-field">
            <div className="field-label-row">
              <span>{t("Your Answer")}</span>
              <small>{recording ? `🔴 ${t("Recording live...")}` : t("Speak or type")}</small>
            </div>
            <textarea
              className={`textarea interview-answer ${recording ? "recording-active" : ""}`}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              maxLength={12000}
              placeholder={t("Click 'Start answer' to speak using speech-to-text, or type your answer here…")}
            />
          </label>

          {/* Actions */}
          <div className="form-actions interview-actions">
            {!recording ? (
              <button className="button button-secondary" type="button" onClick={startVoiceRecording}>
                <Mic size={14} /> {t("Start answer")}
              </button>
            ) : (
              <button className="button button-danger" type="button" onClick={stopRecording}>
                <MicOff size={14} /> {t("Stop recording")}
              </button>
            )}
            <button
              className="button button-primary"
              type="button"
              onClick={saveAnswer}
              disabled={saving || !transcript.trim()}
            >
              {saving ? t("Saving…") : <><Check size={14} /> {t("Save practice attempt")}</>}
            </button>
            <button className="button button-quiet" type="button" onClick={resetAnswer}>
              <RotateCcw size={14} /> {t("Reset")}
            </button>
          </div>

          {notice && <p className="interview-notice" role="status">{notice}</p>}
        </section>

        {/* Recent Practice History */}
        <aside className="panel interview-side">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">{t("Saved Rehearsals")}</h2>
              <p className="panel-subtitle">{t("Track your speaking speed & confidence over time.")}</p>
            </div>
          </div>
          {history.length ? (
            <div className="interview-history">
              {history.map((attempt) => (
                <article className="interview-history-item" key={attempt.id}>
                  <div className="interview-history-top">
                    <span className="badge">{t(attempt.category === "job" ? "Job" : "Admission / Visa")}</span>
                    <small>{formatDate(locale, new Date(attempt.createdAt), { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })}</small>
                  </div>
                  <b>{QUESTION_BANK.find((question) => question.question === attempt.question) ? questionText(QUESTION_BANK.find((question) => question.question === attempt.question)!) : attempt.question}</b>
                  <p>{attempt.transcript}</p>
                  <div className="interview-history-stats">
                    <span>{formatNumber(locale, attempt.wordCount)} {t("words")}</span>
                    <span>{formatNumber(locale, attempt.wordsPerMinute)} WPM</span>
                    <span>{formatNumber(locale, attempt.fillerCount)} {t("fillers")}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon"><Mic size={17} /></span>
              <b>{t("No practice saved yet")}</b>
              <p>{t("Speak or type an answer to begin building your interview confidence.")}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
