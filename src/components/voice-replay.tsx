"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Mic, Square } from "lucide-react";

export function VoiceReplay() {
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [url, setUrl] = useState("");
  const [extension, setExtension] = useState("webm");
  const [notice, setNotice] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioUrl = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    };
  }, []);

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    setRecording(false);
  }

  async function start() {
    if (requesting || recording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNotice("এই ব্রাউজারে রেকর্ড করা যাচ্ছে না। ফোনের voice recorder দিয়ে নিজের কথা রেকর্ড করে শুনতে পারেন।");
      return;
    }
    setRequesting(true);
    setNotice("");
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) { input.getTracks().forEach((track) => track.stop()); return; }
      stream.current = input;
      const next = new MediaRecorder(input);
      recorder.current = next;
      const chunks: Blob[] = [];
      next.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      next.onstop = () => {
        input.getTracks().forEach((track) => track.stop());
        if (timer.current) clearTimeout(timer.current);
        if (!active.current) return;
        setRecording(false);
        if (!chunks.length) { setNotice("রেকর্ডিং পাওয়া যায়নি। আবার চেষ্টা করুন।"); return; }
        if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
        const blob = new Blob(chunks, { type: next.mimeType || chunks[0].type });
        audioUrl.current = URL.createObjectURL(blob);
        setUrl(audioUrl.current);
        setExtension(blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm");
      };
      next.onerror = () => { stop(); setNotice("রেকর্ডিং বন্ধ হয়েছে। মাইক্রোফোন দেখে আবার চেষ্টা করুন।"); };
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      next.start();
      setRecording(true);
      timer.current = setTimeout(() => { stop(); setNotice("২ মিনিটের রেকর্ডিং শেষ। এবার নিজের কথা শুনুন।"); }, 120_000);
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (active.current) setNotice("মাইক্রোফোনের অনুমতি দিন এবং আবার চেষ্টা করুন। চাইলে রেকর্ড ছাড়াই জোরে জোরে বলুন।");
    } finally { if (active.current) setRequesting(false); }
  }

  return <section className="voice-replay" lang="bn" aria-label="নিজের কণ্ঠ শুনুন">
    <h3>নিজের কণ্ঠ শুনুন</h3><p>নমুনা শোনার পর নিজের মতো ৩টি বাক্য বলুন। তারপর শুনে দেখুন কোথায় থামছেন বা শব্দ অস্পষ্ট হচ্ছে।</p>
    <button type="button" className={`button ${recording ? "button-secondary" : "button-primary"}`} onClick={recording ? stop : start} disabled={requesting}>{recording ? <Square size={15} /> : <Mic size={15} />}{requesting ? "মাইক্রোফোনের অনুমতি অপেক্ষায়…" : recording ? "থামিয়ে শুনুন" : "নিজের কণ্ঠ রেকর্ড করুন"}</button>
    {recording && <p role="status">রেকর্ড হচ্ছে… সর্বোচ্চ ২ মিনিট।</p>}
    {url && !recording && <div className="voice-replay-result"><audio key={url} src={url} controls aria-label="আপনার নিজের কণ্ঠের রেকর্ডিং" /><a className="button button-secondary" href={url} download={`my-speaking.${extension}`}><Download size={15} />রেকর্ডিং রেখে দিন</a></div>}
    <small>রেকর্ডিং এই পেজে থাকে। পরে শুনতে ডাউনলোড করুন; পেজ ছাড়লে হারিয়ে যাবে। সার্ভারে অডিও জমা হয় না।</small>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
