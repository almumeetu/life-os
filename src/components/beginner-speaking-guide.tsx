"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BEGINNER_LESSONS } from "@/lib/learning-books";

export function BeginnerSpeakingGuide({ lessonIndex = 0, chooseLesson = false }: { lessonIndex?: number; chooseLesson?: boolean }) {
  const [selected, setSelected] = useState(lessonIndex);
  const [notice, setNotice] = useState("");
  const lesson = BEGINNER_LESSONS[chooseLesson ? selected : lessonIndex];
  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);
  if (!lesson) return null;

  function listen() {
    if (!("speechSynthesis" in window)) {
      setNotice("এই ব্রাউজারে পড়ে শোনানো যাচ্ছে না। নিচের ইংরেজি বাক্যগুলো দেখে জোরে পড়ুন।");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(lesson.english);
    utterance.lang = "en-GB";
    utterance.rate = 0.75;
    utterance.onerror = () => setNotice("শব্দ শোনা না গেলে ডিভাইসের ভলিউম ও ইংরেজি voice settings দেখুন।");
    setNotice("");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return <section className="beginner-guide" lang="bn" aria-label="সহজ বাংলা ব্যাখ্যা">
    <div className="reader-section-heading"><div><span className="eyebrow">বাংলা বুঝে ইংরেজি বলি</span><h3>{lesson.title}</h3></div>
      {chooseLesson && <label className="form-field"><span>প্রথম ৭ ক্লাসের সহায়িকা</span><select className="select" value={selected} onChange={(event) => { setSelected(Number(event.target.value)); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }}>{BEGINNER_LESSONS.map((entry, index) => <option value={index} key={entry.title}>{index + 1}. {entry.title}</option>)}</select></label>}
    </div>
    <p>{lesson.meaning}</p>
    <div className="beginner-example"><p lang="en">{lesson.english}</p><p>{lesson.bangla}</p><button className="button button-secondary" type="button" onClick={listen}><Volume2 size={16} />ধীরে শুনুন, তারপর বলুন</button></div>
    <p><b>বাক্য বানানোর নিয়ম:</b> {lesson.rule}</p>
    <p><b>একটি সাধারণ ভুল:</b> {lesson.mistake}</p>
    <p><b>এবার আপনার পালা:</b> {lesson.task}</p>
    <small>এগুলো অ্যাপের সহজ উদাহরণ। বইয়ের আসল ব্যাখ্যা পড়তে বইয়ের পাতায় ফিরে যান।</small>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
