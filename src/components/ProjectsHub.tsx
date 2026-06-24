import React, { useState } from "react";
import { 
  PlusCircle, Folder, Github, Globe, Trash2, Edit, Save, 
  Plus, X, Laptop, CheckCircle2, RefreshCw, Calendar
} from "lucide-react";
import { Project } from "../types";

interface ProjectsHubProps {
  projects: Project[];
  onSaveProjects: (updated: Project[]) => void;
}

export default function ProjectsHub({ projects, onSaveProjects }: ProjectsHubProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [form, setForm] = useState<Partial<Project>>({});
  const [techInput, setTechInput] = useState("");

  const startEdit = (p: Project) => {
    setForm({ ...p });
    setTechInput("");
    setEditingId(p.id);
    setIsAddingNew(false);
  };

  const startAdd = () => {
    setForm({
      title: "",
      description: "",
      technologies: [],
      githubUrl: "",
      liveUrl: "",
      challenges: "",
      solutions: "",
      features: "",
      futureImprovements: "",
      status: "Planning"
    });
    setTechInput("");
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    const currentTech = form.technologies || [];
    if (!currentTech.includes(techInput.trim())) {
      setForm(prev => ({
        ...prev,
        technologies: [...currentTech, techInput.trim()]
      }));
    }
    setTechInput("");
  };

  const handleRemoveTech = (tech: string) => {
    const currentTech = form.technologies || [];
    setForm(prev => ({
      ...prev,
      technologies: currentTech.filter(t => t !== tech)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    let updated: Project[];
    if (isAddingNew) {
      const newProj: Project = {
        id: `prj-${Date.now()}`,
        title: form.title,
        description: form.description || "",
        technologies: form.technologies || [],
        githubUrl: form.githubUrl || "",
        liveUrl: form.liveUrl || "",
        challenges: form.challenges || "",
        solutions: form.solutions || "",
        features: form.features || "",
        futureImprovements: form.futureImprovements || "",
        status: (form.status as any) || "Planning"
      };
      updated = [...projects, newProj];
    } else {
      updated = projects.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            ...form
          } as Project;
        }
        return p;
      });
    }

    onSaveProjects(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updated = projects.filter(p => p.id !== id);
      onSaveProjects(updated);
    }
  };

  const getStatusStyle = (status: Project["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      case "In Progress":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      default:
        return "bg-neutral-100 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400 border border-neutral-200 dark:border-zinc-700";
    }
  };

  return (
    <div className="space-y-6" id="projects-hub-pane">
      
      {/* Top Banner section */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Engineering Projects Hub</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Document challenges, stack architectures, demo links, and future roadmap features.</p>
        </div>
        {!editingId && !isAddingNew && (
          <button
            onClick={startAdd}
            className="text-xs font-semibold px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all inline-flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Project</span>
          </button>
        )}
      </div>

      {/* Editor/Add Form panel */}
      {(editingId || isAddingNew) && (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 rounded-xl space-y-4 max-w-4xl" id="project-composer-form">
          <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
            {isAddingNew ? "Compose New Project Record" : "Edit Project Details"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Project Title</label>
              <input
                type="text"
                name="title"
                value={form.title || ""}
                onChange={handleTextChange}
                required
                className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Project Status</label>
              <select
                name="status"
                value={form.status || "Planning"}
                onChange={handleTextChange}
                className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-neutral-500">Brief Description</label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleTextChange}
                className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none h-16"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">GitHub Repository Link</label>
              <input
                type="url"
                name="githubUrl"
                value={form.githubUrl || ""}
                onChange={handleTextChange}
                placeholder="https://github.com/..."
                className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Live Demo URL</label>
              <input
                type="url"
                name="liveUrl"
                value={form.liveUrl || ""}
                onChange={handleTextChange}
                placeholder="https://..."
                className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none"
              />
            </div>

            {/* Custom tag inputs */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-neutral-500">Technologies Used</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {(form.technologies || []).map(t => (
                  <span key={t} className="px-2 py-0.5 bg-neutral-100 dark:bg-zinc-800 rounded flex items-center space-x-1 text-[10px]">
                    <span>{t}</span>
                    <button type="button" onClick={() => handleRemoveTech(t)} className="text-neutral-400 hover:text-neutral-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Web Sockets"
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  className="p-1.5 border border-neutral-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-850"
                />
                <button type="button" onClick={handleAddTech} className="px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 rounded font-bold">
                  Add Tech
                </button>
              </div>
            </div>

            {/* In-depth study fields */}
            <div className="space-y-1 md:col-span-2 pt-2 border-t border-neutral-100 dark:border-zinc-800">
              <p className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider mb-2">Case Study Deep-Dive</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-500">Primary Challenges Faced</label>
                  <textarea
                    name="challenges"
                    value={form.challenges || ""}
                    onChange={handleTextChange}
                    className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none h-20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-500">Engineered Solutions</label>
                  <textarea
                    name="solutions"
                    value={form.solutions || ""}
                    onChange={handleTextChange}
                    className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none h-20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-500">Key Features</label>
                  <textarea
                    name="features"
                    value={form.features || ""}
                    onChange={handleTextChange}
                    className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none h-20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-500">Future Improvements</label>
                  <textarea
                    name="futureImprovements"
                    value={form.futureImprovements || ""}
                    onChange={handleTextChange}
                    className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-850 rounded text-neutral-800 dark:text-neutral-100 outline-none h-20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-neutral-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => { setEditingId(null); setIsAddingNew(false); }}
              className="text-xs font-semibold px-3 py-1.5 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 text-neutral-500 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-semibold px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
            >
              Save Project Record
            </button>
          </div>
        </form>
      )}

      {/* Grid view of projects */}
      {!editingId && !isAddingNew && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="projects-list-grid">
          {projects.map(p => (
            <div key={p.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all group relative">
              <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                <button
                  onClick={() => startEdit(p)}
                  className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-zinc-850 rounded"
                  title="Edit details"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-zinc-850 rounded"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{p.title}</h3>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed line-clamp-3">
                  {p.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {p.technologies.map(t => (
                    <span key={t} className="text-[9px] font-medium bg-neutral-50 dark:bg-zinc-850 text-neutral-500 dark:text-zinc-400 border border-neutral-150 dark:border-zinc-800 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extended Case Study expand / summaries info */}
              <div className="border-t border-neutral-100 dark:border-zinc-800 mt-4 pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-indigo-600">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {(p.challenges || p.solutions) && (
                  <span className="text-[10px] bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded font-mono">
                    Case Study Included
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
