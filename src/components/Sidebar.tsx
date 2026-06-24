import React from "react";
import { 
  LayoutDashboard, User, FileText, FolderGit2, Briefcase, 
  GraduationCap, Target, BookOpenCheck, Key, ShieldAlert,
  FileSpreadsheet, Sparkles, LogOut, ChevronLeft, ChevronRight,
  Sun, Moon, Users, Laptop
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  darkMode, 
  toggleDarkMode,
  onOpenCommandPalette
}: SidebarProps) {

  const menuItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "profile", label: "Profile & Socials", icon: <User className="w-4 h-4" /> },
    { id: "resumes", label: "Resumes & Portfolio", icon: <FileText className="w-4 h-4" /> },
    { id: "projects", label: "Projects Hub", icon: <FolderGit2 className="w-4 h-4" /> },
    { id: "career", label: "Career & Education", icon: <Briefcase className="w-4 h-4" /> },
    { id: "skills", label: "Skills & Learning", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "freelancing", label: "Freelancing Hub", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "documents", label: "Documents Vault", icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: "applications", label: "Job Applications", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "goals", label: "Goals & Planning", icon: <Target className="w-4 h-4" /> },
    { id: "notes", label: "Notes System", icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: "contacts", label: "Contacts & Assets", icon: <Users className="w-4 h-4" /> },
    { id: "passwords", label: "Password Vault", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div 
      className={`h-screen border-r border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "w-[68px]" : "w-[240px]"
      } shrink-0 select-none`}
      id="lifeos-sidebar"
    >
      {/* Upper Brand Section */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-zinc-900">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight text-[16px]">
                Life OS
              </span>
              <span className="text-[10px] bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-full">
                SaaS
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-md text-neutral-400 dark:text-neutral-500 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Global Search Quick Trigger */}
        <div className="p-2">
          <button
            onClick={onOpenCommandPalette}
            className={`w-full flex items-center rounded-lg border border-neutral-200/80 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-colors py-1.5 px-2.5 text-neutral-400 text-left ${
              isCollapsed ? "justify-center" : "space-x-2"
            }`}
          >
            <span className="text-xs">🔍</span>
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">Search Vault...</span>
                <span className="text-[10px] border border-neutral-200 dark:border-zinc-800 px-1 bg-white dark:bg-zinc-800 rounded text-neutral-400">
                  ⌘K
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-210px)]" id="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" 
                    : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-900 hover:text-neutral-900 dark:hover:text-zinc-100"
                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                title={item.label}
              >
                <div className={`${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400 dark:text-zinc-500"}`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="truncate text-[13px]">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Settings Section */}
      <div className="p-2 border-t border-neutral-100 dark:border-zinc-900 space-y-1">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-900 transition-all ${
            isCollapsed ? "justify-center" : "space-x-3"
          }`}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
          {!isCollapsed && (
            <span className="text-[13px] text-neutral-600 dark:text-zinc-400">
              {darkMode ? "Light Appearance" : "Dark Appearance"}
            </span>
          )}
        </button>

        {/* AI Assistant Quick Nav */}
        <button
          onClick={() => setActiveTab("ai")}
          className={`w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/15 hover:to-purple-500/15 text-indigo-600 dark:text-indigo-400 transition-all ${
            isCollapsed ? "justify-center" : "space-x-3"
          }`}
          title="Open AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400 animate-pulse" />
          {!isCollapsed && (
            <span className="text-[13px] font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Copilot
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
