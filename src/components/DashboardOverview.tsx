import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  ShieldAlert, Target, Award, Briefcase, FileSpreadsheet, 
  Sparkles, Database, FileUp, FileDown, Trash2, ArrowUpRight
} from "lucide-react";
import { LifeOSState } from "../types";

interface DashboardOverviewProps {
  state: LifeOSState;
  onNavigate: (tabId: string) => void;
  onImportData: (imported: LifeOSState) => void;
  onResetData: () => void;
}

export default function DashboardOverview({ 
  state, 
  onNavigate, 
  onImportData, 
  onResetData 
}: DashboardOverviewProps) {

  // Prepare chart data for Application Statuses
  const appStatusCount = state.applications.reduce((acc: Record<string, number>, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const applicationChartData = Object.entries(appStatusCount).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare chart data for Skills by Category
  const skillCategoryCount = state.skills.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const skillsChartData = Object.entries(skillCategoryCount).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#ef4444"];

  // Helper to parse file size string (e.g. "1.4 MB", "45 KB") to Bytes
  const parseSizeToBytes = (fileSizeStr: string): number => {
    if (!fileSizeStr) return 0;
    const match = fileSizeStr.match(/^([\d.]+)\s*(KB|MB|GB|B)?$/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2]?.toUpperCase();
      if (unit === "MB") return val * 1024 * 1024;
      if (unit === "GB") return val * 1024 * 1024 * 1024;
      if (unit === "KB") return val * 1024;
      return val;
    }
    return 0;
  };

  // Documents storage calculation
  const docsSize = 
    (state.documents || []).reduce((sum, d) => sum + parseSizeToBytes(d.fileSize), 0) +
    (state.vaultDocuments || []).reduce((sum, d) => sum + parseSizeToBytes(d.fileSize), 0);

  // Notes storage calculation (characters -> approx. bytes)
  const notesSize = (state.notes || []).reduce((sum, n) => {
    return sum + (n.title?.length || 0) + (n.content?.length || 0);
  }, 0);

  // Passwords storage calculation (estimate storage of fields in bytes)
  const passwordsSize = 
    (state.passwords || []).reduce((sum, p) => {
      return sum + (p.website?.length || 0) + (p.username?.length || 0) + (p.notes?.length || 0);
    }, 0) +
    (state.encryptedPasswords || []).reduce((sum, p) => {
      return sum + (p.serviceName?.length || 0) + (p.encryptedUsername?.length || 0) + (p.encryptedValue?.length || 0) + (p.encryptedNotes?.length || 0);
    }, 0);

  const totalBytes = docsSize + notesSize + passwordsSize;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const storageChartData = [
    { 
      name: "Documents", 
      value: docsSize, 
      count: (state.documents || []).length + (state.vaultDocuments || []).length,
      color: "#6366f1" 
    },
    { 
      name: "Notes", 
      value: notesSize, 
      count: (state.notes || []).length,
      color: "#10b981" 
    },
    { 
      name: "Passwords", 
      value: passwordsSize, 
      count: (state.passwords || []).length + (state.encryptedPasswords || []).length,
      color: "#f59e0b" 
    }
  ];

  // Backup data
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LifeOS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore data
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          // Check for a valid top-level schema check (e.g. profile, resumes exist)
          if (parsed && parsed.profile && parsed.resumes) {
            onImportData(parsed);
            alert("Database imported successfully! Your Life OS digital vault has been updated.");
          } else {
            alert("Invalid backup schema. Please ensure you import a valid Life OS export JSON file.");
          }
        } catch (err) {
          alert("Failed to parse JSON file. Ensure the file is uncorrupted.");
        }
      };
    }
  };

  // Calculations
  const completedGoals = state.goals.filter(g => g.completed).length;
  const totalGoals = state.goals.length;
  const activeContractsVal = state.freelancing.contracts
    .filter(c => c.status === "Active")
    .reduce((sum, curr) => sum + curr.value, 0);

  return (
    <div className="space-y-6" id="dashboard-overview-pane">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-neutral-900 text-white rounded-2xl p-6 relative overflow-hidden border border-indigo-900 shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-48 h-48 text-indigo-100" />
        </div>
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 text-indigo-300 font-semibold text-xs px-2.5 py-1 rounded-full border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Personal Hub Activated</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {state.profile.nickname || "User"}
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Your personal digital vault is optimized and secure. {state.documents.length} official documents are backed up, and your {state.projects.length} primary engineering projects are ready for sharing.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => onNavigate("ai")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-1.5"
            >
              <span>Query AI Copilot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportBackup}
              className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Backup Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance/Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-metric-grid">
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Total Skills Loaded</p>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{state.skills.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Active Applications</p>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {state.applications.filter(a => a.status !== "Rejected" && a.status !== "Offer").length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-lg text-pink-600 dark:text-pink-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Goals Completed</p>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {completedGoals} <span className="text-xs text-neutral-400 dark:text-neutral-500 font-normal">/ {totalGoals}</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Active Contract Value</p>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              ${activeContractsVal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-row">
        {/* Job Applications Pipeline Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Application Tracker Funnel
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline" onClick={() => onNavigate("applications")}>
              View Tracker →
            </span>
          </div>
          <div className="h-[240px]">
            {applicationChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                No job applications entered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#888" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {applicationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skills Category Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Skills Breakdown By Area
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline" onClick={() => onNavigate("skills")}>
              Manage Skills →
            </span>
          </div>
          <div className="h-[240px] flex items-center justify-center">
            {skillsChartData.length === 0 ? (
              <div className="text-xs text-neutral-400">No skills added yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {skillsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} fontSize={11} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Digital Vault Storage Allocation */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Vault Storage Allocation
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline" onClick={() => onNavigate("documents")}>
              Manage Vault →
            </span>
          </div>
          
          <div className="h-[180px] flex items-center justify-center relative">
            {totalBytes === 0 ? (
              <div className="text-xs text-neutral-400">Vault storage is empty.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {storageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatSize(Number(value)), "Storage"]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{formatSize(totalBytes)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-zinc-800 text-xs">
            {storageChartData.map((item) => {
              const percentage = totalBytes > 0 ? ((item.value / totalBytes) * 100).toFixed(1) : "0.0";
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.name}</span>
                    <span className="text-[10px] text-neutral-400">({item.count})</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-neutral-600 dark:text-neutral-300">{formatSize(item.value)}</span>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-400 font-semibold w-8 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Timeline log + Backup Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-lower-row">
        {/* Activity Timeline logs */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            OS Activity Log & Auditing
          </h2>
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2" id="activity-log-scroll">
            {state.activity.length === 0 ? (
              <div className="text-xs text-neutral-400 py-6 text-center">No recent activities logged in this vault session.</div>
            ) : (
              state.activity.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs border-b border-neutral-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                  <div className="px-2 py-1 bg-neutral-100 dark:bg-zinc-800 rounded font-semibold text-[10px] uppercase text-neutral-500 dark:text-neutral-400 shrink-0">
                    {act.module}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">[{act.action}]</span> {act.details}
                    </p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Database backup & clear container */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-neutral-400" />
              <span>Digital Vault Administration</span>
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
              Export your personal profile, credentials, and portfolios to a backup file, or restore an earlier configuration instantly.
            </p>
          </div>

          <div className="space-y-2.5 pt-4">
            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-between text-xs font-semibold px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all"
            >
              <span className="flex items-center space-x-2">
                <FileDown className="w-3.5 h-3.5" />
                <span>Export OS State Backup</span>
              </span>
              <span className="text-[9px] bg-neutral-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded font-mono text-neutral-500">.json</span>
            </button>

            <label className="w-full flex items-center justify-between text-xs font-semibold px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all cursor-pointer">
              <span className="flex items-center space-x-2">
                <FileUp className="w-3.5 h-3.5" />
                <span>Restore From File</span>
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
              />
              <span className="text-[9px] bg-neutral-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded font-mono text-neutral-500">upload</span>
            </label>

            <button
              onClick={() => {
                if (confirm("Are you absolutely sure you want to reset your entire Life OS dashboard? All changes will be wiped and restored to the factory template!")) {
                  onResetData();
                }
              }}
              className="w-full flex items-center space-x-2 text-xs font-semibold px-3 py-2 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Factory Default</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
