import React, { useState } from "react";
import { 
  PlusCircle, Briefcase, GraduationCap, Award, Trash2, Edit, Save, 
  Plus, Calendar, Coins, CheckCircle2, ChevronRight
} from "lucide-react";
import { CareerExperience, EducationEntry, Certification } from "../types";

interface CareerEducationHubProps {
  career: CareerExperience[];
  education: EducationEntry[];
  certifications: Certification[];
  onSaveCareer: (updated: CareerExperience[]) => void;
  onSaveEducation: (updated: EducationEntry[]) => void;
  onSaveCertifications: (updated: Certification[]) => void;
}

export default function CareerEducationHub({ 
  career, education, certifications, 
  onSaveCareer, onSaveEducation, onSaveCertifications 
}: CareerEducationHubProps) {

  const [activeSubTab, setActiveSubTab] = useState<"career" | "education" | "certs">("career");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form States
  const [careerForm, setCareerForm] = useState<Partial<CareerExperience>>({});
  const [eduForm, setEduForm] = useState<Partial<EducationEntry>>({});
  const [certForm, setCertForm] = useState<Partial<Certification>>({});
  
  const [bulletInput, setBulletInput] = useState("");

  const startEditCareer = (exp: CareerExperience) => {
    setCareerForm({ ...exp });
    setEditingId(exp.id);
    setIsAddingNew(false);
  };

  const startAddCareer = () => {
    setCareerForm({ company: "", designation: "", startDate: "", endDate: "", current: false, salary: "", achievements: [] });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const startEditEdu = (edu: EducationEntry) => {
    setEduForm({ ...edu });
    setEditingId(edu.id);
    setIsAddingNew(false);
  };

  const startAddEdu = () => {
    setEduForm({ school: "", degree: "", gpa: "", startDate: "", endDate: "", certificates: [], transcripts: [] });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const startEditCert = (cert: Certification) => {
    setCertForm({ ...cert });
    setEditingId(cert.id);
    setIsAddingNew(false);
  };

  const startAddCert = () => {
    setCertForm({ name: "", issuer: "", credentialUrl: "", expiryDate: "" });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleAddBullet = () => {
    if (!bulletInput.trim()) return;
    const bullets = careerForm.achievements || [];
    setCareerForm(prev => ({ ...prev, achievements: [...bullets, bulletInput.trim()] }));
    setBulletInput("");
  };

  const handleRemoveBullet = (index: number) => {
    const bullets = careerForm.achievements || [];
    setCareerForm(prev => ({ ...prev, achievements: bullets.filter((_, idx) => idx !== index) }));
  };

  const handleSaveCareer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerForm.company || !careerForm.designation) return;

    let updated: CareerExperience[];
    if (isAddingNew) {
      const entry: CareerExperience = {
        id: `exp-${Date.now()}`,
        company: careerForm.company,
        designation: careerForm.designation,
        startDate: careerForm.startDate || "",
        endDate: careerForm.current ? "Present" : careerForm.endDate || "",
        current: careerForm.current || false,
        salary: careerForm.salary || "",
        achievements: careerForm.achievements || []
      };
      updated = [...career, entry];
    } else {
      updated = career.map(c => c.id === editingId ? { ...c, ...careerForm } as CareerExperience : c);
    }
    onSaveCareer(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteCareer = (id: string) => {
    if (confirm("Delete this career milestone?")) {
      onSaveCareer(career.filter(c => c.id !== id));
    }
  };

  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.school || !eduForm.degree) return;

    let updated: EducationEntry[];
    if (isAddingNew) {
      const entry: EducationEntry = {
        id: `edu-${Date.now()}`,
        school: eduForm.school,
        degree: eduForm.degree,
        gpa: eduForm.gpa || "",
        startDate: eduForm.startDate || "",
        endDate: eduForm.endDate || "",
        certificates: eduForm.certificates || [],
        transcripts: []
      };
      updated = [...education, entry];
    } else {
      updated = education.map(edu => edu.id === editingId ? { ...edu, ...eduForm } as EducationEntry : edu);
    }
    onSaveEducation(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteEdu = (id: string) => {
    if (confirm("Delete this educational milestone?")) {
      onSaveEducation(education.filter(edu => edu.id !== id));
    }
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.name || !certForm.issuer) return;

    let updated: Certification[];
    if (isAddingNew) {
      const entry: Certification = {
        id: `cert-${Date.now()}`,
        name: certForm.name,
        issuer: certForm.issuer,
        credentialUrl: certForm.credentialUrl || "",
        expiryDate: certForm.expiryDate || ""
      };
      updated = [...certifications, entry];
    } else {
      updated = certifications.map(c => c.id === editingId ? { ...c, ...certForm } as Certification : c);
    }
    onSaveCertifications(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteCert = (id: string) => {
    if (confirm("Delete this certification?")) {
      onSaveCertifications(certifications.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6" id="career-education-hub-pane">
      
      {/* Tab select header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2 space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab("career"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "career"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Work Milestones
          </button>
          <button
            onClick={() => { setActiveSubTab("education"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "education"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Academic History
          </button>
          <button
            onClick={() => { setActiveSubTab("certs"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "certs"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Certifications Hub
          </button>
        </div>

        {!editingId && !isAddingNew && (
          <button
            onClick={() => {
              if (activeSubTab === "career") startAddCareer();
              else if (activeSubTab === "education") startAddEdu();
              else startAddCert();
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all inline-flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {/* 1. CAREER SUB-TAB */}
      {activeSubTab === "career" && (
        <div className="space-y-4">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveCareer} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Experience Node" : "Edit Experience Node"}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Company Name</label>
                  <input type="text" value={careerForm.company || ""} onChange={e => setCareerForm({ ...careerForm, company: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Designation / Role</label>
                  <input type="text" value={careerForm.designation || ""} onChange={e => setCareerForm({ ...careerForm, designation: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Start Date</label>
                  <input type="month" value={careerForm.startDate || ""} onChange={e => setCareerForm({ ...careerForm, startDate: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">End Date</label>
                  <input type="month" value={careerForm.endDate || ""} onChange={e => setCareerForm({ ...careerForm, endDate: e.target.value })} disabled={careerForm.current} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded disabled:opacity-50" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Salary Package / Rate</label>
                  <input type="text" placeholder="e.g. $145,000 / yr" value={careerForm.salary || ""} onChange={e => setCareerForm({ ...careerForm, salary: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="flex items-center space-x-2 pt-5">
                  <input type="checkbox" id="current" checked={careerForm.current || false} onChange={e => setCareerForm({ ...careerForm, current: e.target.checked })} />
                  <label htmlFor="current" className="font-semibold text-neutral-500">Currently Employed Here</label>
                </div>
              </div>

              {/* Achievements Bullets */}
              <div className="space-y-2 border-t pt-3">
                <p className="font-bold text-neutral-400">Achievements / Bullet Points</p>
                <div className="space-y-1">
                  {(careerForm.achievements || []).map((ach, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-zinc-850 rounded">
                      <span className="text-[11px]">{ach}</span>
                      <button type="button" onClick={() => handleRemoveBullet(idx)} className="text-red-500 hover:underline text-[10px]">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input type="text" placeholder="Describe core milestone or result..." value={bulletInput} onChange={e => setBulletInput(e.target.value)} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                  <button type="button" onClick={handleAddBullet} className="px-3 py-1 bg-neutral-200 dark:bg-zinc-800 rounded font-bold">Add</button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Milestone</button>
              </div>
            </form>
          ) : (
            <div className="relative border-l-2 border-neutral-200 dark:border-zinc-800 ml-4 pl-6 space-y-6">
              {career.map(exp => (
                <div key={exp.id} className="relative group" id={`career-node-${exp.id}`}>
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  </div>

                  <div className="absolute top-1 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditCareer(exp)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCareer(exp.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{exp.designation}</h3>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">@ {exp.company}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] text-neutral-400 font-mono">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                      {exp.salary && <span className="flex items-center"><Coins className="w-3 h-3 mr-1" /> {exp.salary}</span>}
                    </div>

                    <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-600 dark:text-neutral-400 pt-1.5">
                      {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. EDUCATION SUB-TAB */}
      {activeSubTab === "education" && (
        <div className="space-y-4">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveEdu} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Education Milestone" : "Edit Education Milestone"}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">School / College / University</label>
                  <input type="text" value={eduForm.school || ""} onChange={e => setEduForm({ ...eduForm, school: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Degree / Focus Area</label>
                  <input type="text" value={eduForm.degree || ""} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Cumulative GPA</label>
                  <input type="text" placeholder="e.g. 3.8 / 4.0" value={eduForm.gpa || ""} onChange={e => setEduForm({ ...eduForm, gpa: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Graduation Year / Timeline</label>
                  <input type="text" placeholder="e.g. 2017 - 2021" value={eduForm.endDate || ""} onChange={e => setEduForm({ ...eduForm, endDate: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Education</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {education.map(edu => (
                <div key={edu.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between group relative">
                  <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditEdu(edu)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteEdu(edu.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{edu.degree}</h3>
                        <p className="text-[10px] text-neutral-400">{edu.school}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-neutral-100 dark:border-zinc-800">
                      <div>
                        <p className="text-neutral-400">Timeline</p>
                        <p className="font-semibold text-neutral-600 dark:text-neutral-350">{edu.endDate}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Score GPA</p>
                        <p className="font-semibold text-neutral-600 dark:text-neutral-350">{edu.gpa || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CERTIFICATIONS SUB-TAB */}
      {activeSubTab === "certs" && (
        <div className="space-y-4">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveCert} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Certification Entry" : "Edit Certification Entry"}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Certificate Name</label>
                  <input type="text" value={certForm.name || ""} onChange={e => setCertForm({ ...certForm, name: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Issuing Organisation</label>
                  <input type="text" value={certForm.issuer || ""} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Credential Verification URL</label>
                  <input type="url" placeholder="https://..." value={certForm.credentialUrl || ""} onChange={e => setCertForm({ ...certForm, credentialUrl: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Expiration Date (Optional)</label>
                  <input type="month" value={certForm.expiryDate || ""} onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Certificate</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map(c => (
                <div key={c.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between group relative">
                  <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditCert(c)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteCert(c.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{c.name}</h3>
                        <p className="text-[10px] text-neutral-400">Issuer: {c.issuer}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-2 border-t border-neutral-100 dark:border-zinc-800 font-mono text-neutral-400">
                      <span>Expires: {c.expiryDate || "Never"}</span>
                      {c.credentialUrl && (
                        <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center">
                          Verify Credentials <ChevronRight className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
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
