import React, { useState } from "react";
import { 
  PlusCircle, Trash2, Printer, Share2, Clipboard, Edit, Link2, 
  ExternalLink, FileText, CheckCircle2, ChevronRight, UserCircle2
} from "lucide-react";
import { LifeOSState, Resume, CaseStudy } from "../types";

interface ResumeHubProps {
  state: LifeOSState;
  onSaveResumes: (updated: Resume[]) => void;
  onSaveCaseStudies: (updated: CaseStudy[]) => void;
}

export default function ResumeHub({ state, onSaveResumes, onSaveCaseStudies }: ResumeHubProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(state.resumes[0]?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [selectedExp, setSelectedExp] = useState<string[]>([]);
  const [selectedEdu, setSelectedEdu] = useState<string[]>([]);
  const [selectedSkl, setSelectedSkl] = useState<string[]>([]);
  const [selectedPrj, setSelectedPrj] = useState<string[]>([]);

  // Case study states
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseChallenge, setNewCaseChallenge] = useState("");
  const [newCaseSolution, setNewCaseSolution] = useState("");
  const [newCaseResults, setNewCaseResults] = useState("");

  const activeResume = state.resumes.find(r => r.id === selectedResumeId);

  const startEdit = () => {
    if (!activeResume) return;
    setEditTitle(activeResume.title);
    setEditSummary(activeResume.summary);
    setSelectedExp(activeResume.experienceIds);
    setSelectedEdu(activeResume.educationIds);
    setSelectedSkl(activeResume.skillIds);
    setSelectedPrj(activeResume.projectIds);
    setIsEditing(true);
  };

  const handleCreateResume = () => {
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      title: "New Custom Career Profile",
      summary: "Add a concise professional statement detailing your goals and primary skills here...",
      experienceIds: state.career.map(c => c.id),
      educationIds: state.education.map(e => e.id),
      skillIds: state.skills.slice(0, 4).map(s => s.id),
      projectIds: state.projects.map(p => p.id),
      customSections: []
    };
    const updated = [...state.resumes, newResume];
    onSaveResumes(updated);
    setSelectedResumeId(newResume.id);
  };

  const handleDeleteResume = (id: string) => {
    if (state.resumes.length <= 1) {
      alert("You must keep at least one CV profile in your vault.");
      return;
    }
    const updated = state.resumes.filter(r => r.id !== id);
    onSaveResumes(updated);
    setSelectedResumeId(updated[0].id);
  };

  const handleSave = () => {
    if (!activeResume) return;
    const updatedResumes = state.resumes.map(r => {
      if (r.id === selectedResumeId) {
        return {
          ...r,
          title: editTitle,
          summary: editSummary,
          experienceIds: selectedExp,
          educationIds: selectedEdu,
          skillIds: selectedSkl,
          projectIds: selectedPrj,
        };
      }
      return r;
    });
    onSaveResumes(updatedResumes);
    setIsEditing(false);
  };

  const handleAddCaseStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle) return;
    const study: CaseStudy = {
      title: newCaseTitle,
      challenge: newCaseChallenge,
      solution: newCaseSolution,
      results: newCaseResults
    };
    onSaveCaseStudies([...state.portfolio.caseStudies, study]);
    setNewCaseTitle("");
    setNewCaseChallenge("");
    setNewCaseSolution("");
    setNewCaseResults("");
  };

  const handleRemoveCaseStudy = (index: number) => {
    const updated = [...state.portfolio.caseStudies];
    updated.splice(index, 1);
    onSaveCaseStudies(updated);
  };

  const handleShare = () => {
    const mockUrl = `${window.location.origin}/share/resume/${selectedResumeId}`;
    navigator.clipboard.writeText(mockUrl);
    alert(`Public share URL generated and copied to clipboard:\n${mockUrl}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="resume-hub-pane">
      
      {/* Left Column: CV Selector & Editor Controls & Portfolio URLs */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">CV Versions</h2>
            <button onClick={handleCreateResume} className="text-indigo-600 dark:text-indigo-400 p-1 hover:bg-indigo-50 dark:hover:bg-zinc-800 rounded-md">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {state.resumes.map(r => (
              <div 
                key={r.id} 
                onClick={() => { setSelectedResumeId(r.id); setIsEditing(false); }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between group ${
                  selectedResumeId === r.id 
                    ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" 
                    : "border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <FileText className={`w-4 h-4 shrink-0 ${selectedResumeId === r.id ? "text-indigo-600" : "text-neutral-400"}`} />
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">{r.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id); }}
                  className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete version"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Portfolio Management</h2>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-neutral-400">Primary Portfolio Link</p>
              <a href={state.portfolio.url} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-indigo-600 hover:underline">
                <span>{state.portfolio.url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-neutral-400">Live Demo Portal</p>
              <a href={state.portfolio.liveDemoUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-indigo-600 hover:underline">
                <span>{state.portfolio.liveDemoUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-zinc-800 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Project Case Studies</h3>
            
            {/* List Case Studies */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {state.portfolio.caseStudies.map((study, idx) => (
                <div key={idx} className="p-2.5 bg-neutral-50/50 dark:bg-zinc-900/50 rounded-lg border border-neutral-150 dark:border-zinc-800 relative group">
                  <button 
                    onClick={() => handleRemoveCaseStudy(idx)}
                    className="absolute top-2 right-2 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{study.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">{study.challenge}</p>
                </div>
              ))}
            </div>

            {/* Add Case Study Form */}
            <form onSubmit={handleAddCaseStudy} className="space-y-2 bg-neutral-50/20 dark:bg-zinc-950/20 p-3 rounded-lg border border-neutral-150 dark:border-zinc-800 text-xs">
              <input 
                type="text" 
                placeholder="Case Study Title" 
                value={newCaseTitle} 
                onChange={e => setNewCaseTitle(e.target.value)}
                required
                className="w-full p-2 text-xs rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              />
              <textarea 
                placeholder="The Challenge" 
                value={newCaseChallenge} 
                onChange={e => setNewCaseChallenge(e.target.value)}
                className="w-full p-2 text-xs rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14"
              />
              <textarea 
                placeholder="The Solution" 
                value={newCaseSolution} 
                onChange={e => setNewCaseSolution(e.target.value)}
                className="w-full p-2 text-xs rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14"
              />
              <textarea 
                placeholder="The Results" 
                value={newCaseResults} 
                onChange={e => setNewCaseResults(e.target.value)}
                className="w-full p-2 text-xs rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14"
              />
              <button type="submit" className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold">
                Add Case Study
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: CV Preview Sheet / Print View & Composition Editor */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Action Controls toolbar */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Variant:</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{activeResume?.title}</span>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={startEdit}
                  className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Customize CV Links</span>
                </button>
                <button
                  onClick={handleShare}
                  className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all flex items-center space-x-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Profile</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / PDF</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold px-3 py-1.5 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 text-neutral-500 rounded-lg transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="text-xs font-semibold px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                >
                  Save Composition
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Composition Editor */}
        {isEditing && activeResume && (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-neutral-700 dark:text-neutral-300">Composition Manager</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">CV Variant Title</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Professional Summary</label>
                <textarea 
                  value={editSummary} 
                  onChange={e => setEditSummary(e.target.value)}
                  className="w-full p-2 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded h-20"
                />
              </div>

              {/* Link items checkboxes */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <p className="font-bold text-neutral-400">Include Experience</p>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto border p-1 rounded">
                    {state.career.map(c => (
                      <label key={c.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedExp.includes(c.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedExp([...selectedExp, c.id]);
                            else setSelectedExp(selectedExp.filter(id => id !== c.id));
                          }}
                        />
                        <span>{c.company}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-neutral-400">Include Education</p>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto border p-1 rounded">
                    {state.education.map(edu => (
                      <label key={edu.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedEdu.includes(edu.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedEdu([...selectedEdu, edu.id]);
                            else setSelectedEdu(selectedEdu.filter(id => id !== edu.id));
                          }}
                        />
                        <span>{edu.school}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-neutral-400">Include Skills</p>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto border p-1 rounded">
                    {state.skills.map(sk => (
                      <label key={sk.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSkl.includes(sk.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedSkl([...selectedSkl, sk.id]);
                            else setSelectedSkl(selectedSkl.filter(id => id !== sk.id));
                          }}
                        />
                        <span>{sk.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-neutral-400">Include Projects</p>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto border p-1 rounded">
                    {state.projects.map(p => (
                      <label key={p.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPrj.includes(p.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedPrj([...selectedPrj, p.id]);
                            else setSelectedPrj(selectedPrj.filter(id => id !== p.id));
                          }}
                        />
                        <span>{p.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real paper-styled cv layout sheet (Printable & Styled) */}
        {activeResume && (
          <div 
            className="bg-white text-zinc-900 border border-neutral-300 shadow-xl rounded-xl p-8 max-w-3xl mx-auto space-y-6 select-text text-left print:shadow-none print:border-none print:p-0"
            id="printable-cv-sheet"
          >
            {/* Print Head */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-zinc-900 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight font-serif uppercase text-zinc-900">
                  {state.profile.fullName}
                </h1>
                <p className="text-sm text-zinc-600 font-medium">{activeResume.title}</p>
              </div>
              <div className="text-xs text-zinc-500 font-mono text-left md:text-right mt-2 md:mt-0">
                <p>{state.profile.email}</p>
                <p>{state.profile.phone}</p>
                <p>{state.profile.address}</p>
                <p>{state.profile.website}</p>
              </div>
            </div>

            {/* Profile summary */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-200 pb-1 font-serif">
                Professional Profile
              </h2>
              <p className="text-xs text-zinc-700 leading-relaxed font-sans">{activeResume.summary}</p>
            </div>

            {/* Work experience */}
            {activeResume.experienceIds.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-200 pb-1 font-serif">
                  Work Milestones
                </h2>
                <div className="space-y-3">
                  {state.career
                    .filter(c => activeResume.experienceIds.includes(c.id))
                    .map(exp => (
                      <div key={exp.id} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="font-bold text-zinc-800">{exp.designation} at {exp.company}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-600 text-[11px]">
                          {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Featured Projects */}
            {activeResume.projectIds.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-200 pb-1 font-serif">
                  Featured Engineering Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {state.projects
                    .filter(p => activeResume.projectIds.includes(p.id))
                    .map(prj => (
                      <div key={prj.id} className="text-xs border border-zinc-150 p-2.5 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-800">{prj.title}</span>
                          <span className="text-[10px] bg-zinc-100 px-1 rounded text-zinc-500 font-mono">{prj.status}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-1">{prj.description}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">Stack: {prj.technologies.join(", ")}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {activeResume.skillIds.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-200 pb-1 font-serif">
                  Core Technologies & Proficiencies
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {state.skills
                    .filter(sk => activeResume.skillIds.includes(sk.id))
                    .map(sk => (
                      <span key={sk.id} className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 font-medium">
                        {sk.name} • {sk.level}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Education */}
            {activeResume.educationIds.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-200 pb-1 font-serif">
                  Academic History
                </h2>
                {state.education
                  .filter(edu => activeResume.educationIds.includes(edu.id))
                  .map(edu => (
                    <div key={edu.id} className="text-xs flex justify-between">
                      <div>
                        <p className="font-bold text-zinc-800">{edu.degree}</p>
                        <p className="text-zinc-600 text-[11px]">{edu.school} (GPA: {edu.gpa})</p>
                      </div>
                      <span className="text-zinc-500 font-mono text-[10px]">{edu.startDate} — {edu.endDate}</span>
                    </div>
                  ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
