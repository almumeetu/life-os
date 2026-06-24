import React, { useState } from "react";
import { 
  PlusCircle, BookOpen, GraduationCap, Award, Trash2, Edit, Save, 
  Plus, ChevronRight, CheckCircle2, Sliders, RefreshCw
} from "lucide-react";
import { Skill, LearningItem } from "../types";

interface SkillsLearningHubProps {
  skills: Skill[];
  learning: LearningItem[];
  onSaveSkills: (updated: Skill[]) => void;
  onSaveLearning: (updated: LearningItem[]) => void;
}

export default function SkillsLearningHub({ 
  skills, learning, onSaveSkills, onSaveLearning 
}: SkillsLearningHubProps) {

  const [activeSubTab, setActiveSubTab] = useState<"skills" | "learning">("skills");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form States
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({});
  const [learnForm, setLearnForm] = useState<Partial<LearningItem>>({});
  const [roadmapInput, setRoadmapInput] = useState("");

  const startEditSkill = (s: Skill) => {
    setSkillForm({ ...s });
    setEditingId(s.id);
    setIsAddingNew(false);
  };

  const startAddSkill = () => {
    setSkillForm({ name: "", category: "Technical", level: "Intermediate" });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const startEditLearn = (item: LearningItem) => {
    setLearnForm({ ...item });
    setEditingId(item.id);
    setIsAddingNew(false);
  };

  const startAddLearn = () => {
    setLearnForm({ course: "", technology: "", roadmap: [], progress: 0 });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name) return;

    let updated: Skill[];
    if (isAddingNew) {
      const entry: Skill = {
        id: `sk-${Date.now()}`,
        name: skillForm.name,
        category: skillForm.category || "Technical",
        level: skillForm.level || "Intermediate"
      };
      updated = [...skills, entry];
    } else {
      updated = skills.map(s => s.id === editingId ? { ...s, ...skillForm } as Skill : s);
    }
    onSaveSkills(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteSkill = (id: string) => {
    if (confirm("Delete this skill?")) {
      onSaveSkills(skills.filter(s => s.id !== id));
    }
  };

  const handleAddRoadmap = () => {
    if (!roadmapInput.trim()) return;
    const roadmap = learnForm.roadmap || [];
    setLearnForm(prev => ({ ...prev, roadmap: [...roadmap, roadmapInput.trim()] }));
    setRoadmapInput("");
  };

  const handleRemoveRoadmap = (index: number) => {
    const roadmap = learnForm.roadmap || [];
    setLearnForm(prev => ({ ...prev, roadmap: roadmap.filter((_, idx) => idx !== index) }));
  };

  const handleSaveLearn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnForm.course || !learnForm.technology) return;

    let updated: LearningItem[];
    if (isAddingNew) {
      const entry: LearningItem = {
        id: `lrn-${Date.now()}`,
        course: learnForm.course,
        technology: learnForm.technology,
        roadmap: learnForm.roadmap || [],
        progress: Number(learnForm.progress) || 0
      };
      updated = [...learning, entry];
    } else {
      updated = learning.map(item => item.id === editingId ? { ...item, ...learnForm } as LearningItem : item);
    }
    onSaveLearning(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteLearn = (id: string) => {
    if (confirm("Delete this learning course?")) {
      onSaveLearning(learning.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6" id="skills-learning-hub-pane">
      
      {/* Header controls tab select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2 space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab("skills"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "skills"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Core Skill Matrix
          </button>
          <button
            onClick={() => { setActiveSubTab("learning"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "learning"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Learning Tracker
          </button>
        </div>

        {!editingId && !isAddingNew && (
          <button
            onClick={() => {
              if (activeSubTab === "skills") startAddSkill();
              else startAddLearn();
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all inline-flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {/* 1. SKILLS SUB-TAB */}
      {activeSubTab === "skills" && (
        <div className="space-y-6">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveSkill} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Skill Record" : "Edit Skill Record"}</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Skill Name</label>
                  <input type="text" placeholder="e.g. React.js, Rust, Public Speaking" value={skillForm.name || ""} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Category</label>
                  <select value={skillForm.category || "Technical"} onChange={e => setSkillForm({ ...skillForm, category: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100">
                    <option value="Technical">Technical</option>
                    <option value="Soft">Soft Skill</option>
                    <option value="Language">Language</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Proficiency level</label>
                  <select value={skillForm.level || "Intermediate"} onChange={e => setSkillForm({ ...skillForm, level: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Skill</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Group columns */}
              {["Technical", "Soft", "Language"].map(category => {
                const groupSkills = skills.filter(s => s.category === category);
                return (
                  <div key={category} className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-850 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b pb-2">
                      {category === "Technical" ? "Technical Stack" : category === "Soft" ? "Soft Attributes" : "Languages"}
                    </h3>
                    
                    <div className="space-y-2">
                      {groupSkills.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-4 text-center">No skills catalogued.</p>
                      ) : (
                        groupSkills.map(s => (
                          <div key={s.id} className="p-2.5 bg-white dark:bg-zinc-900 border border-neutral-150 dark:border-zinc-800 rounded-lg flex items-center justify-between group">
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200 truncate">{s.name}</p>
                              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-1 rounded">
                                {s.level}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditSkill(s)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                                <Edit className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteSkill(s.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. LEARNING TRACKER SUB-TAB */}
      {activeSubTab === "learning" && (
        <div className="space-y-4">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveLearn} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Course Record" : "Edit Course Record"}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Course / Syllabus Name</label>
                  <input type="text" value={learnForm.course || ""} onChange={e => setLearnForm({ ...learnForm, course: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Target Technology / Skill</label>
                  <input type="text" value={learnForm.technology || ""} onChange={e => setLearnForm({ ...learnForm, technology: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Completion Progress (%)</label>
                  <input type="number" min="0" max="100" value={learnForm.progress || 0} onChange={e => setLearnForm({ ...learnForm, progress: Number(e.target.value) })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
              </div>

              {/* Roadmap targets */}
              <div className="space-y-2 border-t pt-3">
                <p className="font-bold text-neutral-400">Syllabus Chapters / Milestones</p>
                <div className="space-y-1">
                  {(learnForm.roadmap || []).map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-zinc-850 rounded">
                      <span className="text-[11px]">{ch}</span>
                      <button type="button" onClick={() => handleRemoveRoadmap(idx)} className="text-red-500 hover:underline text-[10px]">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input type="text" placeholder="e.g. React Suspense boundaries masterclass" value={roadmapInput} onChange={e => setRoadmapInput(e.target.value)} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                  <button type="button" onClick={handleAddRoadmap} className="px-3 py-1 bg-neutral-200 dark:bg-zinc-800 rounded font-bold">Add</button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Syllabus</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learning.map(item => (
                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col justify-between hover:shadow-sm transition-all relative group">
                  <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditLearn(item)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteLearn(item.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-800 dark:text-neutral-100">{item.course}</h3>
                        <p className="text-[10px] text-neutral-400">Subject: {item.technology}</p>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between font-semibold text-[10px] text-neutral-400">
                        <span>Progress Bar</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>

                    {/* Check off roadmap milestones */}
                    {item.roadmap.length > 0 && (
                      <div className="border-t border-neutral-100 dark:border-zinc-800 pt-3 space-y-1.5">
                        <p className="font-bold text-neutral-400 text-[10px] uppercase">Syllabus Roadmaps</p>
                        <div className="space-y-1">
                          {item.roadmap.map((chapter, i) => (
                            <div key={i} className="flex items-center space-x-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500/80 shrink-0" />
                              <span className="truncate">{chapter}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
