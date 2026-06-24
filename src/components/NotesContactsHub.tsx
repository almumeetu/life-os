import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  PlusCircle, FolderClosed, FileText, UserPlus, Phone, Mail, MapPin, 
  Trash2, Edit, Save, Plus, Eye, Code, Search, User, Briefcase
} from "lucide-react";
import { Note, Contact } from "../types";

interface NotesContactsHubProps {
  notes: Note[];
  contacts: Contact[];
  onSaveNotes: (updated: Note[]) => void;
  onSaveContacts: (updated: Contact[]) => void;
}

export default function NotesContactsHub({ 
  notes, contacts, onSaveNotes, onSaveContacts 
}: NotesContactsHubProps) {

  const [activeTab, setActiveTab] = useState<"notes" | "contacts">("notes");
  
  // Note states
  const [selectedFolder, setSelectedFolder] = useState<Note["folder"]>("Professional");
  const [activeNoteId, setActiveNoteId] = useState<string>(notes.find(n => n.folder === "Professional")?.id || "");
  const [isNoteEditing, setIsNoteEditing] = useState(false);
  const [noteEditTitle, setNoteEditTitle] = useState("");
  const [noteEditContent, setNoteEditContent] = useState("");
  const [noteEditFolder, setNoteEditFolder] = useState<Note["folder"]>("Professional");

  // Contact states
  const [contactSearch, setContactSearch] = useState("");
  const [contactCategory, setContactCategory] = useState<Contact["category"] | "All">("All");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactForm, setContactForm] = useState<Partial<Contact>>({ name: "", email: "", phone: "", designation: "", company: "", category: "Colleague" });

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Markdown Render vs Editor Toggle
  const [notePreviewMode, setNotePreviewMode] = useState<"edit" | "preview">("preview");

  const startEditNote = () => {
    if (!activeNote) return;
    setNoteEditTitle(activeNote.title);
    setNoteEditContent(activeNote.content);
    setNoteEditFolder(activeNote.folder);
    setIsNoteEditing(true);
    setNotePreviewMode("edit");
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Note Record",
      content: "## Section Title\n\n- Add bullet list item\n- Click Edit to customize",
      folder: selectedFolder,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...notes, newNote];
    onSaveNotes(updated);
    setActiveNoteId(newNote.id);
    setNoteEditTitle(newNote.title);
    setNoteEditContent(newNote.content);
    setNoteEditFolder(newNote.folder);
    setIsNoteEditing(true);
    setNotePreviewMode("edit");
  };

  const handleSaveNote = () => {
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return {
          ...n,
          title: noteEditTitle,
          content: noteEditContent,
          folder: noteEditFolder,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return n;
    });
    onSaveNotes(updated);
    setIsNoteEditing(false);
    setNotePreviewMode("preview");
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Delete this note?")) {
      const remaining = notes.filter(n => n.id !== id);
      onSaveNotes(remaining);
      const fallback = remaining.find(n => n.folder === selectedFolder);
      setActiveNoteId(fallback ? fallback.id : "");
    }
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name) return;
    const entry: Contact = {
      id: `ct-${Date.now()}`,
      name: contactForm.name,
      email: contactForm.email || "",
      phone: contactForm.phone || "",
      designation: contactForm.designation || "",
      company: contactForm.company || "",
      category: contactForm.category as any || "Colleague"
    };
    onSaveContacts([...contacts, entry]);
    setIsAddingContact(false);
    setContactForm({ name: "", email: "", phone: "", designation: "", company: "", category: "Colleague" });
  };

  const handleDeleteContact = (id: string) => {
    if (confirm("Delete this contact?")) {
      onSaveContacts(contacts.filter(c => c.id !== id));
    }
  };

  const filteredNotes = notes.filter(n => n.folder === selectedFolder);
  
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(contactSearch.toLowerCase()) || 
                          c.company.toLowerCase().includes(contactSearch.toLowerCase()) ||
                          c.designation.toLowerCase().includes(contactSearch.toLowerCase());
    const matchesCat = contactCategory === "All" || c.category === contactCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="notes-contacts-pane">
      
      {/* Selector head tabs */}
      <div className="flex space-x-2 border-b border-neutral-100 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("notes")}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === "notes"
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
          }`}
        >
          Notion Workspace
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === "contacts"
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
          }`}
        >
          Contacts Book
        </button>
      </div>

      {/* NOTES TAB */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Note Folders pane */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Notebook Folders</h3>
              {["Personal", "Professional", "Learning", "Quick Capture"].map(folder => {
                const count = notes.filter(n => n.folder === folder).length;
                return (
                  <button
                    key={folder}
                    onClick={() => {
                      setSelectedFolder(folder as any);
                      const fallback = notes.find(n => n.folder === folder);
                      setActiveNoteId(fallback ? fallback.id : "");
                      setIsNoteEditing(false);
                    }}
                    className={`w-full p-2 text-left rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                      selectedFolder === folder
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20"
                        : "hover:bg-neutral-50 dark:hover:bg-zinc-900 text-neutral-600 dark:text-zinc-450"
                    }`}
                  >
                    <span className="flex items-center"><FolderClosed className="w-3.5 h-3.5 mr-2" /> {folder}</span>
                    <span className="text-[10px] bg-neutral-100 dark:bg-zinc-850 px-1.5 py-0.2 rounded-full font-bold">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Notes matching folder */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Documents</span>
                <button onClick={handleCreateNote} className="text-indigo-600 dark:text-indigo-400">
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 py-3 text-center">Empty notebook folder.</p>
                ) : (
                  filteredNotes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { setActiveNoteId(n.id); setIsNoteEditing(false); }}
                      className={`p-2 rounded-lg text-left cursor-pointer transition-all border text-xs relative group flex items-center justify-between ${
                        activeNoteId === n.id
                          ? "border-indigo-500 bg-indigo-50/20"
                          : "border-neutral-150 hover:bg-neutral-50 dark:border-zinc-850"
                      }`}
                    >
                      <div className="overflow-hidden pr-4">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">{n.title}</p>
                        <span className="text-[9px] text-neutral-400 font-mono">Updated: {n.updatedAt}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(n.id); }}
                        className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Note Editor and Markdown viewer sheet */}
          <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 min-h-[400px] flex flex-col justify-between">
            {activeNote ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-extrabold text-neutral-800 dark:text-neutral-100">
                      {isNoteEditing ? (
                        <input
                          type="text"
                          value={noteEditTitle}
                          onChange={e => setNoteEditTitle(e.target.value)}
                          className="border-b outline-none text-neutral-850 dark:text-neutral-100 text-base font-bold bg-transparent"
                        />
                      ) : activeNote.title}
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-mono">Updated {activeNote.updatedAt} • Folder: {activeNote.folder}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View/Edit Source Toggle buttons */}
                    <div className="flex items-center bg-neutral-100 dark:bg-zinc-800 p-0.5 rounded-lg border text-xs">
                      <button
                        onClick={() => setNotePreviewMode("preview")}
                        className={`p-1.5 rounded-md ${notePreviewMode === "preview" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-neutral-500"}`}
                        title="Preview markdown render"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setNotePreviewMode("edit"); setIsNoteEditing(true); }}
                        className={`p-1.5 rounded-md ${notePreviewMode === "edit" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-neutral-500"}`}
                        title="Edit raw text code"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isNoteEditing ? (
                      <button
                        onClick={startEditNote}
                        className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 rounded-lg font-semibold hover:bg-neutral-200"
                      >
                        Edit Workspace
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveNote}
                        className="text-xs px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500"
                      >
                        Save Page
                      </button>
                    )}
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex flex-col min-h-[250px]">
                  {notePreviewMode === "edit" ? (
                    <textarea
                      value={noteEditContent}
                      onChange={e => setNoteEditContent(e.target.value)}
                      className="w-full flex-1 p-3 border rounded-xl outline-none font-mono text-xs leading-relaxed bg-neutral-50/50 dark:bg-zinc-950/20"
                      placeholder="Start drafting inside your digital journal..."
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans select-text text-left">
                      <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-neutral-400 py-12">
                <FileText className="w-12 h-12 text-neutral-200 mb-3" />
                <p className="text-xs font-semibold">Select or compose a note to get started inside Notion OS.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-3 text-xs">
            
            {/* Search + filter panel */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search colleagues, clients..."
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  className="pl-8 p-2 text-xs border rounded-lg bg-white dark:bg-zinc-900 w-52 outline-none"
                />
              </div>

              <select
                value={contactCategory}
                onChange={e => setContactCategory(e.target.value as any)}
                className="p-2 text-xs border rounded-lg bg-white dark:bg-zinc-900"
              >
                <option value="All">All Classifications</option>
                <option value="Client">Clients</option>
                <option value="Colleague">Colleagues</option>
                <option value="Mentor">Mentors</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            {!isAddingContact && (
              <button
                onClick={() => setIsAddingContact(true)}
                className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg inline-flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
          </div>

          {isAddingContact && (
            <form onSubmit={handleAddContactSubmit} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-xl text-xs">
              <h3 className="font-bold">Register Colleague / Client details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Full Name</label>
                  <input type="text" value={contactForm.name || ""} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required className="w-full p-2 border bg-white rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Email Address</label>
                  <input type="email" value={contactForm.email || ""} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="w-full p-2 border bg-white rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Phone Code</label>
                  <input type="text" value={contactForm.phone || ""} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} className="w-full p-2 border bg-white rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Designation</label>
                  <input type="text" value={contactForm.designation || ""} onChange={e => setContactForm({ ...contactForm, designation: e.target.value })} className="w-full p-2 border bg-white rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Company</label>
                  <input type="text" value={contactForm.company || ""} onChange={e => setContactForm({ ...contactForm, company: e.target.value })} className="w-full p-2 border bg-white rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Category</label>
                  <select value={contactForm.category || "Colleague"} onChange={e => setContactForm({ ...contactForm, category: e.target.value as any })} className="w-full p-2 border bg-white rounded">
                    <option value="Colleague">Colleague</option>
                    <option value="Client">Client</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Emergency">Emergency Contact</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddingContact(false)} className="px-3 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold">Register Contact</button>
              </div>
            </form>
          )}

          {/* Directory Contact Cards list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="contacts-list-grid">
            {filteredContacts.map(c => (
              <div key={c.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between group relative">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteContact(c.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full font-bold w-8 h-8 flex items-center justify-center uppercase">
                      {c.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-700 dark:text-neutral-200">{c.name}</h4>
                      {c.designation && <p className="text-[10px] text-neutral-400">{c.designation} at {c.company}</p>}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-zinc-800 pt-2.5 space-y-1.5 text-[11px] text-neutral-500">
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center hover:text-indigo-600">
                        <Mail className="w-3 h-3 mr-1.5 shrink-0" /> <span className="truncate">{c.email}</span>
                      </a>
                    )}
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center hover:text-indigo-600">
                        <Phone className="w-3 h-3 mr-1.5 shrink-0" /> <span>{c.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      c.category === "Emergency" ? "bg-red-50 text-red-500" : c.category === "Client" ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {c.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
