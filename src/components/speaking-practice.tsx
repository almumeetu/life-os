"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Check, ChevronRight, Headphones, Languages, LockKeyhole, Mic, MicOff, Play, RotateCcw, Save, Speaker, Trash2, Volume2 } from "lucide-react";
import { deleteSpeakingAttempt, saveSpeakingAttempt } from "@/lib/actions/speaking";
import { EmptyState, Panel } from "@/components/ui";
import { BeginnerSpeakingGuide } from "@/components/beginner-speaking-guide";
import { formatDate, formatNumber, translate, type Locale } from "@/lib/i18n";
import { ALL_SPEAKING_LESSONS, LEGACY_SPEAKING_TOPICS, SPEAKING_LESSONS, SPOKEN_ENGLISH_BOOK_LESSONS, type SpeakingCourseLesson } from "@/lib/speaking-course";

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionWindow = Window & { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
type SpeakingHistory = Array<{ id: string; topic: string; transcript: string; wordCount: number; wordsPerMinute: number; fillerCount: number; durationSeconds: number; createdAt: Date }>;
type Feedback = { points: string[]; speechToTextMatch: number | null; spokenMessage: string };
type VoiceAccent = "en-US" | "en-GB";
type CourseTrack = "book" | "coach";

const sentenceActions = [
  { id: "practise", base: "practise", past: "practised", third: "practises", object: "English" },
  { id: "learn", base: "learn", past: "learned", third: "learns", object: "a new skill" },
  { id: "prepare", base: "prepare", past: "prepared", third: "prepares", object: "for IELTS" },
  { id: "read", base: "read", past: "read", third: "reads", object: "an English article" },
  { id: "review", base: "review", past: "reviewed", third: "reviews", object: "my notes" },
] as const;

function SentenceBuilder({ t, speak }: { t: (message: string, values?: Record<string, string | number>) => string; speak: (text: string) => void }) {
  const [subject, setSubject] = useState("I");
  const [tense, setTense] = useState<"present" | "past" | "future">("present");
  const [actionId, setActionId] = useState<(typeof sentenceActions)[number]["id"]>("practise");
  const [reason, setReason] = useState("");
  const [sentence, setSentence] = useState("");

  function buildSentence() {
    const action = sentenceActions.find((item) => item.id === actionId) || sentenceActions[0];
    const verb = tense === "past" ? action.past : tense === "future" ? `will ${action.base}` : subject === "I" ? action.base : action.third;
    const time = tense === "past" ? "yesterday" : tense === "future" ? "next week" : "every day";
    const why = reason.trim() ? ` because ${reason.trim().replace(/[.!?]+$/, "")}` : "";
    setSentence(`${subject} ${verb} ${action.object} ${time}${why}.`);
  }

  return <Panel title={t("Build a sentence quickly")} subtitle={t("Choose who, when and what. Add one detail or reason after the basic sentence.")}>
    <div className="grammar-quick-rule" lang="bn"><b>কে + কী করে + কী/কাকে + কখন + কেন</b><p>Subject মানে কে, verb মানে কাজ, object মানে কাজটি কী/কাকে নিয়ে। যেমন: <em>I read a book.</em> — আমি একটি বই পড়ি। আগে এই ছোট বাক্য, পরে সময় বা <em>because</em> দিয়ে কারণ যোগ করুন। অতীতের হ্যাঁ-বোধক বাক্যে verb-এর past form: <em>I went.</em> প্রশ্ন ও না-বোধক বাক্যে <em>did + base verb</em>: <em>Did you go? I did not go.</em> ভবিষ্যতে <em>will + base verb</em>: <em>I will go.</em></p></div>
    <div className="grammar-builder-fields">
      <label className="form-field"><span>{t("Who")}</span><select className="select" value={subject} onChange={(event) => setSubject(event.target.value)}><option>I</option><option>My friend</option><option>My family</option></select></label>
      <label className="form-field"><span>{t("When")}</span><select className="select" value={tense} onChange={(event) => setTense(event.target.value as "present" | "past" | "future")}><option value="present">{t("Present: habit or general fact")}</option><option value="past">{t("Past: finished event")}</option><option value="future">{t("Future: next step")}</option></select></label>
      <label className="form-field"><span>{t("Action")}</span><select className="select" value={actionId} onChange={(event) => setActionId(event.target.value as typeof actionId)}>{sentenceActions.map((action) => <option key={action.id} value={action.id}>{action.base} {action.object}</option>)}</select></label>
      <label className="form-field"><span>{t("Why? (optional)")}</span><input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("it helps me feel confident")} /></label>
    </div>
    <div className="form-actions"><button className="button button-primary button-small" type="button" onClick={buildSentence}>{t("Build sentence")}</button>{sentence && <button className="button button-secondary button-small" type="button" onClick={() => speak(sentence)}><Volume2 size={14} />{t("Listen and repeat")}</button>}</div>
    {sentence && <p className="grammar-built-sentence" aria-live="polite">{sentence}</p>}
    <div className="grammar-quick-examples"><span><b>{t("Question")}</b> Do you practise English? · Did you practise yesterday? · Will you practise next week?</span><span><b>{t("Negative")}</b> I do not practise · I did not practise · I will not practise</span></div>
  </Panel>;
}

function countWords(value: string) {
  return value.trim().match(/[\p{L}\p{N}’'-]+/gu)?.length || 0;
}

function compareWords(expected: string, heard: string) {
  const left = expected.toLowerCase().match(/[\p{L}\p{N}’'-]+/gu) || [];
  const right = heard.toLowerCase().match(/[\p{L}\p{N}’'-]+/gu) || [];
  if (!left.length) return 0;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return Math.max(0, Math.round((1 - previous[right.length] / left.length) * 100));
}

function buildFeedback(answer: string, elapsedSeconds: number, lesson: SpeakingCourseLesson, repeatMode: boolean) {
  const words = countWords(answer);
  const fillers = (answer.match(/\b(um+|uh+|like|you know|actually|basically)\b/gi) || []).length;
  const pace = elapsedSeconds > 5 ? Math.round(words / (elapsedSeconds / 60)) : 0;
  const points: string[] = [`You spoke ${words} ${words === 1 ? "word" : "words"}.`];
  if (words < 35) points.push("Add one specific detail and one example so the listener has more context.");
  else points.push("You have enough words to develop the answer. Keep your main idea easy to follow.");
  if (fillers) points.push(`The transcript contains ${fillers} filler ${fillers === 1 ? "word" : "words"}. Try a quiet pause instead of filling the space.`);
  if (pace > 175) points.push("Slow down. Pause briefly after each idea and aim for a clear, steady pace.");
  else if (pace > 0 && pace < 85) points.push("Keep the ideas connected and continue speaking after each short pause.");
  else if (pace > 0) points.push("Your recorded pace is in a steady practice range. Keep finishing each word clearly.");

  const corrections: Array<[RegExp, string, string]> = [
    [/\bi am agree\b/i, "I am agree", "I agree"],
    [/\bi very like\b/i, "I very like", "I really like"],
    [/\bi didn't went\b/i, "I didn't went", "I didn't go"],
    [/\bi have (\d+) years old\b/i, "I have [age] years old", "I am [age] years old"],
    [/\bhe don't\b/i, "he don't", "he doesn't"],
    [/\bshe don't\b/i, "she don't", "she doesn't"],
  ];
  const correction = corrections.find(([pattern]) => pattern.test(answer));
  if (correction) points.push(`Try this correction: say “${correction[2]}” instead of “${correction[1]}.”`);
  points.push(`For your next try, use this frame: ${lesson.frame}`);
  points.push("Listen to the English model, notice the word stress, and repeat the full phrase. Speech recognition can mishear an accent, so use the transcript as a practice clue, not a formal pronunciation score.");

  const speechToTextMatch = repeatMode ? compareWords(lesson.model, answer) : null;
  if (speechToTextMatch !== null) points.splice(1, 0, `The speech recognizer matched about ${speechToTextMatch}% of the model words. This is a rough comparison, not a pronunciation grade.`);
  return { points, speechToTextMatch, spokenMessage: `Speaking feedback for ${lesson.title}. ${points.join(" ")}` } satisfies Feedback;
}

export function SpeakingPractice({ locale, history, completedLessonIds }: { locale: Locale; history: SpeakingHistory; completedLessonIds: string[] }) {
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const router = useRouter();
  const [track, setTrack] = useState<CourseTrack>("book");
  const [doneIds, setDoneIds] = useState(() => new Set(completedLessonIds));
  const [lessonId, setLessonId] = useState(() => {
    const firstIncomplete = SPOKEN_ENGLISH_BOOK_LESSONS.find((lesson) => !completedLessonIds.includes(lesson.id));
    return firstIncomplete?.id || SPOKEN_ENGLISH_BOOK_LESSONS[SPOKEN_ENGLISH_BOOK_LESSONS.length - 1].id;
  });
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [repeatMode, setRepeatMode] = useState(false);
  const [autoReadFeedback, setAutoReadFeedback] = useState(true);
  const [accent, setAccent] = useState<VoiceAccent>("en-US");
  const [rate, setRate] = useState(0.84);
  const [voiceSettingsLoaded, setVoiceSettingsLoaded] = useState(false);
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const startedAt = useRef<number | null>(null);
  const recognition = useRef<RecognitionLike | null>(null);
  const lessons: readonly SpeakingCourseLesson[] = track === "book" ? SPOKEN_ENGLISH_BOOK_LESSONS : SPEAKING_LESSONS;
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const currentLesson = lessons[Math.max(0, lessonIndex)];
  const firstIncompleteIndex = lessons.findIndex((lesson) => !doneIds.has(lesson.id));
  const nextLessonIndex = firstIncompleteIndex < 0 ? lessons.length : firstIncompleteIndex;
  const completedCount = lessons.filter((lesson) => doneIds.has(lesson.id)).length;
  const isCourseComplete = completedCount === lessons.length;
  const trackTitle = track === "book" ? t("Spoken English book · 60 classes") : t("English fluency, IELTS and interview path");
  const words = countWords(transcript);
  const fillers = (transcript.match(/\b(um+|uh+|like|you know|actually|basically)\b/gi) || []).length;
  const wordsPerMinute = elapsed > 4 ? Math.round(words / elapsed * 60) : 0;
  const feedback = useMemo(() => transcript.trim() ? buildFeedback(transcript, elapsed, currentLesson, repeatMode) : null, [transcript, elapsed, currentLesson, repeatMode]);
  const preferredVoice = englishVoices.find((voice) => voice.lang.toLowerCase() === accent.toLowerCase())
    || englishVoices.find((voice) => voice.lang.toLowerCase().startsWith(accent.slice(0, 2).toLowerCase()))
    || englishVoices[0];

  useEffect(() => {
    setDoneIds(new Set(completedLessonIds));
  }, [completedLessonIds]);

  useEffect(() => {
    try {
      const savedAccent = window.localStorage.getItem("life-os-speaking-accent");
      const savedRate = Number(window.localStorage.getItem("life-os-speaking-rate"));
      const savedAutoRead = window.localStorage.getItem("life-os-speaking-auto-feedback");
      if (savedAccent === "en-US" || savedAccent === "en-GB") setAccent(savedAccent);
      if (savedRate >= 0.72 && savedRate <= 1) setRate(savedRate);
      if (savedAutoRead === "false") setAutoReadFeedback(false);
    } catch {
      // Keep the default English voice settings if browser storage is unavailable.
    }
    setVoiceSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!voiceSettingsLoaded) return;
    try {
      window.localStorage.setItem("life-os-speaking-accent", accent);
      window.localStorage.setItem("life-os-speaking-rate", String(rate));
      window.localStorage.setItem("life-os-speaking-auto-feedback", String(autoReadFeedback));
    } catch {
      // Voice preferences still work for this session if browser storage is unavailable.
    }
  }, [accent, autoReadFeedback, rate, voiceSettingsLoaded]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synthesis = window.speechSynthesis;
    const updateVoices = () => setEnglishVoices(synthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en")));
    updateVoices();
    synthesis.addEventListener("voiceschanged", updateVoices);
    return () => {
      synthesis.removeEventListener("voiceschanged", updateVoices);
      synthesis.cancel();
      try { recognition.current?.stop(); } catch { /* The browser may already have stopped recognition. */ }
    };
  }, []);

  function speak(text: string, speakingRate = rate) {
    if (!("speechSynthesis" in window)) {
      setNotice(t("English voice playback is unavailable in this browser."));
      return;
    }
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = speakingRate;
    const voice = synthesis.getVoices().find((entry) => entry.lang.toLowerCase() === accent.toLowerCase())
      || synthesis.getVoices().find((entry) => entry.lang.toLowerCase().startsWith(accent.slice(0, 2).toLowerCase()));
    if (voice) utterance.voice = voice;
    synthesis.cancel();
    synthesis.speak(utterance);
  }

  function resetAnswer() {
    try { recognition.current?.stop(); } catch { /* The browser may already have stopped recognition. */ }
    recognition.current = null;
    setRecording(false);
    startedAt.current = null;
    setTranscript("");
    setElapsed(0);
    setSaved(false);
    setRepeatMode(false);
    setNotice("");
  }

  function chooseLesson(id: string) {
    const index = lessons.findIndex((lesson) => lesson.id === id);
    if (index > nextLessonIndex && !doneIds.has(id)) return;
    resetAnswer();
    setLessonId(id);
  }

  function changeTrack(nextTrack: CourseTrack) {
    const nextLessons = nextTrack === "book" ? SPOKEN_ENGLISH_BOOK_LESSONS : SPEAKING_LESSONS;
    const first = nextLessons.find((lesson) => !doneIds.has(lesson.id)) || nextLessons[nextLessons.length - 1];
    resetAnswer();
    setTrack(nextTrack);
    setLessonId(first.id);
  }

  function playLesson() {
    speak(`Lesson ${lessonIndex + 1}. ${currentLesson.title}. Goal: ${currentLesson.goal} Practice question: ${currentLesson.prompt} Useful frame: ${currentLesson.frame} ${currentLesson.grammar ? `Grammar: ${currentLesson.grammar}` : ""} ${currentLesson.drill}`);
  }

  function playModel() {
    resetAnswer();
    setRepeatMode(true);
    setNotice(t("Listen to the model, then repeat it aloud. The transcript comparison is only a rough practice cue."));
    speak(`Listen to the English model. ${currentLesson.model}`, Math.min(rate, 0.82));
  }

  function startPractice() {
    setNotice("");
    setTranscript("");
    setElapsed(0);
    setSaved(false);
    startedAt.current = Date.now();
    setRecording(true);
    const browserWindow = window as RecognitionWindow;
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setRecording(false);
      startedAt.current = null;
      const message = "Speech recognition is unavailable in this browser. Type your answer, then use the English voice buttons to practise.";
      setNotice(t(message));
      if (autoReadFeedback) speak(message);
      return;
    }
    try {
      const instance = new Recognition();
      instance.lang = accent;
      instance.continuous = true;
      instance.interimResults = true;
      instance.onresult = (event) => setTranscript(Array.from(event.results).map((result) => result[0].transcript).join(" ").trim());
      instance.onerror = () => {
        const message = "Microphone access stopped. Check browser permission or type your answer.";
        setNotice(t(message));
        if (autoReadFeedback) speak(message);
        setRecording(false);
      };
      instance.onend = () => setRecording(false);
      recognition.current = instance;
      instance.start();
    } catch {
      const message = "Could not start the microphone. Check permission or type your answer.";
      setNotice(t(message));
      if (autoReadFeedback) speak(message);
      setRecording(false);
    }
  }

  function stopPractice() {
    try { recognition.current?.stop(); } catch { /* The browser may already have stopped recognition. */ }
    recognition.current = null;
    setRecording(false);
    if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
  }

  async function savePractice() {
    if (!transcript.trim()) {
      setNotice(t("Speak or write an answer before saving."));
      return;
    }
    setSaving(true);
    stopPractice();
    const durationSeconds = elapsed || (startedAt.current ? Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000)) : 0);
    const finalFeedback = buildFeedback(transcript, durationSeconds, currentLesson, repeatMode);
    try {
      const result = await saveSpeakingAttempt({ topic: currentLesson.id, transcript, durationSeconds });
      setNotice(t(result.message));
      if (result.ok) {
        setDoneIds((previous) => new Set([...previous, currentLesson.id]));
        setSaved(true);
        if (autoReadFeedback) speak(finalFeedback.spokenMessage);
        router.refresh();
      } else if (autoReadFeedback) {
        speak(result.message);
      }
    } catch {
      setNotice(t("Could not save this practice. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  function continueCourse() {
    const next = isCourseComplete ? lessons[0] : lessons[nextLessonIndex];
    chooseLesson(next.id);
    if (autoReadFeedback) speak(`Next lesson: ${next.title}. ${next.goal} ${next.prompt}`);
  }

  const stageLabels = [...new Set(lessons.map((lesson) => lesson.stage))];
  const selectedHistory = history;

  return <div className="stack speaking-course">
    <Panel title={trackTitle} subtitle={track === "book" ? t("Follow the Easy, Medium and Hard classes from your Spoken English book. Every class has an original prompt, model, grammar note and speaking drill.") : t("Keep practising IELTS and real-life answers with your existing step-by-step path.")}>
      <div className="speaking-track-tabs" role="group" aria-label={t("Choose speaking course")}>
        <button type="button" className={`speaking-track-tab ${track === "book" ? "active" : ""}`} aria-pressed={track === "book"} onClick={() => changeTrack("book")}><BookOpenCheck size={16} /><span><b>{t("Spoken English book")}</b><small>{formatNumber(locale, SPOKEN_ENGLISH_BOOK_LESSONS.length)} {t("classes")}</small></span></button>
        <button type="button" className={`speaking-track-tab ${track === "coach" ? "active" : ""}`} aria-pressed={track === "coach"} onClick={() => changeTrack("coach")}><Languages size={16} /><span><b>{t("IELTS & real-life speaking")}</b><small>{formatNumber(locale, SPEAKING_LESSONS.length)} {t("lessons")}</small></span></button>
      </div>
      <div className="speaking-course-progress"><div><b>{formatNumber(locale, completedCount)} / {formatNumber(locale, lessons.length)}</b><span>{track === "book" ? t("classes completed") : t("lessons completed")}</span></div><div className="progress-track"><i style={{ width: `${Math.round(completedCount / lessons.length * 100)}%` }} /></div><small>{isCourseComplete ? t("Course complete. Revisit any lesson to keep improving.") : t("Next up:") + " " + (lessons[nextLessonIndex]?.title || "")}</small></div>
    </Panel>

    <SentenceBuilder t={t} speak={(text) => speak(text)} />

    <div className="dashboard-grid speaking-course-layout">
      <div className="stack">
        <Panel title={currentLesson.title} subtitle={currentLesson.goal}>
          {track === "book" && lessonIndex < 7 && <BeginnerSpeakingGuide lessonIndex={lessonIndex} />}
          <div className="speaking-lesson-meta"><span>{track === "book" ? t("CLASS") : t("LESSON")} {lessonIndex + 1} / {lessons.length}</span><span>{currentLesson.stage}</span><span>{currentLesson.minutes} {t("min")}</span></div>
          <div className="speaking-prompt"><span>{t("SPEAKING QUESTION")}</span><p>{currentLesson.prompt}</p><button className="button button-quiet button-small" type="button" onClick={playLesson}><Volume2 size={14} />{t("Hear lesson in English")}</button></div>
          <div className="speaking-model"><div><span>{t("LISTEN TO THE MODEL")}</span><p>{currentLesson.model}</p></div><button className="button button-secondary button-small" type="button" onClick={playModel}><Play size={13} />{t("Hear and repeat")}</button></div>
          {repeatMode && <p className="speaking-repeat-note" role="status">{t("Repeat the model aloud, then compare the transcript. The match is a rough speech-recognition cue, not a pronunciation score.")}</p>}
          <div className="speaking-frame"><b>{t("Useful speaking frame")}</b><p>{currentLesson.frame}</p>{currentLesson.grammar && <small className="speaking-grammar-tip"><b>{t("Quick grammar")}</b> {currentLesson.grammar}</small>}<small>{currentLesson.drill}</small></div>

          <div className="speaking-controls"><button className={`button ${recording ? "button-secondary" : "button-primary"}`} type="button" onClick={recording ? stopPractice : startPractice}>{recording ? <><MicOff size={14} />{t("Stop speaking")}</> : <><Mic size={14} />{t("Start speaking")}</>}</button><span className="practice-clock"><Headphones size={14} /> {Math.floor(elapsed / 60).toString().padStart(2, "0")}:{(elapsed % 60).toString().padStart(2, "0")}</span><span className="speaking-language-tag">{t("Microphone language: English")}</span></div>
          <label className="form-field speaking-answer"><span>{t("Your answer")}</span><textarea className="textarea" value={transcript} onChange={(event) => { setTranscript(event.target.value); setSaved(false); }} maxLength={12_000} placeholder={t("Your English transcript appears here. You can also type your answer.")} rows={6} /><small>{t(currentLesson.id === "lesson-03-clear-sounds" ? "Use at least 10 words to complete this lesson." : "Use at least 20 words to complete this class.")}</small></label>
          <div className="practice-live-metrics"><span><b>{formatNumber(locale, words)}</b><small>{t("words")}</small></span><span><b>{formatNumber(locale, wordsPerMinute)}</b><small>{t("words per minute")}</small></span><span><b>{formatNumber(locale, fillers)}</b><small>{t("filler words")}</small></span></div>
          {notice && <p className="practice-notice" role="status">{notice}</p>}
          <div className="form-actions speaking-action-row"><button className="button button-primary" type="button" disabled={saving || !transcript.trim() || saved} onClick={savePractice}><Save size={14} />{saving ? t("Saving…") : saved ? t("Answer saved") : t("Save answer and hear feedback")}</button><button className="button button-secondary" type="button" disabled={!transcript.trim()} onClick={() => speak(`Your answer. ${transcript}`)}><Speaker size={14} />{t("Hear my answer")}</button><button className="button button-quiet button-small" type="button" onClick={resetAnswer}><RotateCcw size={14} />{t("Try again")}</button></div>
          {feedback && <div className="speaking-feedback" aria-live="polite"><div className="speaking-feedback-heading"><div><span>{t("YOUR PRACTICE FEEDBACK")}</span><h3>{t("One step to improve")}</h3></div><button className="button button-secondary button-small" type="button" onClick={() => speak(feedback.spokenMessage)}><Volume2 size={13} />{t("Hear feedback in English")}</button></div>{feedback.speechToTextMatch !== null && <p className="speaking-match"><b>{feedback.speechToTextMatch}%</b> {t("rough word match to the model — not a pronunciation grade")}</p>}<ul>{feedback.points.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul></div>}
          {saved && <div className="speaking-next-step"><span><Check size={15} /> {t("Lesson completed. Your next step is ready.")}</span><button className="button button-primary button-small" type="button" onClick={continueCourse}>{isCourseComplete ? t("Review the course") : t("Continue to next lesson")} <ChevronRight size={14} /></button></div>}
        </Panel>
      </div>

      <div className="stack">
        <Panel title={t("English voice coach")} subtitle={t("Hear the lesson, model answer, your answer, and spoken feedback in English.")}>
          <label className="form-field"><span>{t("English accent")}</span><select className="select" value={accent} onChange={(event) => setAccent(event.target.value as VoiceAccent)}><option value="en-US">US English</option><option value="en-GB">UK English</option></select></label>
          <label className="form-field speaking-rate"><span>{t("Voice speed")} · {rate.toFixed(2)}×</span><input type="range" min="0.72" max="1" step="0.04" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
          <label className="speaking-auto-voice"><input type="checkbox" checked={autoReadFeedback} onChange={(event) => setAutoReadFeedback(event.target.checked)} /><span>{t("Read my feedback aloud automatically")}</span></label>
          <div className="speaking-voice-status"><Volume2 size={15} /><span>{preferredVoice ? `${preferredVoice.name} · ${preferredVoice.lang}` : t("Using the English voice installed in your browser or device.")}</span></div>
          <p className="settings-copy">{t("Voice playback uses your browser or device's English text-to-speech voice. This app does not save microphone audio. Browser speech recognition processes microphone input according to your browser's privacy settings.")}</p>
        </Panel>
        <Panel title={track === "book" ? t("60-class book map") : t("Step-by-step course map")} subtitle={t("The next lesson unlocks when you save your current answer.")}>
          <div className="speaking-course-map">{stageLabels.map((stage) => <section key={stage}><h3>{stage}</h3>{lessons.filter((lesson) => lesson.stage === stage).map((lesson) => {
            const index = lessons.findIndex((entry) => entry.id === lesson.id);
            const complete = doneIds.has(lesson.id);
            const unlocked = index <= nextLessonIndex || complete;
            const active = lesson.id === lessonId;
            return <button className={`speaking-lesson-link ${active ? "active" : ""} ${complete ? "complete" : ""}`} key={lesson.id} type="button" disabled={!unlocked} onClick={() => chooseLesson(lesson.id)}><span className="speaking-lesson-number">{complete ? <Check size={13} /> : unlocked ? index + 1 : <LockKeyhole size={12} />}</span><span><b>{lesson.title}</b><small>{lesson.minutes} {t("min")}</small></span></button>;
          })}</section>)}</div>
        </Panel>
        <Panel title={t("A simple daily routine")} subtitle={t("About 15 minutes a day") }>
          <ol className="speaking-daily-routine"><li><b>Listen · 3 minutes</b><span>Play the model twice. Notice how the speaker stresses key words.</span></li><li><b>Speak · 7 minutes</b><span>Answer without reading. Use the frame only if you get stuck.</span></li><li><b>Review · 5 minutes</b><span>Hear your feedback, choose one improvement, and repeat the answer.</span></li></ol>
        </Panel>
      </div>
    </div>

    <Panel title={t("Recent speaking practice")} subtitle={t("Listen to your past answers and notice how they change over time.")}>
      {selectedHistory.length ? <div className="practice-history">{selectedHistory.map((attempt) => {
        const lesson = ALL_SPEAKING_LESSONS.find((candidate) => candidate.id === attempt.topic);
        const oldTopic = LEGACY_SPEAKING_TOPICS[attempt.topic];
        return <article className="practice-history-row" key={attempt.id}><span className="practice-skill-icon"><Mic size={15} /></span><div className="practice-history-main"><b>{lesson?.title || oldTopic || "Speaking practice"}</b><small>{formatDate(locale, attempt.createdAt, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })} · {formatNumber(locale, attempt.wordCount)} {t("words")} · {formatNumber(locale, attempt.wordsPerMinute)} {t("words per minute")}</small><p>{attempt.transcript}</p></div><button className="icon-button" type="button" aria-label={t("Hear saved answer")} title={t("Hear saved answer")} onClick={() => speak(`Your saved answer. ${attempt.transcript}`)}><Volume2 size={15} /></button><form action={deleteSpeakingAttempt}><input type="hidden" name="id" value={attempt.id} /><button className="icon-button row-delete" type="submit" aria-label={t("Delete practice entry")}><Trash2 size={14} /></button></form></article>;
      })}</div> : <EmptyState title={t("No speaking practice saved yet")} description={t("Start lesson one, answer aloud, and save your first practice.")} icon={<Mic size={17} />} />}
    </Panel>
  </div>;
}
