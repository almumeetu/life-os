import React, { useState } from "react";
import { 
  PlusCircle, Search, Calendar, Briefcase, Building, 
  Trash2, Edit, Save, RefreshCw, CheckCircle2, ChevronRight, X 
} from "lucide-react";
import { JobApplication } from "../types";

interface JobApplicationsHubProps {
  applications: JobApplication[];
  onSaveApplications: (updated: JobApplication[]) => void;
}

export default function JobApplicationsHub({ 
  applications, onSaveApplications 
}: JobApplicationsHubProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewDate, setInterviewDate] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");

  const statuses: JobApplication["status"][] = [
    "Applied", "HR Review", "Technical Interview", "Final Interview", "Offer", "Rejected"
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company,
      position,
      applicationDate: appDate,
      interviewDate: interviewDate || undefined,
      status
    };

    onSaveApplications([...applications, newApp]);
    resetForm();
  };

  const handleEdit = (app: JobApplication) => {
    setEditingId(app.id);
    setCompany(app.company);
    setPosition(app.position);
    setAppDate(app.applicationDate);
    setInterviewDate(app.interviewDate || "");
    setStatus(app.status);
    setIsAdding(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const updated = applications.map(app => {
      if (app.id === editingId) {
        return {
          ...app,
          company,
          position,
          applicationDate: appDate,
          interviewDate: interviewDate || undefined,
          status
        };
      }
      return app;
    });

    onSaveApplications(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this job application?")) {
      onSaveApplications(applications.filter(app => app.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setCompany("");
    setPosition("");
    setAppDate(new Date().toISOString().split('T')[0]);
    setInterviewDate("");
    setStatus("Applied");
  };

  const getStatusColor = (s: JobApplication["status"]) => {
    switch (s) {
      case "Offer": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
      case "Rejected": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
      case "Technical Interview":
      case "Final Interview": return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900";
      case "HR Review": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="job-applications-hub">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Job Applications Tracker</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Track interviews, review responses, and monitor pipeline health for active listings.</p>
        </div>
        
        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1.5 self-start sm:self-center transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Adding / Editing Modal Panel */}
      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-2xl shadow-md max-w-2xl text-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-neutral-700 dark:text-neutral-200">
              {editingId ? "Edit Job Application" : "Log New Job Application"}
            </h3>
            <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={editingId ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Company Name</label>
              <input 
                type="text" 
                placeholder="e.g. Linear" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                required 
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Position Role</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Engineer" 
                value={position} 
                onChange={e => setPosition(e.target.value)} 
                required 
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Application Date</label>
              <input 
                type="date" 
                value={appDate} 
                onChange={e => setAppDate(e.target.value)} 
                required 
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Interview Date (Optional)</label>
              <input 
                type="date" 
                value={interviewDate} 
                onChange={e => setInterviewDate(e.target.value)} 
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none" 
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-neutral-500">Pipeline Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 pt-3 border-t">
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-4 py-2 border rounded-xl text-neutral-500 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
              >
                {editingId ? "Update Record" : "Save Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 dark:bg-zinc-900/50 p-3 rounded-xl border text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search company or position..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-neutral-400 font-semibold shrink-0">Filter Status:</span>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto p-1.5 border bg-white dark:bg-zinc-900 rounded-lg outline-none"
          >
            <option value="All">All statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications list */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm text-xs">
        <div className="p-4 bg-neutral-50/50 dark:bg-zinc-900/50 border-b border-neutral-100 dark:border-zinc-800 font-bold text-neutral-600 dark:text-neutral-300">
          Job Board Directory ({filteredApps.length})
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-zinc-850">
          {filteredApps.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 font-semibold">
              No matching applications. Log a new job pursuit or adjust search terms.
            </div>
          ) : (
            filteredApps.map(app => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start space-x-3 text-left">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">{app.position}</h4>
                    <p className="text-neutral-500 font-medium flex items-center mt-0.5">
                      <Building className="w-3.5 h-3.5 mr-1" />
                      <span>{app.company}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px] text-neutral-400">
                      <span>Applied: {app.applicationDate}</span>
                      {app.interviewDate && (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Interview: {app.interviewDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEdit(app)}
                      className="p-1.5 border rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 dark:border-zinc-800"
                      title="Edit application"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 border rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-50 dark:border-zinc-800"
                      title="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
