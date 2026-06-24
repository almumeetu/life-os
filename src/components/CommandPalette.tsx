import React, { useState, useEffect, useRef } from "react";
import { Search, Folder, FileText, Award, GraduationCap, Briefcase, CheckSquare, BookOpen, User, Key, ArrowRight } from "lucide-react";
import { LifeOSState } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  state: LifeOSState;
  onNavigate: (tabId: string, searchFilter?: string) => void;
}

export default function CommandPalette({ isOpen, onClose, state, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search through all state categories
  const results: {
    category: string;
    items: { title: string; subtitle: string; icon: React.ReactNode; tabId: string; filter?: string }[];
  }[] = [];

  const lowerQuery = query.toLowerCase();

  // 1. Projects
  const projectMatches = state.projects.filter(
    (p) => p.title.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery) || p.technologies.some(t => t.toLowerCase().includes(lowerQuery))
  );
  if (projectMatches.length > 0) {
    results.push({
      category: "Projects",
      items: projectMatches.map((p) => ({
        title: p.title,
        subtitle: `${p.status} • ${p.technologies.slice(0, 3).join(", ")}`,
        icon: <Folder className="w-4 h-4 text-emerald-500" />,
        tabId: "projects",
      })),
    });
  }

  // 2. Resumes
  const resumeMatches = state.resumes.filter(
    (r) => r.title.toLowerCase().includes(lowerQuery) || r.summary.toLowerCase().includes(lowerQuery)
  );
  if (resumeMatches.length > 0) {
    results.push({
      category: "Resumes & Portfolio",
      items: resumeMatches.map((r) => ({
        title: r.title,
        subtitle: r.summary.substring(0, 60) + "...",
        icon: <FileText className="w-4 h-4 text-blue-500" />,
        tabId: "resumes",
      })),
    });
  }

  // 3. Notes
  const noteMatches = state.notes.filter(
    (n) => n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery) || n.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
  if (noteMatches.length > 0) {
    results.push({
      category: "Notes",
      items: noteMatches.map((n) => ({
        title: n.title,
        subtitle: `Tags: ${n.tags.join(", ")}`,
        icon: <BookOpen className="w-4 h-4 text-purple-500" />,
        tabId: "notes",
      })),
    });
  }

  // 4. Skills
  const skillMatches = state.skills.filter(
    (s) => s.name.toLowerCase().includes(lowerQuery) || s.category.toLowerCase().includes(lowerQuery)
  );
  if (skillMatches.length > 0) {
    results.push({
      category: "Skills",
      items: skillMatches.map((s) => ({
        title: s.name,
        subtitle: `${s.category} • ${s.level}`,
        icon: <Award className="w-4 h-4 text-amber-500" />,
        tabId: "skills",
      })),
    });
  }

  // 5. Job Applications
  const applicationMatches = state.applications.filter(
    (a) => a.company.toLowerCase().includes(lowerQuery) || a.position.toLowerCase().includes(lowerQuery)
  );
  if (applicationMatches.length > 0) {
    results.push({
      category: "Job Tracker",
      items: applicationMatches.map((a) => ({
        title: `${a.position} at ${a.company}`,
        subtitle: `Status: ${a.status}`,
        icon: <Briefcase className="w-4 h-4 text-cyan-500" />,
        tabId: "applications",
      })),
    });
  }

  // 6. Goals
  const goalMatches = state.goals.filter((g) => g.title.toLowerCase().includes(lowerQuery));
  if (goalMatches.length > 0) {
    results.push({
      category: "Goals & Checklists",
      items: goalMatches.map((g) => ({
        title: g.title,
        subtitle: `${g.timeframe} Goal • ${g.completed ? "✓ Completed" : "⏳ In Progress"}`,
        icon: <CheckSquare className="w-4 h-4 text-pink-500" />,
        tabId: "goals",
      })),
    });
  }

  // 7. General navigation helpers if query is empty or matched
  if (query.length === 0) {
    results.push({
      category: "Quick Actions & Navigation",
      items: [
        { title: "Personal Profile", subtitle: "Manage personal contact and social links", icon: <User className="w-4 h-4 text-indigo-500" />, tabId: "profile" },
        { title: "Documents Vault", subtitle: "View and upload national IDs, banking files, letters", icon: <FileText className="w-4 h-4 text-teal-500" />, tabId: "documents" },
        { title: "Password Vault", subtitle: "Access client-side encrypted usernames & API keys", icon: <Key className="w-4 h-4 text-rose-500" />, tabId: "passwords" },
        { title: "Smart AI Assistant", subtitle: "Ask Gemini to tailor resumes or generate cover letters", icon: <ArrowRight className="w-4 h-4 text-violet-500" />, tabId: "ai" },
      ],
    });
  }

  const handleItemClick = (tabId: string, filter?: string) => {
    onNavigate(tabId, filter);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-start justify-center z-50 pt-[10vh] px-4 animate-fade-in" id="command-palette-backdrop">
      <div 
        ref={containerRef}
        className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] transition-all"
        id="command-palette-container"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. Resume, React, Linear, Goal)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-[15px]"
            id="command-palette-input"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 rounded shadow-xs ml-2 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 max-h-[50vh]">
          {results.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 dark:text-neutral-500" id="no-search-results">
              <p className="text-sm">No results match "{query}"</p>
              <p className="text-xs mt-1">Try searching for other skills, projects, or applications.</p>
            </div>
          ) : (
            results.map((group) => (
              <div key={group.category} className="space-y-1">
                <h3 className="px-3 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {group.category}
                </h3>
                {group.items.map((item, index) => (
                  <button
                    key={`${item.title}-${index}`}
                    onClick={() => handleItemClick(item.tabId, item.filter)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-zinc-800/60 group transition-all"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-1.5 bg-neutral-100 dark:bg-zinc-800 rounded-md shrink-0 group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                        {item.icon}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate group-hover:text-black dark:group-hover:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-zinc-955 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
          <div className="flex items-center space-x-4">
            <span>↑↓ Navigation</span>
            <span>↵ Select</span>
          </div>
          <div>
            <span>Press <kbd className="px-1 bg-white dark:bg-zinc-800 border rounded">⌘K</kbd> to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
