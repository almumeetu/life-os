import React, { useState, useEffect } from "react";
import { Sparkles, Key, FileText, Search, User, LogOut, Clock, Compass } from "lucide-react";

import { INITIAL_LIFE_OS_STATE } from "./initialData";
import { LifeOSState, AIChatMessage, Resume, Project, Note, Contact, PersonalProfile, CareerExperience, EducationEntry, Certification, Skill, LearningItem, FreelancingHub, VaultDocument, EncryptedPassword, JobApplication, Goal, BankInfo, Subscription } from "./types";

// Import hub views
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import DashboardOverview from "./components/DashboardOverview";
import ProfileHub from "./components/ProfileHub";
import ResumeHub from "./components/ResumeHub";
import ProjectsHub from "./components/ProjectsHub";
import CareerEducationHub from "./components/CareerEducationHub";
import SkillsLearningHub from "./components/SkillsLearningHub";
import FreelancingHubView from "./components/FreelancingHubView";
import VaultHubView from "./components/VaultHubView";
import JobApplicationsHub from "./components/JobApplicationsHub";
import GoalsHub from "./components/GoalsHub";
import NotesContactsHub from "./components/NotesContactsHub";
import AIAssistantView from "./components/AIAssistantView";

const LOCAL_STORAGE_KEY = "life_os_vault_state";

export default function App() {
  const [state, setState] = useState<LifeOSState>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure necessary backports exist
        if (parsed.profile) return parsed as LifeOSState;
      } catch (e) {
        console.error("Failed to parse cached Life OS state", e);
      }
    }
    return INITIAL_LIFE_OS_STATE;
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const cachedTheme = localStorage.getItem("life_os_theme");
    return cachedTheme === "dark" || (!cachedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Time & date indicators
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save state to localstorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply dark mode classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("life_os_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("life_os_theme", "light");
    }
  }, [darkMode]);

  // Listen for global command palette trigger (Command+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Central logging system
  const logActivity = (module: string, action: string, details: string) => {
    const newLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      module,
      action,
      details
    };
    setState(prev => ({
      ...prev,
      activity: [newLog, ...prev.activity].slice(0, 50) // Cache up to 50 logs
    }));
  };

  // State saving utilities
  const handleSaveProfile = (updated: PersonalProfile) => {
    setState(prev => ({ ...prev, profile: updated }));
    logActivity("Profile", "Updated", "Personal details and identity metadata updated");
  };

  const handleSaveResumes = (updated: Resume[]) => {
    setState(prev => ({ ...prev, resumes: updated }));
    logActivity("Resumes", "Updated", "Resume portfolio and CV configurations modified");
  };

  const handleSaveCaseStudies = (updated: any[]) => {
    setState(prev => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        caseStudies: updated
      }
    }));
    logActivity("Portfolio", "Case Study Mod", "Project case study profiles updated");
  };

  const handleSaveProjects = (updated: Project[]) => {
    setState(prev => ({ ...prev, projects: updated }));
    logActivity("Projects", "Save", "Engineering projects and source codes catalogs updated");
  };

  const handleSaveCareer = (updated: CareerExperience[]) => {
    setState(prev => ({ ...prev, career: updated }));
    logActivity("Career", "Updated", "Professional experience chronology updated");
  };

  const handleSaveEducation = (updated: EducationEntry[]) => {
    setState(prev => ({ ...prev, education: updated }));
    logActivity("Education", "Updated", "Education background and transcript logs updated");
  };

  const handleSaveCertifications = (updated: Certification[]) => {
    setState(prev => ({ ...prev, certifications: updated }));
    logActivity("Certifications", "Save", "Professional certifications catalog modified");
  };

  const handleSaveSkills = (updated: Skill[]) => {
    setState(prev => ({ ...prev, skills: updated }));
    logActivity("Skills", "Updated", "Core skills parameters and classification levels refreshed");
  };

  const handleSaveLearning = (updated: LearningItem[]) => {
    setState(prev => ({ ...prev, learning: updated }));
    logActivity("Learning", "Save", "Online course learning roadmaps updated");
  };

  const handleSaveFreelancing = (updated: FreelancingHub) => {
    setState(prev => ({ ...prev, freelancing: updated }));
    logActivity("Freelancing", "Updated", "Freelance links, proposals, and contracts adjusted");
  };

  const handleSaveDocuments = (updated: VaultDocument[]) => {
    setState(prev => ({ ...prev, vaultDocuments: updated }));
    logActivity("Vault Docs", "Uploaded", "National documents vault updated");
  };

  const handleSavePasswords = (updated: EncryptedPassword[]) => {
    setState(prev => ({ ...prev, encryptedPasswords: updated }));
    logActivity("Vault Pass", "Encrypted", "AES-GCM credentials vaults updated");
  };

  const handleSaveApplications = (updated: JobApplication[]) => {
    setState(prev => ({ ...prev, applications: updated }));
    logActivity("Applications", "Save", "Job hunting tracking pipeline updated");
  };

  const handleSaveGoals = (updated: Goal[]) => {
    setState(prev => ({ ...prev, goals: updated }));
    logActivity("Goals", "Updated", "Target checklist visions updated");
  };

  const handleSaveNotes = (updated: Note[]) => {
    setState(prev => ({ ...prev, notes: updated }));
    logActivity("Notes", "Save", "Notion Markdown notes system saved");
  };

  const handleSaveContacts = (updated: Contact[]) => {
    setState(prev => ({ ...prev, contacts: updated }));
    logActivity("Contacts", "Save", "Directories and rescue contacts updated");
  };

  const handleSaveAssets = (updated: any[]) => {
    setState(prev => ({ ...prev, assets: updated }));
    logActivity("Assets", "Updated", "Equipment asset registers modified");
  };

  const handleSaveBanks = (updated: BankInfo[]) => {
    setState(prev => ({ ...prev, banks: updated }));
    logActivity("Finance", "Save", "Bank checking and routing profiles saved");
  };

  const handleSaveSubscriptions = (updated: Subscription[]) => {
    setState(prev => ({ ...prev, subscriptions: updated }));
    logActivity("Finance", "Save", "SaaS subscriptions monitoring updated");
  };

  const handleSaveMessages = (updated: AIChatMessage[]) => {
    setState(prev => ({ ...prev, aiSessionMessages: updated }));
  };

  const handleImportDatabase = (imported: LifeOSState) => {
    setState(imported);
    logActivity("System", "Restore", "Life OS state database restored from backup file");
  };

  const handleResetDatabase = () => {
    setState(INITIAL_LIFE_OS_STATE);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    logActivity("System", "Reset", "Life OS database reset to factory presets");
    setActiveTab("overview");
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardOverview 
            state={state} 
            onNavigate={setActiveTab} 
            onImportData={handleImportDatabase}
            onResetData={handleResetDatabase}
          />
        );
      case "profile":
        return <ProfileHub profile={state.profile} onSaveProfile={handleSaveProfile} />;
      case "resumes":
        return (
          <ResumeHub 
            state={state} 
            onSaveResumes={handleSaveResumes} 
            onSaveCaseStudies={handleSaveCaseStudies} 
          />
        );
      case "projects":
        return <ProjectsHub projects={state.projects} onSaveProjects={handleSaveProjects} />;
      case "career":
        return (
          <CareerEducationHub 
            career={state.career} 
            education={state.education} 
            certifications={state.certifications} 
            onSaveCareer={handleSaveCareer}
            onSaveEducation={handleSaveEducation}
            onSaveCertifications={handleSaveCertifications}
          />
        );
      case "skills":
        return (
          <SkillsLearningHub 
            skills={state.skills} 
            learning={state.learning} 
            onSaveSkills={handleSaveSkills} 
            onSaveLearning={handleSaveLearning} 
          />
        );
      case "freelancing":
        return <FreelancingHubView freelancing={state.freelancing} onSaveFreelancing={handleSaveFreelancing} />;
      case "documents":
        return (
          <VaultHubView 
            documents={state.vaultDocuments || []} 
            passwords={state.encryptedPasswords || []} 
            onSaveDocuments={handleSaveDocuments} 
            onSavePasswords={handleSavePasswords} 
          />
        );
      case "applications":
        return <JobApplicationsHub applications={state.applications} onSaveApplications={handleSaveApplications} />;
      case "goals":
        return <GoalsHub goals={state.goals} onSaveGoals={handleSaveGoals} />;
      case "notes":
        return (
          <NotesContactsHub 
            notes={state.notes} 
            contacts={state.contacts} 
            onSaveNotes={handleSaveNotes} 
            onSaveContacts={handleSaveContacts} 
          />
        );
      case "contacts":
        // Maps nicely via component tab parameters
        return (
          <NotesContactsHub 
            notes={state.notes} 
            contacts={state.contacts} 
            onSaveNotes={handleSaveNotes} 
            onSaveContacts={handleSaveContacts} 
          />
        );
      case "passwords":
        return (
          <VaultHubView 
            documents={state.vaultDocuments || []} 
            passwords={state.encryptedPasswords || []} 
            onSaveDocuments={handleSaveDocuments} 
            onSavePasswords={handleSavePasswords} 
          />
        );
      case "ai":
        return <AIAssistantView state={state} onSaveMessages={handleSaveMessages} />;
      default:
        return (
          <div className="text-center py-24 text-neutral-400 text-xs font-semibold">
            Module view is offline. Navigate to another panel.
          </div>
        );
    }
  };

  const getBreadcrumbTitle = () => {
    const mapping: Record<string, string> = {
      overview: "Operations Dashboard",
      profile: "Personal Identity & Accounts",
      resumes: "Resumes & Portfolios Builder",
      projects: "Engineering Projects Vault",
      career: "Career experience & Academic history",
      skills: "Skills categorization & Course progress",
      freelancing: "Freelance Gig portals & proposals",
      documents: "Scans & credentials Vault",
      applications: "Active Job hunting applications",
      goals: "Goals checklists & milestones",
      notes: "Notion Markdown journal",
      contacts: "Contacts list & professional directory",
      passwords: "Client-side encrypted Safe",
      ai: "AI Copilot advising loop"
    };
    return mapping[activeTab] || "Workspace";
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-zinc-950 font-sans transition-colors duration-300 overflow-hidden select-none" id="lifeos-root-frame">
      
      {/* Search command palette overlay */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        state={state} 
        onNavigate={(tabId) => {
          setActiveTab(tabId);
        }}
      />

      {/* Main navigation sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Primary content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Dynamic header navigation */}
        <header className="h-14 border-b border-neutral-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-400 dark:text-zinc-500 font-medium">Life OS</span>
            <span className="text-neutral-300 dark:text-zinc-700">/</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
              {getBreadcrumbTitle()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Clock indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono font-medium text-neutral-400 border border-neutral-100 dark:border-zinc-900 bg-neutral-50/50 dark:bg-zinc-950 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {/* Global Search shortcut block */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center space-x-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-300 transition-colors p-1.5 rounded-lg border border-neutral-200/80 dark:border-zinc-900 bg-neutral-50/30 text-xs shrink-0"
              title="Search command palette"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Vault Search (⌘K)</span>
            </button>

            {/* Profile capsule */}
            <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-zinc-900 border border-neutral-150 dark:border-zinc-800 p-1 rounded-full text-xs">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                {state.profile.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="hidden md:inline font-semibold text-neutral-700 dark:text-neutral-200 pr-2">
                {state.profile.nickname}
              </span>
            </div>
          </div>
        </header>

        {/* Scaled view-wrapper with scroll locks */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-zinc-950 focus:outline-none">
          <div className="max-w-7xl mx-auto h-full">
            {renderActiveView()}
          </div>
        </main>

      </div>

    </div>
  );
}
