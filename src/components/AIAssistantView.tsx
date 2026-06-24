import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Sparkles, User, AlertCircle, RefreshCw, Trash2, 
  ChevronRight, BrainCircuit, CheckSquare, PlusCircle, HelpCircle
} from "lucide-react";
import { LifeOSState, AIChatMessage } from "../types";

interface AIAssistantViewProps {
  state: LifeOSState;
  onSaveMessages: (updated: AIChatMessage[]) => void;
}

export default function AIAssistantView({ state, onSaveMessages }: AIAssistantViewProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = state.aiSessionMessages || [];

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    setErrorText("");

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    onSaveMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          lifeState: state // Send entire state context so Gemini can answer anything
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.reply || "I apologize, but I could not compute a solid response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      onSaveMessages([...updatedMessages, assistantMsg]);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to communicate with local Gemini Proxy. Confirm your API key in Secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Reset chat assistant history?")) {
      onSaveMessages([]);
    }
  };

  // Quick Action chips
  const promptChips = [
    { label: "Draft a corporate profile summary", text: "Draft an engaging, professional corporate resume summary for my CV using my current work milestones." },
    { label: "Analyze subscription overheads", text: "Analyze my active subscriptions and calculate the total annual cost, suggesting which ones I can consolidate." },
    { label: "Review freelancing revenue & proposals", text: "Review my freelancing proposals and active contracts. How much potential revenue is currently in progress?" },
    { label: "Plan next course roadmap steps", text: "Analyze my core skills and current learning items. Give me a clear 3-step action roadmap to level up my technical stack." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="ai-assistant-pane">
      
      {/* Left Column: AI configuration & stats */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">AI Copilot Core</h3>
          </div>

          <div className="space-y-2 text-xs text-neutral-500">
            <p>Your Life OS Assistant maintains complete real-time context of your profile, projects, resumes, assets, finances, goals, and credentials.</p>
            <p>You can ask it to draft documents, prepare portfolios, audit finances, or structure daily work plans.</p>
          </div>

          <div className="border-t pt-3 flex justify-between items-center text-xs">
            <span className="font-semibold text-neutral-400">Context Loaded:</span>
            <span className="font-bold text-emerald-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
              100% Active
            </span>
          </div>

          <button
            onClick={handleClearHistory}
            className="w-full py-1.5 border hover:bg-neutral-50 text-neutral-500 hover:text-red-500 rounded font-bold text-xs flex items-center justify-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Copilot History</span>
          </button>
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Instant Prompts</h4>
          <div className="space-y-2">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.text)}
                disabled={isLoading}
                className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/20 text-left rounded-lg text-[10px] border border-neutral-150 hover:border-indigo-400 dark:border-zinc-800 text-neutral-600 dark:text-neutral-450 transition-all font-medium leading-relaxed block"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Dialog Box */}
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 h-[550px] flex flex-col justify-between" id="ai-chat-shell">
        
        {/* Messages scrolled panel */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text text-left">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 py-12 max-w-sm mx-auto space-y-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">How can I assist your Life OS workspace?</p>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">Ask me to draft resume sections, calculate monthly budgets, organize career courses, or build professional summaries.</p>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex space-x-3 text-xs ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    AI
                  </div>
                )}
                
                <div className={`max-w-xl p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-neutral-800 dark:bg-zinc-800 text-white rounded-tr-none" 
                    : "bg-neutral-50 dark:bg-zinc-950/40 border border-neutral-150 dark:border-zinc-800 text-neutral-700 dark:text-neutral-250 rounded-tl-none font-sans"
                }`}>
                  <p>{msg.content}</p>
                  <span className="block text-[8px] text-neutral-400 mt-1 text-right font-mono">{msg.timestamp}</span>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 shrink-0 rounded-full bg-neutral-200 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold">
                    U
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex space-x-3 text-xs justify-start">
              <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold animate-pulse">
                AI
              </div>
              <div className="bg-neutral-50 dark:bg-zinc-950/40 border border-neutral-150 dark:border-zinc-850 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-neutral-400 font-mono text-[10px]">Processing Life OS datasets via Gemini Flash...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t pt-4 space-y-3">
          {errorText && (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg flex items-center space-x-1.5 text-[10px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot: 'Summarize my CV' or 'Audit my subscription overheads'..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isLoading}
              className="w-full p-2.5 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl text-xs outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
