"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, CirclePause, CirclePlay, RotateCcw } from "lucide-react";
import { recordFocusSession } from "@/lib/actions/focus";

const presets = [25, 50, 5];

export function FocusTimer({ activeTasks, sessionsToday }: { activeTasks: string[]; sessionsToday: number }) {
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [message, setMessage] = useState("");
  const [savedCount, setSavedCount] = useState(sessionsToday);
  const [isSaving, startSaving] = useTransition();
  const completionHandled = useRef(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running || remaining > 0 || completionHandled.current) return;
    completionHandled.current = true;
    setRunning(false);
    playCompletionChime();
    setMessage("Session complete! Great work. Take a few minutes to reset.");
    startSaving(async () => {
      const result = await recordFocusSession({ durationSeconds: minutes * 60, taskTitle });
      if (result.ok) setSavedCount((count) => count + 1);
      else setMessage(result.message);
    });
  }, [minutes, remaining, running, startSaving, taskTitle]);

  function playCompletionChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [
        { freq: 523.25, start: now, dur: 0.8, vol: 0.2 },
        { freq: 659.25, start: now + 0.2, dur: 1.0, vol: 0.25 },
        { freq: 783.99, start: now + 0.4, dur: 1.6, vol: 0.3 },
      ].forEach(({ freq, start, dur, vol }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // Audio autoplay policy
    }
  }

  function choosePreset(value: number) {
    setRunning(false);
    setMinutes(value);
    setRemaining(value * 60);
    setMessage("");
    completionHandled.current = false;
  }

  function reset() {
    setRunning(false);
    setRemaining(minutes * 60);
    completionHandled.current = false;
    setMessage("");
  }

  const clock = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return <div className="focus-layout">
    <div className="panel focus-timer-panel">
      <div className="timer-mode">{running ? "FOCUS IN PROGRESS" : "MAKE SPACE TO THINK"}</div>
      <div className="timer-readout" aria-live="polite">{clock}</div>
      <div className="timer-presets" aria-label="Session length">{presets.map((preset) => <button className={`timer-preset ${minutes === preset ? "active" : ""}`} type="button" key={preset} onClick={() => choosePreset(preset)}>{preset} min</button>)}</div>
      <label className="focus-task-select"><span>Focus on (optional)</span><select className="select" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)}><option value="">Choose an open step</option>{activeTasks.map((task) => <option key={task} value={task}>{task}</option>)}</select></label>
      <div className="quick-actions timer-controls"><button className="button button-primary" type="button" onClick={() => { completionHandled.current = false; setRunning((value) => !value); setMessage(""); }} disabled={isSaving}>{running ? <><CirclePause size={16} />Pause</> : <><CirclePlay size={16} />Start focus</>}</button><button className="button button-secondary" type="button" onClick={reset}><RotateCcw size={14} />Reset</button></div>
      {message && <p className="timer-message" role="status">{message}</p>}
    </div>
    <div className="stack">
      <div className="metric-card focus-stat-card"><span className="panel-icon"><Check size={16} /></span><small>SESSIONS TODAY</small><b className="metric-value">{savedCount}</b><span className="metric-note">Completed blocks saved to your review.</span></div>
      <div className="panel"><div className="panel-header"><div><h2 className="panel-title">A calmer focus block</h2><p className="panel-subtitle">Pick one useful thing. Let the rest wait.</p></div></div><ul className="focus-tips"><li>Close extra tabs and put your phone away.</li><li>Take a short break after a 25 or 50 minute block.</li><li>Keep this page open while the timer runs.</li></ul></div>
    </div>
  </div>;
}
