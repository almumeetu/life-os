"use client";

import { Mic, MicOff } from "lucide-react";
import { useRef, useState } from "react";

type VoiceRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type VoiceWindow = Window & { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition };

export function VoiceInput({ name, defaultValue = "", placeholder, required = false, maxLength = 160 }: { name: string; defaultValue?: string; placeholder: string; required?: boolean; maxLength?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState("");
  const recognizer = useRef<VoiceRecognition | null>(null);

  function toggleVoice() {
    if (recognizer.current) {
      recognizer.current.stop();
      recognizer.current = null;
      setRecording(false);
      setMessage("");
      return;
    }
    const supportedWindow = window as VoiceWindow;
    const Recognition = supportedWindow.SpeechRecognition || supportedWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage("Voice input is not available in this browser.");
      return;
    }
    const instance = new Recognition();
    instance.lang = "en-US";
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = (event) => setValue(Array.from(event.results).map((result) => result[0].transcript).join(" ").trim());
    instance.onerror = () => setMessage("Microphone access failed. You can type instead.");
    instance.onend = () => { recognizer.current = null; setRecording(false); };
    recognizer.current = instance;
    setMessage("Listening… select the microphone again to stop.");
    setRecording(true);
    try { instance.start(); } catch { recognizer.current = null; setRecording(false); setMessage("Could not start voice input. You can type instead."); }
  }

  return <div className="voice-input-wrap"><div className="voice-input-row"><input className="input" name={name} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} maxLength={maxLength} required={required} /><button className={`icon-button voice-button ${recording ? "recording" : ""}`} type="button" onClick={toggleVoice} aria-label={recording ? "Stop voice input" : "Dictate with voice"} title={recording ? "Stop voice input" : "Dictate with voice"}>{recording ? <MicOff size={15} /> : <Mic size={15} />}</button></div>{message && <small className="voice-message" role="status">{message}</small>}</div>;
}
